from flask import request, jsonify
from chit_groups import (
    chit_groups, 
    chit_lifted_member, 
    add_chit_monthly_projections, 
    update_chit_group, 
    add_chit, 
    get_chit_by_id, 
    delete_chit_group_by_id, 
    get_users_by_chit_group, 
    add_members
)
from users import (
    create_new_user, 
    get_users_chit_details, 
    get_members, 
    get_current_month_payment_stats, 
    get_all_member_installments, 
    get_users,
    generate_installments,
    generate_current_month_installments,
    get_chit_groups_by_user_id,
    get_unpaid_installments,
    process_payment,
    get_payments,
    get_payment_details,
    delete_chit_member
)
from auth import token_required

def register_routes(app):
    """Register all application routes to the Flask app instance"""
    
    @app.route('/chit', methods=['GET'])
    def chit_funds():
        return jsonify({"messages": "Welcome to Chit Funds Management"})

    @app.route('/chit-groups', methods=['GET'])
    @token_required
    def get_chit_groups():
        data = chit_groups()
        return jsonify({"message": "Received data", "data": data})

    @app.route("/users", methods=['GET'])
    @token_required
    def users():
        try:
            data = get_users()
            return jsonify({"data": data}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/delete-chit", methods=["DELETE"])
    @token_required
    def delete_chit():
        try: 
            chit_group_id = request.args.get("chit_group_id")
            print(chit_group_id)
            if chit_group_id is None:
                return jsonify({"error": "chit_group_id is required"}), 400
            
            response = delete_chit_group_by_id(chit_group_id)
            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/chit-lifted-member", methods=["PATCH"])
    @token_required
    def chit_lifted():
        try:
            data = request.get_json()
            print(type(data), data)  # Debugging

            if not data:  
                return jsonify({"error": "Invalid format, expected a list under 'data'"}), 400
            
            response = chit_lifted_member(data)
            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/update-chit-group", methods=["PATCH"])
    @token_required
    def update_chit():
        try: 
            data = request.get_json()
            print(type(data), data)  # Debugging

            if not data:  
                return jsonify({"error": "Invalid format, expected a list under 'data'"}), 400
            
            response = update_chit_group(data)
            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/add_monthly_chit_projections", methods=["POST"])
    @token_required
    def monthly_chit_projections():
        try: 
            data = request.get_json()
            print(data)  # Debugging

            if not data:  
                return jsonify({"error": "Invalid format, expected a list under 'data'"}), 400
            
            response = add_chit_monthly_projections(data)
            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/chit-groups', methods=['POST'])
    @token_required
    def add_new_chit():
        try:
            data = request.get_json()
            print(data)
            response = add_chit(data)
            print(response)
            return jsonify({"message": "Chit group added successfully!", "data": response}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/get_chit', methods=['GET'])
    @token_required
    def get_chit():
        try:
            print("inside the get chit")
            chit_group_id = request.args.get('chit_group_id')
            print(request.headers)
            for key, value in request.headers.items():
                print(f"{key}: {value}")

            if not chit_group_id:
                return jsonify({"error": "Missing chit_group_id"}), 400
            
            response = get_chit_by_id(chit_group_id)
            return jsonify({"data": response}), 200
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/get_chit_members', methods=['GET'])
    @token_required
    def get_chit_members():
        try:
            chit_group_id = request.args.get('chit_group_id')

            if not chit_group_id:
                return jsonify({"error": "Missing chit_group_id"}), 400
            
            response = get_users_by_chit_group(chit_group_id)
            return jsonify({"data": response}), 200
        
        except Exception as e:
             return jsonify({"error": str(e)}), 500

    @app.route("/add_chit_members", methods=["POST"])
    @token_required
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
        
    @app.route("/add_new_user", methods=["POST"])
    @token_required
    def add_user():
        try:
            data = request.get_json()
            print(type(data), data)  # Debugging

            if not data:  
                return jsonify({"error": "Invalid format, expected a list under 'data'"}), 400
            
            response = add_members(data)
            return jsonify(response), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/create_new_user", methods=['POST'])
    @token_required
    def add_new_users():
        try:
            data = request.get_json()
            print(data)
            response = create_new_user(data)
            return jsonify(response), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/user_details", methods=['GET'])
    @token_required
    def user_details():
        try:
            data = request.args.get("user_id")
            print(data)
            response = get_users_chit_details(data)
            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/get_users', methods=['GET'])
    @token_required
    def get_all_users():
        try:   
            response = get_members()
            return jsonify({"data": response}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/get_all_chit_groups_current_month_payment_stats', methods=['GET'])
    @token_required
    def get_all_chit_groups_current_month_stats():
        try:   
            response = get_current_month_payment_stats()
            return jsonify({"data": response}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/get_chit_group_member_installments", methods=['GET'])
    @token_required
    def get_chit_group_member_installment():
        try:
            data = request.args.get("chit_member_id")
            print(data)
            response = get_all_member_installments(data)
            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/get_chit_groups_by_user_id" , methods=['GET'])
    @token_required
    def get_chit_groups_user_id():
        try:
            data = request.args.get("user_id")
            print(data)
            response = get_chit_groups_by_user_id(data)

            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/add_current_month_installments" , methods=['GET'])
    @token_required
    def add_current_month_installments():
        try:
            data = request.args.get("chit_group_id")
            print(data)
            print(data)
            response = generate_current_month_installments(data)

            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/get_member_installments', methods=['GET'])
    @token_required
    def get_member_installments():
        try:
            member_id = request.args.get('member_id')
            
            if not member_id:
                return jsonify({"error": "Missing member_id"}), 400
                
            response = get_all_member_installments(member_id)
            return jsonify({"data": response}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/get_payment_stats', methods=['GET'])
    @token_required
    def get_payment_stats():
        try:
            chit_group_id = request.args.get('chit_group_id')
            
            if not chit_group_id:
                return jsonify({"error": "Missing chit_group_id"}), 400
                
            result = get_current_month_payment_stats([chit_group_id])
            return jsonify({"data": result}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/get_members_unpaid_installments" , methods=['GET'])
    @token_required
    def get_members_unpaid_installments():
        try:
            user_id = request.args.get("user_id")
            print(user_id)
            response = get_unpaid_installments(user_id)

            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/process_payments" , methods=['POST'])
    @token_required
    def payment_process():
        try:
            data = request.get_json()
            print(data)
            response = process_payment(data)

            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/get_payments" , methods=['GET'])
    @token_required
    def fetch_payments():
        try:
            response = get_payments()

            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/get_payments_details" , methods=['GET'])
    @token_required
    def get_payments_details():
        try:
            payment_id = request.args.get("payment_id")
            user_name = request.args.get("user_name")
            response = get_payment_details(payment_id, user_name)

            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/delete-chit-member", methods=["DELETE"])
    @token_required
    def remove_chit_member():
        try:
            data = request.args.get("chit_member_id")
            print(data)
            
            if not data:
                return jsonify({"error": "chit_member_id are required"}), 400
            
            response = delete_chit_member(data)
            return jsonify(response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500