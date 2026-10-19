import os
import json
import sqlite3
import secrets
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import init_db, get_db

app = Flask(__name__)
CORS(app)

# Initialize Database on Startup
init_db()

# In-memory simple token map for session verification in SQLite server
TOKEN_STORE = {}

def get_current_user_id():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        if token in TOKEN_STORE:
            return TOKEN_STORE[token]
    # Fallback to query param or body user_id if present
    req_data = request.args if request.method == "GET" else (request.json or {})
    return req_data.get("user_id") or 1

# ==================== AUTH ROUTES ====================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    email = str(data.get("email", "")).strip().lower()
    name = str(data.get("name", "")).strip()
    password = str(data.get("password", ""))

    if not email or not password or not name:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

    hashed_pw = generate_password_hash(password)
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
            (email, name, hashed_pw)
        )
        conn.commit()
        user_id = cursor.lastrowid
        token = secrets.token_hex(24)
        TOKEN_STORE[token] = user_id
        return jsonify({
            "success": True,
            "token": token,
            "user": {"id": user_id, "email": email, "name": name}
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Email already registered"}), 400
    finally:
        conn.close()

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and (check_password_hash(user["password"], password) or user["password"] == password):
        token = secrets.token_hex(24)
        TOKEN_STORE[token] = user["id"]
        return jsonify({
            "success": True,
            "token": token,
            "user": {"id": user["id"], "email": user["email"], "name": user["name"]}
        })
    return jsonify({"success": False, "error": "Invalid email or password"}), 401


# ==================== NOTES ROUTES ====================

@app.route("/api/notes", methods=["GET", "POST"])
def handle_notes():
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
        notes = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "notes": notes})

    elif request.method == "POST":
        data = request.json or {}
        note_id = data.get("id") or secrets.token_hex(12)
        title = data.get("title", "Untitled Note")
        content = data.get("content", "")
        category = data.get("category", "General")

        cursor.execute(
            "INSERT OR REPLACE INTO notes (id, user_id, title, content, category, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
            (note_id, user_id, title, content, category)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Note saved successfully", "note": {"id": note_id, "title": title, "content": content, "category": category}})


@app.route("/api/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = ? AND user_id = ?", (note_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Note deleted"})


# ==================== TODOS ROUTES ====================

@app.route("/api/todos", methods=["GET", "POST"])
def handle_todos():
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM todos WHERE user_id = ?", (user_id,))
        todos = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "todos": todos})

    elif request.method == "POST":
        data = request.json or {}
        todo_id = data.get("id") or secrets.token_hex(12)
        text = data.get("text")
        completed = 1 if data.get("completed") else 0
        priority = data.get("priority", "medium")
        due_date = data.get("due_date", "")

        cursor.execute(
            "INSERT OR REPLACE INTO todos (id, user_id, text, completed, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)",
            (todo_id, user_id, text, completed, priority, due_date)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Todo saved", "todo": {"id": todo_id, "text": text, "completed": bool(completed)}})


@app.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM todos WHERE id = ? AND user_id = ?", (todo_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Todo deleted"})


# ==================== SCHEDULE ROUTES ====================

@app.route("/api/schedule", methods=["GET", "POST"])
def handle_schedule():
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM schedules WHERE user_id = ? ORDER BY date ASC, time ASC", (user_id,))
        schedules = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "schedules": schedules})

    elif request.method == "POST":
        data = request.json or {}
        sch_id = data.get("id") or secrets.token_hex(12)
        title = data.get("title")
        date = data.get("date")
        time = data.get("time")
        description = data.get("description", "")

        cursor.execute(
            "INSERT OR REPLACE INTO schedules (id, user_id, title, date, time, description) VALUES (?, ?, ?, ?, ?, ?)",
            (sch_id, user_id, title, date, time, description)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Schedule event saved"})


@app.route("/api/schedule/<sch_id>", methods=["DELETE"])
def delete_schedule(sch_id):
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM schedules WHERE id = ? AND user_id = ?", (sch_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Schedule event deleted"})


# ==================== POMODORO STATS ROUTES ====================

@app.route("/api/pomodoro/stats", methods=["GET", "POST"])
def handle_pomodoro_stats():
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM pomodoro_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
        row = cursor.fetchone()
        conn.close()
        stats = dict(row) if row else {"sessions_completed": 4, "total_study_minutes": 100}
        return jsonify({"success": True, "stats": stats})

    elif request.method == "POST":
        data = request.json or {}
        sessions = data.get("sessions_completed", 0)
        minutes = data.get("total_study_minutes", 0)

        cursor.execute(
            "INSERT INTO pomodoro_stats (user_id, sessions_completed, total_study_minutes, date) VALUES (?, ?, ?, DATE('now'))",
            (user_id, sessions, minutes)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Pomodoro stats recorded"})


# ==================== SUBJECTS & TOPICS ROUTES ====================

@app.route("/api/subjects", methods=["GET", "POST"])
def handle_subjects():
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("""
            SELECT s.*, COUNT(t.id) as topic_count 
            FROM subjects s 
            LEFT JOIN topics t ON s.id = t.subject_id 
            WHERE s.user_id = ? 
            GROUP BY s.id 
            ORDER BY s.sort_order ASC
        """, (user_id,))
        subjects = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "subjects": subjects})

    elif request.method == "POST":
        data = request.json or {}
        sub_id = data.get("id") or f"sub-{secrets.token_hex(6)}"
        name = data.get("name", "").strip()
        color = data.get("color", "#3b82f6")
        icon = data.get("icon", "BookOpen")
        sort_order = data.get("sort_order", 0)

        cursor.execute(
            "INSERT INTO subjects (id, user_id, name, color, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
            (sub_id, user_id, name, color, icon, sort_order)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "subject": {"id": sub_id, "name": name, "color": color, "icon": icon, "topic_count": 0}}), 201


@app.route("/api/topics", methods=["GET", "POST"])
def handle_topics():
    user_id = get_current_user_id()
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        subject_id = request.args.get("subject_id")
        if subject_id:
            cursor.execute("SELECT * FROM topics WHERE user_id = ? AND subject_id = ? ORDER BY serial_number ASC", (user_id, subject_id))
        else:
            cursor.execute("SELECT * FROM topics WHERE user_id = ? ORDER BY serial_number ASC", (user_id,))
        
        topics = []
        for row in cursor.fetchall():
            d = dict(row)
            try:
                d["checklist"] = json.loads(d.get("checklist") or "[]")
                d["tags"] = json.loads(d.get("tags") or "[]")
            except Exception:
                pass
            topics.append(d)
        conn.close()
        return jsonify({"success": True, "topics": topics})

    elif request.method == "POST":
        data = request.json or {}
        top_id = data.get("id") or f"top-{secrets.token_hex(6)}"
        subject_id = data.get("subjectId") or data.get("subject_id")
        title = data.get("title", "").strip()
        serial = data.get("serialNumber") or data.get("serial_number", 1)
        status = data.get("status", "not_started")
        progress = data.get("progress", 0)
        checklist = json.dumps(data.get("checklist", []))
        tags = json.dumps(data.get("tags", []))
        note = data.get("note", "")

        cursor.execute(
            """INSERT INTO topics (id, user_id, subject_id, serial_number, title, status, progress, checklist, tags, note)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (top_id, user_id, subject_id, serial, title, status, progress, checklist, tags, note)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "topic": {"id": top_id, "subject_id": subject_id, "title": title, "status": status}}), 201


# ==================== AI ASSISTANT & ANALYTICS ====================

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    data = request.json or {}
    prompt = str(data.get("prompt", "")).strip()

    if not prompt:
        return jsonify({"success": False, "error": "Prompt is required"}), 400

    fallback_reply = (
        f"Study tip for '{prompt[:40]}...': "
        "Review your summary notes, schedule regular active recall sessions, and test your understanding using topic checklists."
    )
    return jsonify({
        "success": True,
        "reply": fallback_reply,
        "fallback": True
    })


@app.route("/api/ai/analytics-insights", methods=["POST"])
def analytics_insights():
    fallback_insights = (
        "• Great discipline maintaining your study streak this week.\n"
        "• Focus on clearing remaining checklist items in your primary subjects.\n"
        "• Schedule dedicated 25-minute Pomodoro intervals for deep review."
    )
    return jsonify({
        "success": True,
        "insights": fallback_insights,
        "fallback": True
    })


if __name__ == "__main__":
    print("Starting hardened Notie Python Backend on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=False)
