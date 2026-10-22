import os
from flask import Flask, request, jsonify
from flask_cors import CORS
# For Gemini API: pip install google-genai
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)

# Initialize Gemini Client (Ensure GEMINI_API_KEY is set in your environment variables)
# client = genai.Client()
# Or pass API key directly:
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "your_api_key_here"))

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """
    Handles AI Assistant chat queries, note summarization, and study assistance.
    Expects JSON: { "prompt": "...", "notesContext": [...] }
    """
    data = request.json or {}
    prompt = data.get("prompt", "")
    notes_context = data.get("notesContext", [])

    if not prompt or not isinstance(prompt, str) or not prompt.strip():
        return jsonify({"error": "Valid prompt string is required"}), 400

    if len(prompt) > 5000:
        return jsonify({"error": "Prompt exceeds maximum allowed length of 5000 characters"}), 400

    prompt = prompt.strip()

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
    """
    Analyzes student study metrics and provides actionable AI coaching insights.
    Expects JSON: { "stats": { "sessionsCompleted": 5, "totalStudyHours": 4.5, "tasksCompleted": 12, "masteryScore": "78%" } }
    """
    data = request.json or {}
    stats = data.get("stats", {})

    if not stats:
        return jsonify({"error": "Stats data is required"}), 400

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
        print(f"[AI Service Error]: {e}")
        return jsonify({
            "success": False,
            "error": "AI service encountered an error processing your request"
        }), 500


if __name__ == "__main__":
    print("Starting Notie Python AI Backend on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=False)
