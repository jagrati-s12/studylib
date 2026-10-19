import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "notie.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Notes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            title TEXT NOT NULL,
            content TEXT,
            category TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Todos table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            text TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            priority TEXT DEFAULT 'medium',
            due_date TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Schedules table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schedules (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            title TEXT NOT NULL,
            date TEXT,
            time TEXT,
            description TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Pomodoro Stats table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pomodoro_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT,
            sessions_completed INTEGER DEFAULT 0,
            total_study_minutes INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Subjects table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#3b82f6',
            icon TEXT DEFAULT 'BookOpen',
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Topics table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS topics (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            subject_id TEXT NOT NULL,
            serial_number INTEGER DEFAULT 1,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'not_started',
            progress INTEGER DEFAULT 0,
            checklist TEXT DEFAULT '[]',
            tags TEXT DEFAULT '[]',
            note TEXT DEFAULT '',
            due_date TEXT,
            parent_topic_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (subject_id) REFERENCES subjects (id)
        )
    """)

    # Materials table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS materials (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            topic_id TEXT NOT NULL,
            folder_id TEXT,
            material_type TEXT DEFAULT 'pdf',
            title TEXT NOT NULL,
            storage_key TEXT NOT NULL,
            url TEXT NOT NULL,
            mime_type TEXT,
            file_size_bytes INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
    """)

    # Folders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            topic_id TEXT NOT NULL,
            parent_folder_id TEXT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
    """)

    # Digital Notes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS digital_notes (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            topic_id TEXT NOT NULL,
            title TEXT DEFAULT 'Digital Note',
            content TEXT DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
    """)

    # Workspace Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workspace_settings (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            topic_id TEXT NOT NULL,
            layout TEXT DEFAULT 'single',
            left_material_id TEXT,
            right_material_id TEXT,
            left_page INTEGER DEFAULT 1,
            right_page INTEGER DEFAULT 1,
            left_zoom INTEGER DEFAULT 100,
            right_zoom INTEGER DEFAULT 100,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized successfully with Study Library schema in backend folder.")

if __name__ == "__main__":
    init_db()
