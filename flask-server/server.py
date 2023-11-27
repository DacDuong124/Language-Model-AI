from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
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

if __name__ == "__main__":
    app.run(debug=True)


