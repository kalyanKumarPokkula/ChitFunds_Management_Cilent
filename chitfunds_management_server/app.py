from chit_groups import chit_groups
from flask import Flask , request , jsonify
from flask_cors import CORS 

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

@app.route('/chit', methods=['GET'])
def chit_funds():
    return jsonify({"messages" : "Welcome to Chit Funds Management"})

@app.route('/chit-groups', methods=['GET'])
def get_chit_groups():
    data = chit_groups()
    return jsonify({"message" : "Recevied data" , "data" : data})


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)






