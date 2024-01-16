#!/bin/bash

# Navigate to the repository directory
cd "$DEPLOYMENT_SOURCE" || exit

# Activate the virtual environment
source $DEPLOYMENT_SOURCE/env/bin/activate

# Install Python packages
echo "Installing dependencies from requirements.txt"
pip install -r $DEPLOYMENT_SOURCE/flask-server/requirements.txt

# Navigate to the Flask app directory
cd flask-server

# Start Gunicorn with the Flask app
gunicorn -w 4 -b 0.0.0.0:8000 server:app