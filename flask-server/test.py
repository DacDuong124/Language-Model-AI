def register():
    try:
        email = request.json.get("email")
        password = request.json.get("password")

        # Create a user in Firebase Authentication
        user = auth.create_user(email=email, password=password)

        # You can customize the user creation response as needed
        response_body = {
            "user_id": user.uid,
            "email": user.email,
            "msg": "User registration successful",
        }

        return jsonify(response_body), 201
    except auth.AuthError as e:
        return jsonify({"error": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400