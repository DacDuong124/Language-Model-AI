from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

import json
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
                               
import firebase_admin
from firebase_admin import credentials, auth
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
app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
jwt = JWTManager(app)
FIREBASE_WEB_API_KEY = 'AIzaSyD41gPBqyZpRdKGkvF8vt5NCS-X7nrPZ5c'

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

# @app.route('/token', methods=["POST"])    
# def create_token():
#     email = request.json.get("email", None)
#     password = request.json.get("password", None)
#     if email != "test" or password != "test":
#         return {"msg": "Wrong email or password"}, 401

#     access_token = create_access_token(identity=email)
#     response = {"access_token":access_token}
#     return response

@app.route('/profile')
@jwt_required() #new line

def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)


# Register Backend

# Configure Firebase Admin SDK
cred = credentials.Certificate("language-ai-model-firebase-adminsdk-l4hgq-1c59e87bd8.json")
firebase_admin.initialize_app(cred)
# @app.route('/register', methods=["POST"])
# def register():
#     try:
#         email = request.json.get("email")
#         password = request.json.get("password")

#         # Create a user in Firebase Authentication
#         user = auth.create_user(email=email, password=password)

#         # You can customize the user creation response as needed
#         response_body = {
#             "user_id": user.uid,
#             "email": user.email,
#             "msg": "User registration successful",
#         }

#         return jsonify(response_body), 201
#     except ValueError as e:
#         return jsonify({"error": str(e)}), 400

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

            # You can customize the user creation response as needed
            response_body = {
                "user_id": user.uid,
                "email": user.email,
                "msg": "User registration successful",
            }

            return jsonify(response_body), 201
        else:
            return jsonify({"error": "Invalid JSON data or missing 'email' or 'password'"}), 400

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    

@app.route('/login', methods=["POST"])
# def login():
#     try:
#         data = request.json

#         # Check if request.json is not None and has 'email' and 'password'
#         if data and isinstance(data, dict) and 'email' in data and 'password' in data:
#             email = data['email']
#             password = data['password']

#             # Sign in with email and password using Firebase Authentication
#             user = auth.get_user_by_email(email)  # This will raise an AuthError if the user does not exist

#             # You don't need to verify the password manually with Firebase Admin SDK
#             # Firebase Authentication handles this internally during sign-in

#             # Create a JWT token
#             access_token = create_access_token(identity=user.uid)

#             # You can customize the login response as needed
#             response_body = {
#                 "user_id": user.uid,
#                 "email": user.email,
#                 "access_token": access_token,
#                 "msg": "Login successful",
#             }

#             return jsonify(response_body), 200
#         else:
#             return jsonify({"error": "Invalid JSON data or missing 'email' or 'password'"}), 400

#     except ValueError as e:
#         return jsonify({"error": str(e)}), 401

# def sign_in_with_email_and_password(email, password, return_secure_token=True):
#     data = request.json
#     if data and isinstance(data, dict) and 'email' in data and 'password' in data:
#         email = data['email']
#         password = data['password']

#     payload = json.dumps({"email":email, "password":password, "return_secure_token":return_secure_token})
#     FIREBASE_WEB_API_KEY = 'AIzaSyD41gPBqyZpRdKGkvF8vt5NCS-X7nrPZ5c' 
#     rest_api_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"

#     r = requests.post(rest_api_url,
#                   params={"key": FIREBASE_WEB_API_KEY},
#                   data=payload)

#     return r.json()

def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Mimic Firebase authentication on the server side
        result = sign_in_with_email_and_password(email, password)

        # You may want to handle different cases here based on the result
        if "error" in result:
            return jsonify({"error": "Invalid Username or Password"}), 401
        else:
            
            # Create an access token using Flask-JWT-Extended
            access_token = create_access_token(identity=email)
            return jsonify({"message": "Login successful",
                            "returnSecureToken": result.get("returnSecureToken", None), #this will result null
                            "access_token": access_token}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def sign_in_with_email_and_password(email, password, return_secure_token=True):
    payload = json.dumps({
        "email": email,
        "password": password,
        "returnSecureToken": return_secure_token #still not display the returnSecureToken
    })

    rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"

    response = requests.post(rest_api_url, data=payload)

    return response.json()


#####################

if __name__ == "__main__":
    app.run(debug=True)


