const DB_NAME = 'studylib-file-storage';
const STORE_NAME = 'study-files';
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(
        new Error('This browser does not support persistent file storage.')
      );
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      reject(request.error || new Error('Could not open file storage.'));
    };
  });
}

function createFileKey() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

export async function saveStudyFile(file) {
  const database = await openDatabase();
  const key = createFileKey();

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(
        STORE_NAME,
        'readwrite'
      );

      transaction.objectStore(STORE_NAME).put(file, key);

      transaction.oncomplete = resolve;

      transaction.onerror = () => {
        reject(
          transaction.error || new Error('Could not save the file.')
        );
      };

      transaction.onabort = () => {
        reject(
          transaction.error || new Error('File save was cancelled.')
        );
      };
    });

    return key;
  } finally {
    database.close();
  }
}

export async function getStudyFile(key) {
  const database = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(
        STORE_NAME,
        'readonly'
      );

      const request = transaction.objectStore(STORE_NAME).get(key);

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };

      request.onerror = () => {
        reject(
          request.error || new Error('Could not read the stored file.')
        );
      };
    });
  } finally {
    database.close();
  }
}
