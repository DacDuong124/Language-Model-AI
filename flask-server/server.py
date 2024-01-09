from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import text_correction

import json
import datetime
# from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
#                                unset_jwt_cookies, jwt_required, JWTManager
                               
import firebase_admin

from firebase_admin import credentials, auth, firestore, initialize_app
from google.cloud import storage

app = Flask(__name__)
# help(firebase_admin.auth)

##AI API backend
#####################
CORS(app, origins="http://localhost:3000")

@app.route("/generate_code", methods=["POST"])  # Change method to POST
def generate_code():
    try:
        # Get data from the JSON request sent by the frontend
        data = request.json
        prompts = data.get("prompts", [])

        if not prompts:
            return jsonify({"error": "No prompts provided"}), 400

        # Define the API endpoint
        api_url = "https://polite-horribly-cub.ngrok-free.app/generate_code"

        # Send the GET request with the prompts
        response = requests.get(api_url, params=[("prompts", prompt) for prompt in prompts])
        

        # Check the status code and response content
        if response.status_code == 200:
            generated_code_list = response.json()
            for i, code in enumerate(generated_code_list):
                print(f"Generated Python Code for prompt {i + 1}:")
                print(code)
            # return jsonify({"message": "Code generation successful"})
            return jsonify({"generated_code": generated_code_list})

        else:
            print("Failed to retrieve code. Status code:", response.status_code)
            return jsonify({"error": "Failed to retrieve code"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
#####################



# Login Authentication Backend
#####################
# app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
# jwt = JWTManager(app)
# app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

FIREBASE_WEB_API_KEY = 'AIzaSyD41gPBqyZpRdKGkvF8vt5NCS-X7nrPZ5c'


# app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=5)

# Register Backend

# Configure Firebase Admin SDK
cred = credentials.Certificate("language-ai-model-firebase-adminsdk-l4hgq-1c59e87bd8.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route('/register', methods=["POST"])
def register():
    try:
        data = request.json

        # Check if request.json is not None and has 'email' and 'password'
        if data and isinstance(data, dict) and 'email' in data and 'password' in data:
            email = data['email']
            password = data['password']

            # Create a user in Firebase Authentication
            user = auth.create_user(email=email, password=password)
            
            
            # Prepare user data for Firestore
            user_data = {
                "email": user.email,
                "role": "user",  # default role
                "status": "active",
                "registered_on": firestore.SERVER_TIMESTAMP,
            }
            
            # Create a new document for the user in the 'users' collection
            db.collection('users').document(user.uid).set(user_data)

            # You can customize the user creation response as needed
            response_body = {
                "user_id": user.uid,
                "email": user.email,
                "role": "user",  # default role
                "status": "active",
                "msg": "User registration successful",
            }

            return jsonify(response_body), 201
        else:
            return jsonify({"error": "Invalid JSON data or missing 'email' or 'password'"}), 400

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    



def verify_firebase_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print("Detailed error verifying Firebase token:", str(e))
        return None

# @app.route('/login', methods=["POST"])
# def login():
#     data = request.json
#     email = data.get('email')
#     password = data.get('password')

#     if not email or not password:
#         return jsonify({"error": "Email and password are required"}), 400

#     try:
#         # Attempt to sign in the user with the provided credentials
#         user = auth.get_user_by_email(email)
#         # You can add additional checks here (e.g., verify password if needed)
#         return jsonify({"message": "Login successful", "user_id": user.uid}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 401

@app.route("/profile", methods=["GET", "PATCH"])
def profile():
    # Extract the token from the Authorization header
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    decoded_token = verify_firebase_token(token)

    if not decoded_token:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_uid = decoded_token['uid']
    print(user_uid)

    if request.method == 'GET':
        try:
            # Fetch user data from Firebase Authentication using UID
            user = auth.get_user(user_uid)

            # Reference to the Firestore user's document
            user_ref = firestore.client().collection('users').document(user.uid)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
            else:
                
                 # Split the displayName to get firstName and lastName
                full_name = user.display_name.split()
                first_name = full_name[0] if full_name else ''
                last_name = full_name[-1] if len(full_name) > 1 else ''
                # Create a new document with default values
                user_data = {
                    "email": user.email,
                    "firstName": first_name,
                    "lastName": last_name,
                    "role": "user",  # Set default role
                    "status": "active",
                    # Set 'registered_on' to current time
                    "registered_on": datetime.datetime.now(datetime.timezone.utc).isoformat()

                }
                user_ref.set(user_data)

            # Construct the response data
            response_data = {
                "uid": user.uid,
                "email": user.email,
                "firstName": user_data.get("firstName", ""),
                "lastName": user_data.get("lastName", ""),
                "role": user_data.get("role", ""),  
                "status": user_data.get("status", ""),
                "registered_on": user_data.get("registered_on"),
            }
            return jsonify(response_data), 200

        except firebase_admin.auth.UserNotFoundError:
            return jsonify({"error": f"No user record found for the provided user ID: {user_uid}"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'PATCH':
        try:
            data = request.json
            # Fetch user data from Firebase Authentication using email
            user = auth.get_user(user_uid)

            # Reference to the Firestore user's document using UID
            user_ref = firestore.client().collection('users').document(user.uid)

            # Perform the update operation in Firestore
            updates = {}
            if 'firstName' in data:
                updates['firstName'] = data['firstName']
            if 'lastName' in data:
                updates['lastName'] = data['lastName']
            # Only allow updates to 'role' and 'status' if the user has admin privileges
            # if is_admin(user_uid) and 'role' in data:  # Implement your own is_admin check
            #     updates['role'] = data['role']
            # if is_admin(user_uid) and 'status' in data:  # Implement your own is_admin check
            #     updates['status'] = data['status']
            if updates:
                user_ref.update(updates)
                return jsonify({"message": "Profile updated successfully"}), 200
            else:
                return jsonify({"message": "No updates provided"}), 400

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    else:
        return jsonify({"error": "Method not allowed"}), 405
#####################


# Initialize a storage client
storage_client = storage.Client()
# Get the bucket from the storage client
bucket = storage_client.get_bucket('language-ai-model.appspot.com')

@app.route('/delete_account', methods=['DELETE'])
def delete_account():
    # Extract the token from the Authorization header
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    decoded_token = verify_firebase_token(token)

    if not decoded_token:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_uid = decoded_token['uid']
    try:
        # Reference to the Firestore user's document
        user_ref = db.collection('users').document(user_uid)
        
        # Reference to the user's documents subcollection
        docs_ref = user_ref.collection('documents')
        
        # Delete all documents within the subcollection
        docs = docs_ref.stream()
        for doc in docs:
            doc_data = doc.to_dict()
            file_name = doc_data.get('name')
            if file_name:
                # Create a reference to the file to delete
                blob = bucket.blob(f'user_files/{user_uid}/{file_name}')
                # Delete the file
                blob.delete()

            # Delete the document reference in Firestore
            doc.reference.delete()

        # Delete the user's document from Firestore
        user_ref.delete()
            
        # Delete the user from Firebase Authentication
        auth.delete_user(user_uid)
        
        # Delete the user's document from Firestore
        db.collection('users').document(user_uid).delete()
        
        return jsonify({"message": "User account and all of their files deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/correct_document", methods=["POST"])
def correct_document():
    # Extract the token from the Authorization header
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    decoded_token = verify_firebase_token(token)

    if not decoded_token:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_uid = decoded_token['uid']
    print(user_uid)
    try:
        data = request.json
        print(user_uid)
        document_url = data.get('documentUrl')
        
        corrected_file_path = text_correction.correct_document_from_url(document_url, user_uid)
        print(corrected_file_path)
        if corrected_file_path:
            # Handle the corrected file, such as sending it back or storing it
            return jsonify({"message": "Document corrected successfully", "correctedFilePath": corrected_file_path})
        else:
            return jsonify({"error": "Failed to correct document"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


