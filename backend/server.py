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
        parts = auth_header.split(" ")
        if len(parts) == 2 and parts[1] in TOKEN_STORE:
            return TOKEN_STORE[parts[1]]
    return None

def require_auth():
    user_id = get_current_user_id()
    if not user_id:
        return None, (jsonify({"success": False, "error": "Not authorized, valid token required"}), 401)
    return user_id, None

# ==================== AUTH ROUTES ====================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    email = str(data.get("email", "")).strip().lower()[:255]
    name = str(data.get("name", "")).strip()[:100]
    password = str(data.get("password", ""))

    if not email or not password or not name:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    if len(password) < 6 or len(password) > 128:
        return jsonify({"success": False, "error": "Password must be between 6 and 128 characters"}), 400

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
            "user": {"id": user_id, "email": email, "name": name, "token": token}
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Email already registered"}), 400
    finally:
        conn.close()

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = str(data.get("email", "")).strip().lower()[:255]
    password = str(data.get("password", ""))

    if len(password) > 128:
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
    finally:
        conn.close()

    # Strict check_password_hash only (no plaintext comparison)
    if user and check_password_hash(user["password"], password):
        token = secrets.token_hex(24)
        TOKEN_STORE[token] = user["id"]
        return jsonify({
            "success": True,
            "token": token,
            "user": {"id": user["id"], "email": user["email"], "name": user["name"], "token": token}
        })
    return jsonify({"success": False, "error": "Invalid email or password"}), 401


# ==================== NOTES ROUTES ====================

@app.route("/api/notes", methods=["GET", "POST"])
def handle_notes():
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()

    try:
        if request.method == "GET":
            cursor.execute("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
            notes = [dict(row) for row in cursor.fetchall()]
            return jsonify({"success": True, "notes": notes})

        elif request.method == "POST":
            data = request.json or {}
            note_id = str(data.get("id") or secrets.token_hex(12))[:64]
            title = str(data.get("title", "Untitled Note"))[:255]
            content = str(data.get("content", ""))
            category = str(data.get("category", "General"))[:50]

            cursor.execute(
                "INSERT OR REPLACE INTO notes (id, user_id, title, content, category, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
                (note_id, user_id, title, content, category)
            )
            conn.commit()
            return jsonify({"success": True, "message": "Note saved successfully", "note": {"id": note_id, "title": title, "content": content, "category": category}})
    finally:
        conn.close()


@app.route("/api/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM notes WHERE id = ? AND user_id = ?", (str(note_id)[:64], user_id))
        conn.commit()
        return jsonify({"success": True, "message": "Note deleted"})
    finally:
        conn.close()


# ==================== TODOS ROUTES ====================

@app.route("/api/todos", methods=["GET", "POST"])
def handle_todos():
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()

    try:
        if request.method == "GET":
            cursor.execute("SELECT * FROM todos WHERE user_id = ?", (user_id,))
            todos = [dict(row) for row in cursor.fetchall()]
            return jsonify({"success": True, "todos": todos})

        elif request.method == "POST":
            data = request.json or {}
            todo_id = str(data.get("id") or secrets.token_hex(12))[:64]
            text = str(data.get("text", "")).strip()[:500]
            if not text:
                return jsonify({"success": False, "error": "Todo text is required"}), 400

            completed = 1 if data.get("completed") else 0
            priority = str(data.get("priority", "medium"))[:20]
            due_date = str(data.get("due_date", ""))[:50]

            cursor.execute(
                "INSERT OR REPLACE INTO todos (id, user_id, text, completed, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)",
                (todo_id, user_id, text, completed, priority, due_date)
            )
            conn.commit()
            return jsonify({"success": True, "message": "Todo saved", "todo": {"id": todo_id, "text": text, "completed": bool(completed)}})
    finally:
        conn.close()


@app.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM todos WHERE id = ? AND user_id = ?", (str(todo_id)[:64], user_id))
        conn.commit()
        return jsonify({"success": True, "message": "Todo deleted"})
    finally:
        conn.close()


# ==================== SCHEDULE ROUTES ====================

@app.route("/api/schedule", methods=["GET", "POST"])
def handle_schedule():
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()

    try:
        if request.method == "GET":
            cursor.execute("SELECT * FROM schedules WHERE user_id = ? ORDER BY date ASC, time ASC", (user_id,))
            schedules = [dict(row) for row in cursor.fetchall()]
            return jsonify({"success": True, "schedules": schedules})

        elif request.method == "POST":
            data = request.json or {}
            title = str(data.get("title", "")).strip()[:255]
            if not title:
                return jsonify({"success": False, "error": "Schedule title is required"}), 400

            sch_id = str(data.get("id") or secrets.token_hex(12))[:64]
            date = str(data.get("date", ""))[:50]
            time = str(data.get("time", ""))[:50]
            description = str(data.get("description", ""))[:1000]

            cursor.execute(
                "INSERT OR REPLACE INTO schedules (id, user_id, title, date, time, description) VALUES (?, ?, ?, ?, ?, ?)",
                (sch_id, user_id, title, date, time, description)
            )
            conn.commit()
            return jsonify({"success": True, "message": "Schedule event saved"})
    finally:
        conn.close()


@app.route("/api/schedule/<sch_id>", methods=["DELETE"])
def delete_schedule(sch_id):
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM schedules WHERE id = ? AND user_id = ?", (str(sch_id)[:64], user_id))
        conn.commit()
        return jsonify({"success": True, "message": "Schedule event deleted"})
    finally:
        conn.close()


# ==================== POMODORO STATS ROUTES ====================

@app.route("/api/pomodoro/stats", methods=["GET", "POST"])
def handle_pomodoro_stats():
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()

    try:
        if request.method == "GET":
            cursor.execute("SELECT * FROM pomodoro_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
            row = cursor.fetchone()
            stats = dict(row) if row else {"sessions_completed": 4, "total_study_minutes": 100}
            return jsonify({"success": True, "stats": stats})

        elif request.method == "POST":
            data = request.json or {}
            try:
                sessions = min(1000, max(0, int(data.get("sessions_completed", 0))))
                minutes = min(100000, max(0, int(data.get("total_study_minutes", 0))))
            except (ValueError, TypeError):
                sessions = 0
                minutes = 0

            cursor.execute(
                "INSERT INTO pomodoro_stats (user_id, sessions_completed, total_study_minutes, date) VALUES (?, ?, ?, DATE('now'))",
                (user_id, sessions, minutes)
            )
            conn.commit()
            return jsonify({"success": True, "message": "Pomodoro stats recorded"})
    finally:
        conn.close()


# ==================== SUBJECTS & TOPICS ROUTES ====================

@app.route("/api/subjects", methods=["GET", "POST"])
def handle_subjects():
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()

    try:
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
            return jsonify({"success": True, "subjects": subjects})

        elif request.method == "POST":
            data = request.json or {}
            name = str(data.get("name", "")).strip()[:100]
            if not name:
                return jsonify({"success": False, "error": "Subject name is required"}), 400

            sub_id = str(data.get("id") or f"sub-{secrets.token_hex(6)}")[:64]
            color = str(data.get("color", "#3b82f6"))[:30]
            icon = str(data.get("icon", "BookOpen"))[:50]
            try:
                sort_order = int(data.get("sort_order", 0))
            except (ValueError, TypeError):
                sort_order = 0

            cursor.execute(
                "INSERT INTO subjects (id, user_id, name, color, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
                (sub_id, user_id, name, color, icon, sort_order)
            )
            conn.commit()
            return jsonify({"success": True, "subject": {"id": sub_id, "name": name, "color": color, "icon": icon, "topic_count": 0}}), 201
    finally:
        conn.close()


@app.route("/api/topics", methods=["GET", "POST"])
def handle_topics():
    user_id, err_resp = require_auth()
    if err_resp:
        return err_resp

    conn = get_db()
    cursor = conn.cursor()

    try:
        if request.method == "GET":
            subject_id = request.args.get("subject_id")
            if subject_id:
                cursor.execute("SELECT * FROM topics WHERE user_id = ? AND subject_id = ? ORDER BY serial_number ASC", (user_id, str(subject_id)[:64]))
            else:
                cursor.execute("SELECT * FROM topics WHERE user_id = ? ORDER BY serial_number ASC", (user_id,))
            
            topics = []
            for row in cursor.fetchall():
                d = dict(row)
                try:
                    d["checklist"] = json.loads(d.get("checklist") or "[]")
                    d["tags"] = json.loads(d.get("tags") or "[]")
                except Exception:
                    d["checklist"] = []
                    d["tags"] = []
                topics.append(d)
            return jsonify({"success": True, "topics": topics})

        elif request.method == "POST":
            data = request.json or {}
            subject_id = str(data.get("subjectId") or data.get("subject_id") or "")[:64]
            if not subject_id:
                return jsonify({"success": False, "error": "Subject ID is required"}), 400

            # Verify subject ownership
            cursor.execute("SELECT id FROM subjects WHERE id = ? AND user_id = ?", (subject_id, user_id))
            if not cursor.fetchone():
                return jsonify({"success": False, "error": "Subject not found or unauthorized"}), 404

            title = str(data.get("title", "")).strip()[:255]
            if not title:
                return jsonify({"success": False, "error": "Topic title is required"}), 400

            top_id = str(data.get("id") or f"top-{secrets.token_hex(6)}")[:64]
            try:
                serial = int(data.get("serialNumber") or data.get("serial_number", 1))
            except (ValueError, TypeError):
                serial = 1

            status = str(data.get("status", "not_started"))[:50]
            try:
                progress = min(100, max(0, int(data.get("progress", 0))))
            except (ValueError, TypeError):
                progress = 0

            checklist = json.dumps(data.get("checklist", []) if isinstance(data.get("checklist"), list) else [])
            tags = json.dumps(data.get("tags", []) if isinstance(data.get("tags"), list) else [])
            note = str(data.get("note", ""))[:10000]

            cursor.execute(
                """INSERT INTO topics (id, user_id, subject_id, serial_number, title, status, progress, checklist, tags, note)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (top_id, user_id, subject_id, serial, title, status, progress, checklist, tags, note)
            )
            conn.commit()
            return jsonify({"success": True, "topic": {"id": top_id, "subject_id": subject_id, "title": title, "status": status}}), 201
    finally:
        conn.close()


# ==================== AI ASSISTANT & ANALYTICS ====================

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    data = request.json or {}
    prompt = str(data.get("prompt", "")).strip()

    if not prompt:
        return jsonify({"success": False, "error": "Prompt is required"}), 400

    if len(prompt) > 5000:
        return jsonify({"success": False, "error": "Prompt exceeds maximum allowed length"}), 400

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
