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
#     except auth.AuthError as e:
#         return jsonify({"error": str(e)}), 400
#     except ValueError as e:
#         return jsonify({"error": str(e)}), 400


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