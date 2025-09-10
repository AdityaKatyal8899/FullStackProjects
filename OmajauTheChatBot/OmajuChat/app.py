from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
from bson import ObjectId
import json
from flask_cors import CORS
import jwt
from functools import wraps
import requests

# ✅ Correct Gemini import
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your-secret-key-change-this")
CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5001"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

# Database setup
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["ChatApp"]
conversations = db["conversations"]

# Gemini setup
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = "gemini-1.5-flash"

chat_model = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL,
    temperature=0.7,
    google_api_key=GOOGLE_API_KEY
)

# ✅ Custom JSON Encoder for ObjectId and datetime
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

app.json_encoder = JSONEncoder

# Authentication middleware
def verify_token(token):
    """Verify JWT token from the signup backend"""
    try:
        # For now, we'll verify by making a request to the auth backend
        auth_backend_url = "http://localhost:5001/api/auth/profile"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(auth_backend_url, headers=headers)
        
        if response.status_code == 200:
            return response.json().get("data", {}).get("user")
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({"error": "Invalid authorization header format"}), 401
        
        if not token:
            return jsonify({"error": "Authentication token is required"}), 401
        
        # Verify token
        user = verify_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        # Add user info to request context
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

# Root endpoint
@app.route("/")
def home():
    return jsonify({"message": "Welcome to Flask Backend!"})

# Chat endpoint
@app.route("/chat", methods=["POST"])
@require_auth
def chat():
    data = request.get_json()
    session_id = data.get("session_id")
    user_message = data.get("message")

    if not session_id or not user_message:
        return jsonify({"error": "session_id and message are required"}), 400

    # Save user message
    user_doc = {"role": "user", "content": user_message, "timestamp": datetime.utcnow()}
    conversations.update_one(
        {"session_id": session_id},
        {"$push": {"messages": user_doc}, "$setOnInsert": {"session_id": session_id, "created_at": datetime.utcnow()}},
        upsert=True
    )

    # Fetch last 20 messages for context
    conversation_doc = conversations.find_one({"session_id": session_id})
    recent_msgs = conversation_doc.get("messages", [])[-20:]

    # Prepare messages for LangChain
    history = []
    for msg in recent_msgs:
        if msg["role"] == "user":
            history.append(HumanMessage(content=msg["content"]))
        else:
            history.append(SystemMessage(content=msg["content"]))

    # Add identity context
    identity = SystemMessage(content="Your name is Omaju, a fun and friendly AI ChatBOT, created by Aditya Katyal. Don't specify it every time; mention it only if user asks.")
    full_history = [identity] + history

    # Generate AI response
    try:
        agent_msg = chat_model.invoke(full_history)
        agent_response = agent_msg.content
    except Exception as e:
        print("GenAI invocation error:", e)
        agent_response = "Sorry, I am having trouble generating a response."

    # Save AI response
    ai_doc = {"role": "assistant", "content": agent_response, "timestamp": datetime.utcnow()}
    conversations.update_one({"session_id": session_id}, {"$push": {"messages": ai_doc}})

    return jsonify({"response": agent_response})

# Fetch conversation by session
@app.route("/messages/<session_id>", methods=["GET"])
@require_auth
def get_messages(session_id):
    conversation_doc = conversations.find_one({"session_id": session_id})
    if not conversation_doc:
        # New session → create it with Omaju's greeting
        greeting = {
            "role": "assistant",
            "content": "Hey! I am **Omaju**, your buddy for lone times. How may I help?",
            "timestamp": datetime.utcnow()
        }
        conversations.insert_one({
            "session_id": session_id,
            "created_at": datetime.utcnow(),
            "messages": [greeting]
        })
        return jsonify({
            "session_id": session_id,
            "created_at": datetime.utcnow().isoformat(),
            "messages": [greeting]
        })
    return jsonify(conversation_doc)

# Clear a session's messages
@app.route("/clear/<session_id>", methods=["POST"])
@require_auth
def clear_messages(session_id):
    conversations.delete_one({"session_id": session_id})
    return jsonify({"message": f"Session {session_id} cleared!"})

# Get user profile endpoint
@app.route("/profile", methods=["GET"])
@require_auth
def get_user_profile():
    """Get current user profile information"""
    user = request.current_user
    return jsonify({
        "success": True,
        "data": {
            "user": user
        }
    })

# Health check
@app.route("/health", methods=["GET"])
def health():
    try:
        client.admin.command('ping')
        mongo_status = "connected"
    except Exception as e:
        mongo_status = f"disconnected ({str(e)})"

    gemini_status = "configured" if GOOGLE_API_KEY else "not configured"

    return jsonify({
        "status": "healthy" if mongo_status == "connected" else "unhealthy",
        "mongodb": mongo_status,
        "genai": gemini_status,
        "timestamp": datetime.utcnow().isoformat()
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
