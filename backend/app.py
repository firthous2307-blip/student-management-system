from flask import Flask, jsonify, request, session
from flask_cors import CORS
import mysql.connector
import re

app = Flask(__name__)
app.secret_key = "student-management-secret"
CORS(app, supports_credentials=True)

def valid_name(name):
  return bool(re.fullmatch(r"[A-Za-z ]+", name))


def valid_email(email):
    return bool(
        re.fullmatch(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email)
    )
def get_database_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", 3306)),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE")
    )    



@app.route("/")
def home():
    return "Student Management Backend is Running!"

@app.route("/students", methods=["GET"])
def get_students():
    connection = get_database_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(students)


@app.route("/students", methods=["POST"])
def add_student():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No data received"
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()


    # Check empty fields
    if not name or not email:
        return jsonify({
            "message": "Name and email are required"
        }), 400


    # Validate name
    if not valid_name(name):
        return jsonify({
            "message": "Name should contain only letters and spaces"
        }), 400


    # Validate email
    if not valid_email(email):
        return jsonify({
            "message": "Please enter a valid email address"
        }), 400


    connection = get_database_connection()
    cursor = connection.cursor()


    # Check duplicate email
    cursor.execute(
        "SELECT id FROM students WHERE email = %s",
        (email,)
    )

    existing_student = cursor.fetchone()


    if existing_student:

        cursor.close()
        connection.close()

        return jsonify({
            "message": "Email already exists"
        }), 409


    # Insert student
    sql = """
        INSERT INTO students (name, email)
        VALUES (%s, %s)
    """

    cursor.execute(sql, (name, email))

    connection.commit()


    cursor.close()
    connection.close()


    return jsonify({
        "message": "Student added successfully"
    }), 201

@app.route("/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):

    connection = get_database_connection()
    cursor = connection.cursor()

    sql = "DELETE FROM students WHERE id = %s"
    cursor.execute(sql, (student_id,))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"message": "Student deleted successfully"})
@app.route("/students/<int:student_id>", methods=["PUT"])

def update_student(student_id):

    data = request.get_json()

    name = data["name"]
    email = data["email"]

    connection = get_database_connection()
    cursor = connection.cursor()

    sql = """
        UPDATE students
        SET name = %s, email = %s
        WHERE id = %s
    """

    cursor.execute(sql, (name, email, student_id))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Student updated successfully"
    })
# =============================
# ADMIN LOGIN
# =============================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "message": "Username and password are required"
        }), 400

    connection = get_database_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM admins WHERE username = %s AND password = %s",
        (username, password)
    )

    admin = cursor.fetchone()

    cursor.close()
    connection.close()

    if admin:

       session["admin_id"] = admin["id"]

       return jsonify({
        "message": "Login successful"
    }), 200

    return jsonify({
        "message": "Invalid username or password"
    }), 401
# =============================
# ADMIN LOGOUT
# =============================

@app.route("/logout", methods=["POST"])
def logout():

    session.pop("admin_id", None)

    return jsonify({
        "message": "Logout successful"
    }), 200
# =============================
# CHECK LOGIN
# =============================

@app.route("/check-login", methods=["GET"])
def check_login():

    if "admin_id" in session:

        return jsonify({
            "logged_in": True
        }), 200

    return jsonify({
        "logged_in": False
    }), 401
if __name__ == "__main__":
    app.run(debug=True)
