from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

import json
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
                               
import firebase_admin
from firebase_admin import credentials, auth, firestore, initialize_app

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
        api_url = "https://3c92-103-253-89-37.ngrok-free.app/generate_code"

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
    

# @app.route('/login', methods=["POST"])


# def login():
#     try:
#         data = request.json
#         email = data.get('email')
#         password = data.get('password')

#         if not email or not password:
#             return jsonify({"error": "Email and password are required"}), 400

#         # Mimic Firebase authentication on the server side
#         result = sign_in_with_email_and_password(email, password)

#         # You may want to handle different cases here based on the result
#         if "error" in result:
#             return jsonify({"error": "Invalid Username or Password"}), 401
#         else:
            
#             # Create an access token using Flask-JWT-Extended
#             access_token = create_access_token(identity=email)
#             return jsonify({"message": "Login successful",
#                             "returnSecureToken": result.get("returnSecureToken", None), #this will result null
#                             "access_token": access_token}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# def sign_in_with_email_and_password(email, password, return_secure_token=True):
#     payload = json.dumps({
#         "email": email,
#         "password": password,
#         "returnSecureToken": return_secure_token #still not display the returnSecureToken
#     })

#     rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"

#     response = requests.post(rest_api_url, data=payload)

#     return response.json()

def verify_firebase_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print("Detailed error verifying Firebase token:", str(e))
        return None
@app.route('/login', methods=["POST"])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Attempt to sign in the user with the provided credentials
        user = auth.get_user_by_email(email)
        # You can add additional checks here (e.g., verify password if needed)
        return jsonify({"message": "Login successful", "user_id": user.uid}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401
    

# @app.route("/profile", methods=["GET"])
# @jwt_required()
# def profile():
#     try:
#         # Retrieve the identity from the JWT
#         identity = get_jwt_identity()

#         try:
#             # Fetch user data from Firebase Authentication
#             # If identity is email, use get_user_by_email; otherwise, use get_user
#             if "@" in identity:  # Simple check if identity is an email
#                 user = auth.get_user_by_email(identity)
#             else:
#                 user = auth.get_user(identity)

#             # Include user data in the response
#             response_data = {
#                 "uid": user.uid,
#                 "email": user.email,
#                 # Add any other user data you want to include
#             }

#             return jsonify(response_data), 200

#         except firebase_admin.auth.UserNotFoundError:
#             return jsonify({"error": f"No user record found for the provided identity: {identity}"}), 404

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route("/profile", methods=["GET", "PATCH"])
# @jwt_required()
# def profile():
#     try:
#         # Retrieve the identity from the JWT
#         identity = get_jwt_identity()
#         if request.method == 'GET':

#             try:
#             # Fetch user data from Firebase Authentication
#             # If identity is email, use get_user_by_email; otherwise, use get_user
#                 if "@" in identity:  # Simple check if identity is an email
#                     user = auth.get_user_by_email(identity)
#                 else:
#                     user = auth.get_user(identity)

#                 # Include user data in the response
#                 response_data = {
#                 "uid": user.uid,
#                 "email": user.email,
#                 # Add any other user data you want to include
#             }

#                 return jsonify(response_data), 200
#             except firebase_admin.auth.UserNotFoundError:
#                 return jsonify({"error": f"No user record found for the provided identity: {identity}"}), 404

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


@app.route("/profile", methods=["GET", "PATCH"])
def profile():
    # Extract the token from the Authorization header
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    decoded_token = verify_firebase_token(token)

    if not decoded_token:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_uid = decoded_token['uid']

    if request.method == 'GET':
        try:
            # Fetch user data from Firebase Authentication using UID
            user = auth.get_user(user_uid)

            # Reference to the Firestore user's document
            user_ref = firestore.client().collection('users').document(user.uid)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                response_data = {
                    "uid": user.uid,
                    "email": user.email,
                    "firstName": user_data.get("firstName", ""),
                    "lastName": user_data.get("lastName", ""),
                    "role": user_data.get("role", ""),  
                    "status": user_data.get("status", ""),
                    # "registered_on": user_data.get("registered_on",""),
                    "registered_on": user_data.get("registered_on").isoformat() if user_data.get("registered_on") else None,  # Convert to string if set

                }
                return jsonify(response_data), 200
            else:
                return jsonify({"error": "User profile does not exist."}), 404

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

@app.route('/delete_account', methods=['DELETE'])
def delete_account():
    # Extract the token from the Authorization header
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    decoded_token = verify_firebase_token(token)

    if not decoded_token:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_uid = decoded_token['uid']
    try:
        # Delete the user from Firebase Authentication
        auth.delete_user(user_uid)
        
        # Delete the user's document from Firestore
        db.collection('users').document(user_uid).delete()
        
        return jsonify({"message": "User account deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


