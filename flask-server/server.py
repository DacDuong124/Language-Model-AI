from flask import Flask, jsonify, request, abort
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
from functools import wraps
import os



app = Flask(__name__)
# help(firebase_admin.auth)

##AI API backend
#####################
# CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://language-sculptor-ai.vercel.app"]}}, supports_credentials=True)

CORS(app, resources={r"/*": {
    "origins": ["https://language-sculptor-ai.vercel.app"],
    "allow_headers": ["Authorization", "Content-Type"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}}, supports_credentials=True)

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


FIREBASE_WEB_API_KEY = 'AIzaSyD41gPBqyZpRdKGkvF8vt5NCS-X7nrPZ5c'



# Register Backend

# # Configure Firebase Admin SDK
# cred = credentials.Certificate("language-ai-model-firebase-adminsdk-l4hgq-1c59e87bd8.json")
# firebase_admin.initialize_app(cred)


# Name of the environment variable used in Azure to store the JSON credentials
env_var_name = 'FIREBASE_CREDENTIALS'

# Check if running in a production environment (like Azure)
if env_var_name in os.environ:
    # If running in production, load the credentials from the environment variable
    cred = credentials.Certificate(json.loads(os.environ[env_var_name]))
else:
    # If running locally, load the credentials from the file
    cred = credentials.Certificate(r"C:\Users\Admin\Desktop\SEMESTERS\Semester 3 2023\Software Architecture and Design\Language-Model-AI\flask-server\language-ai-model-firebase-adminsdk-l4hgq-1c59e87bd8.json")

# Initialize the Firebase app with the credentials
initialize_app(cred)

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
            if 'role' in data:  # This would be set after a successful payment verification
                updates['role'] = data['role']
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
    



# PAYPAL PAYMENT VERIFICATION
@app.route('/api/verify-payment', methods=['POST'])
def verify_payment():
    payment_id = request.json.get('paymentID')
    user_email = request.json.get('email')  # Make sure this is sent from the frontend
    print(f"Payment ID: {payment_id}")
    print(f"Email: {user_email}")

    def verify_payment_with_paypal(payment_id):
        client_id = 'AZgBNb7puFzjmvPFYD2fPlsWsFSRZNunRpHUDqGx9kR3gzxUeigK4EYwaEkgxACRmr5fjXpREe9pNg9G'
        client_secret = 'EB-AY52FWBJ1voi3Pqa0w9sehUBbnm6qrCpTwVaQc4JHPXyoQI7PRP1YbfiDwmxYsFcvmkX0MgRT4xXI'

        token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
        verify_url = f"https://api.sandbox.paypal.com/v2/checkout/orders/{payment_id}"

        headers = {'Accept': 'application/json', 'Accept-Language': 'en_US'}
        payload = {'grant_type': 'client_credentials'}
        response = requests.post(token_url, auth=(client_id, client_secret), data=payload, headers=headers)

        if response.status_code == 200:
            access_token = response.json().get('access_token')
            auth_header = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
            verify_response = requests.get(verify_url, headers=auth_header)
            if verify_response.status_code == 200:
                return True
            else:
                print(f"Failed to verify payment with PayPal: {verify_response.text}")
                return False
        else:
            print(f"Failed to get access token from PayPal: {response.text}")
            return False

    def update_user_role(user_email, new_role):
        try:
            users_ref = db.collection('users')
            users = users_ref.where(field_path='email', op_string='==', value=user_email).stream()

            for user in users:
                user_id = user.id
                users_ref.document(user_id).update({'role': new_role})
                return True
            return False
        except Exception as e:
            print(f"Error updating user role: {str(e)}")
            return False

    if verify_payment_with_paypal(payment_id):
        if update_user_role(user_email, 'user_plus'):
            return jsonify({'message': 'User role updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update user role'}), 500
    else:
        return jsonify({'error': 'Payment verification failed'}), 400
    
    
    
    
    
    
    
    
    
    
# response = requests.post(
#   'http://127.0.0.1:5000/set-admin/zXFPIi34iFY884BR1o8rhTJSCnr2',
#   headers={'Authorization': 'Bearer zXFPIi34iFY884BR1o8rhTJSCnr2'}
# )

# print(response.json())


# Function to set custom claims for an admin user
def set_admin_custom_claims(user_id):
    try:
        auth.set_custom_user_claims(user_id, {'admin': True})
        print(f"Admin claims set for user: {user_id}")
    except Exception as e:
        print(f"Error setting admin claims: {str(e)}")

# Use this function to set a user as an admin
# Replace 'user_id_here' with the actual user ID
set_admin_custom_claims('zXFPIi34iFY884BR1o8rhTJSCnr2') # User a1@gmail.com in Firebase has been set as admin

# Decorator to check for admin role
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            # No Authorization header present
            return abort(401)  # Unauthorized

        try:
            # Split the header to get the token
            id_token = auth_header.split('Bearer ')[1]
            decoded_token = auth.verify_id_token(id_token)

            if decoded_token.get("admin") is True:
                return f(*args, **kwargs)
            else:
                return abort(403)  # Forbidden for non-admins
        except Exception as e:
            return abort(401)  # Unauthorized for invalid tokens

    return decorated_function

# Example protected route
@app.route('/admin-only', methods=['GET'])
@admin_required
def admin_only():
    # Endpoint code that only admin users can access
    return jsonify({"message": "Hello, admin!"})


@app.route('/list-users', methods=['GET'])
@admin_required
def get_users():
    try:
        # Fetch all user records
        user_records = auth.list_users().iterate_all()
        user_list = []

        for user in user_records:
            # Each user's data is now a dictionary including the desired fields
            user_data = {
                'uid': user.uid,
                'email': user.email,
                'provider': user.provider_data[0].provider_id if user.provider_data else 'none',  # Assuming one provider per user
                'created': user.user_metadata.creation_timestamp,
                'last_sign_in': user.user_metadata.last_sign_in_timestamp,
            }
            user_list.append(user_data)

        return jsonify(user_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/disable-user/<uid>', methods=['POST'])
@admin_required
def disable_user(uid):
    try:
        auth.update_user(uid, disabled=True)
        return jsonify({'status': 'success', 'message': 'User disabled successfully'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/delete-user/<uid>', methods=['DELETE'])
@admin_required
def delete_user(uid):
    try:
        auth.delete_user(uid)
        return jsonify({'status': 'success', 'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
@app.route('/user-profile/<uid>', methods=['GET'])
@admin_required
def get_user_profile(uid):
    try:
        user_record = auth.get_user(uid)
        user_data = {
            'email': user_record.email,
            'uid': user_record.uid,
            # include any other user data you want to return
        }
        return jsonify({'status': 'success', 'user': user_data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# if __name__ == "__main__":
#     app.run(debug=True)


