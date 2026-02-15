
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
# In a production environment, you would want to restrict the origins.
# For this example, we allow all.
CORS(app)

# --- IMPORTANT ---
# CREDENTIALS SETUP
# -----------------
# 1. For Google Cloud Run Deployment:
#    The service account associated with your Cloud Run service needs the
#    "Cloud Datastore User" or "Editor" IAM role in your GCP project
#    to access Firestore. No code changes are needed.
#
# 2. For Local Development:
#    a. Go to your Firebase Project Settings > Service accounts.
#    b. Click "Generate new private key" to download a JSON file.
#    c. RENAME the downloaded file to `serviceAccountKey.json`.
#    d. PLACE this file in the same directory as this `main.py` file.
# -----------------

# Initialize Firebase Admin SDK
try:
    # On Google Cloud Run, Application Default Credentials will be used automatically.
    firebase_admin.initialize_app()
    print("Firebase Admin SDK initialized using Application Default Credentials.")
except Exception as e:
    print(f"Failed to initialize Firebase with default credentials: {e}")
    # Fallback for local development using a service account key file.
    if os.path.exists('serviceAccountKey.json'):
        try:
            cred = credentials.Certificate('serviceAccountKey.json')
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized using local serviceAccountKey.json.")
        except Exception as e_local:
            print(f"FATAL: Failed to initialize Firebase with local key: {e_local}")
    else:
        print("FATAL: No Firebase credentials found. Backend database will not work.")
        print("       Read the 'CREDENTIALS SETUP' section in main.py for instructions.")


db = None
availability_ref = None
try:
    db = firestore.client()
    availability_ref = db.collection('squadsync').document('availability')
except Exception as e:
    print(f"Error getting Firestore client: {e}. The app will not be able to connect to the database.")


@app.route('/api/availability', methods=['GET'])
def get_availability():
    if not availability_ref:
        return jsonify({"error": "Firestore not initialized. Check backend server logs for credential errors."}), 500
    try:
        doc = availability_ref.get()
        if doc.exists:
            return jsonify(doc.to_dict())
        else:
            # If no data exists, return an empty object.
            # The frontend will then initialize and POST the data.
            return jsonify({})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/availability', methods=['POST'])
def update_availability():
    if not availability_ref:
        return jsonify({"error": "Firestore not initialized. Check backend server logs for credential errors."}), 500
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid data"}), 400
        availability_ref.set(data)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))
