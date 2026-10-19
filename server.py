import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from database import init_db, get_db

app = Flask(__name__)
CORS(app)

# Initialize Database on Startup
init_db()

# Initialize Gemini AI Client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "your_api_key_here"))

# ==================== AUTH ROUTES ====================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    email = data.get("email")
    name = data.get("name")
    password = data.get("password")

    if not email or not password or not name:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
            (email, name, password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return jsonify({"success": True, "user": {"id": user_id, "email": email, "name": name}})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Email already registered"}), 400
    finally:
        conn.close()

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (email, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({
            "success": True,
            "user": {"id": user["id"], "email": user["email"], "name": user["name"]}
        })
    return jsonify({"success": False, "error": "Invalid email or password"}), 401


# ==================== NOTES ROUTES ====================

@app.route("/api/notes", methods=["GET", "POST"])
def handle_notes():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM notes ORDER BY updated_at DESC")
        notes = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "notes": notes})

    elif request.method == "POST":
        data = request.json or {}
        note_id = data.get("id")
        title = data.get("title", "Untitled Note")
        content = data.get("content", "")
        category = data.get("category", "General")

        cursor.execute(
            "INSERT OR REPLACE INTO notes (id, title, content, category, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
            (note_id, title, content, category)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Note saved successfully"})


@app.route("/api/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Note deleted"})


# ==================== TODOS ROUTES ====================

@app.route("/api/todos", methods=["GET", "POST"])
def handle_todos():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM todos")
        todos = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "todos": todos})

    elif request.method == "POST":
        data = request.json or {}
        todo_id = data.get("id")
        text = data.get("text")
        completed = 1 if data.get("completed") else 0
        priority = data.get("priority", "medium")
        due_date = data.get("due_date", "")

        cursor.execute(
            "INSERT OR REPLACE INTO todos (id, text, completed, priority, due_date) VALUES (?, ?, ?, ?, ?)",
            (todo_id, text, completed, priority, due_date)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Todo saved"})


@app.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Todo deleted"})


# ==================== SCHEDULE ROUTES ====================

@app.route("/api/schedule", methods=["GET", "POST"])
def handle_schedule():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM schedules")
        schedules = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "schedules": schedules})

    elif request.method == "POST":
        data = request.json or {}
        sch_id = data.get("id")
        title = data.get("title")
        date = data.get("date")
        time = data.get("time")
        description = data.get("description", "")

        cursor.execute(
            "INSERT OR REPLACE INTO schedules (id, title, date, time, description) VALUES (?, ?, ?, ?, ?)",
            (sch_id, title, date, time, description)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Schedule event saved"})


@app.route("/api/schedule/<sch_id>", methods=["DELETE"])
def delete_schedule(sch_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM schedules WHERE id = ?", (sch_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Schedule event deleted"})


# ==================== POMODORO STATS ROUTES ====================

@app.route("/api/pomodoro/stats", methods=["GET", "POST"])
def handle_pomodoro_stats():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM pomodoro_stats ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        stats = dict(row) if row else {"sessions_completed": 4, "total_study_minutes": 100}
        return jsonify({"success": True, "stats": stats})

    elif request.method == "POST":
        data = request.json or {}
        sessions = data.get("sessions_completed", 0)
        minutes = data.get("total_study_minutes", 0)

        cursor.execute(
            "INSERT INTO pomodoro_stats (sessions_completed, total_study_minutes, date) VALUES (?, ?, DATE('now'))",
            (sessions, minutes)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Pomodoro stats recorded"})


# ==================== AI ASSISTANT & ANALYTICS ====================

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    data = request.json or {}
    prompt = data.get("prompt", "")
    notes_context = data.get("notesContext", [])

    if not prompt:
        return jsonify({"success": False, "error": "Prompt is required"}), 400

    try:
        system_instruction = (
            "You are Notie AI, an expert study coach and personal assistant embedded in the Notie student productivity app. "
            "Help the user with notes, summaries, study schedules, and exam preparation. "
            "Be encouraging, structured, and concise."
        )

        full_prompt = f"User Notes Context:\n{notes_context}\n\nUser Request: {prompt}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
        )

        return jsonify({
            "success": True,
            "reply": response.text
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/ai/analytics-insights", methods=["POST"])
def analytics_insights():
    data = request.json or {}
    stats = data.get("stats", {})

    try:
        system_instruction = (
            "You are an expert academic data coach. Analyze the student's study metrics and provide "
            "3 short, punchy, actionable bullet points of encouragement and productivity advice."
        )

        prompt = f"Here are the student's latest performance stats:\n{stats}\n\nProvide insightful coaching advice."

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.5,
            ),
        )

        return jsonify({
            "success": True,
            "insights": response.text
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    print("Starting Notie Unified Backend Server on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=True)
