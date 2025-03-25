from chit_groups import chit_groups , chit_lifted_member,add_chit_monthly_projections ,update_chit_group, add_chit , get_chit_by_id , delete_chit_group_by_id,get_users, get_users_by_chit_group , add_members
from flask import Flask , request , jsonify
from flask_cors import CORS 
from users import get_members , get_users_chit_details

app = Flask(__name__)

# Update CORS to allow requests from the Docker container
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:3000", "http://chit-client:3000"]}})

@app.route('/chit', methods=['GET'])
def chit_funds():
    return jsonify({"messages" : "Welcome to Chit Funds Management"})

@app.route('/chit-groups', methods=['GET'])
def get_chit_groups():
    data = chit_groups()
    return jsonify({"message" : "Recevied data" , "data" : data})

@app.route("/users" , methods=['GET'])
def users():
    try:
        data = get_users()
        return jsonify({"data" : data}) , 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/delete-chit", methods=["DELETE"])
def delete_chit():

    try: 
        chit_group_id = request.args.get("chit_group_id")
        print(chit_group_id)
        if chit_group_id is None:
            return jsonify({"error": "chit_group_id is required"}), 400
        
        response = delete_chit_group_by_id(chit_group_id)

        return jsonify(response) , 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chit-lifted-member" , methods=["PATCH"])
def chit_lifted():

    try:

        data = request.get_json()

        print(type(data), data)  # Debugging

        if not data:  
            return jsonify({"error": "Invalid format, expected a list under 'data'"}), 400
        
        response = chit_lifted_member(data)

        return jsonify(response) , 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/update-chit-group", methods=["PATCH"])
def update_chit():

    try: 
        
        data = request.get_json()
        print(type(data), data)  # Debugging

        if not data:  
            return jsonify({"error": "Invalid format, expected a list under 'data'"}), 400
        
        response = update_chit_group(data)

        return jsonify(response) , 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/add_monthly_chit_projections" , methods=["POST"])
def monthly_chit_projections():
    try: 
        
        data = request.get_json()
        print(data)  # Debugging

        if not data:  
            return jsonify({"error": "Invalid format, expected a list under 'data'"}), 400
        
        response = add_chit_monthly_projections(data)

        return jsonify(response) , 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chit-groups', methods=['POST'])
def add_new_chit():
    try:
        data = request.json
        print(data)
        response = add_chit(data)
        print(response)
        return jsonify({"message": "Chit group added successfully!" , "data" : response['updates']['updatedRange']}) ,201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_chit', methods=['GET'])
def get_chit():
    try:
        chit_group_id = request.args.get('chit_group_id')

        if not chit_group_id:
            return jsonify({"error" : "Missing chit_group_id"}) , 400
        
        response = get_chit_by_id(chit_group_id)


        return jsonify({"data" : response}) , 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_chit_members' , methods=['GET'])
def get_chit_members():
    try:
        chit_group_id = request.args.get('chit_group_id')

        if not chit_group_id:
            return jsonify({"error" : "Missing chit_group_id"}) , 400
        
        response = get_users_by_chit_group(chit_group_id)

        return jsonify({"data" : response}) , 200
    
    except Exception as e:
         return jsonify({"error" : str(e)}), 500

@app.route("/add_chit_members" , methods=["POST"])
def add_chit_members():
    try:

        data = request.get_json()
        print(type(data), data)  # Debugging

        if not data:  
            return jsonify({"error": "Invalid format, expected a list under 'data'"}), 400
        
        response = add_members(data)

        return jsonify(response), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_members" , methods=['GET'])
def get_users():
    try:
        
        response = get_users_chit_details("U001")

        return jsonify(response), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    # Run the app on 0.0.0.0 to make it accessible from outside the container
    app.run(host='0.0.0.0', port=5001, debug=True)






