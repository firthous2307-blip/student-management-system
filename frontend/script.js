// =====================================================
// STUDENT MANAGEMENT SYSTEM - script.js
// =====================================================

const API_URL = "https://dependable-peace-production-9f76.up.railway.app";


// =====================================================
// LOAD STUDENTS
// =====================================================

function loadStudents() {

    fetch(`${API_URL}/students`, {
        method: "GET",
        credentials: "include"
    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        return response.json();
    })

    .then(students => {

        const studentList =
            document.getElementById("studentList");

        const studentCount =
            document.getElementById("studentCount");

        studentList.innerHTML = "";

        studentCount.textContent = students.length;


        students.forEach(student => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.id}</td>

                <td>${student.name}</td>

                <td>${student.email}</td>

                <td>

                    <button onclick="editStudent(${student.id})">
                        ✏️ Edit
                    </button>

                    <button onclick="deleteStudent(${student.id})">
                        🗑️ Delete
                    </button>

                </td>
            `;

            studentList.appendChild(row);

        });

    })

    .catch(error => {

        console.error("Error loading students:", error);

    });
}


// =====================================================
// ADD STUDENT
// =====================================================

function addStudent() {

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();


    // Check empty fields

    if (name === "" || email === "") {

        alert("Please enter both name and email.");

        return;
    }


    // Validate name

    if (!/^[A-Za-z ]+$/.test(name)) {

        alert("Name should contain only letters and spaces.");

        return;
    }


    // Validate email

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        alert("Please enter a valid email address.");

        return;
    }


    // Send data to Flask

    fetch(`${API_URL}/students`, {

        method: "POST",

        credentials: "include",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            email: email
        })

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);


        // Clear input fields

        if (data.message === "Student added successfully") {

            document.getElementById("name").value = "";

            document.getElementById("email").value = "";

            loadStudents();
        }

    })

    .catch(error => {

        console.error("Error adding student:", error);

    });
}


// =====================================================
// EDIT STUDENT
// =====================================================

function editStudent(id) {

    fetch(`${API_URL}/students`, {

        method: "GET",

        credentials: "include"

    })

    .then(response => response.json())

    .then(students => {

        const student =
            students.find(s => s.id === id);


        if (!student) {

            alert("Student not found.");

            return;
        }


        // Put existing values into modal

        document.getElementById("editId").value =
            student.id;

        document.getElementById("editName").value =
            student.name;

        document.getElementById("editEmail").value =
            student.email;


        // Open modal

        document.getElementById("editModal").style.display =
            "block";

    })

    .catch(error => {

        console.error("Error:", error);

    });
}


// =====================================================
// UPDATE STUDENT
// =====================================================

function updateStudent() {

    const id =
        document.getElementById("editId").value;

    const name =
        document.getElementById("editName").value.trim();

    const email =
        document.getElementById("editEmail").value.trim();


    // Check empty fields

    if (name === "" || email === "") {

        alert("Please enter both name and email.");

        return;
    }


    // Validate name

    if (!/^[A-Za-z ]+$/.test(name)) {

        alert("Name should contain only letters and spaces.");

        return;
    }


    // Validate email

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        alert("Please enter a valid email address.");

        return;
    }


    // Send update request

    fetch(`${API_URL}/students/${id}`, {

        method: "PUT",

        credentials: "include",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            name: name,

            email: email

        })

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);


        // Close modal

        document.getElementById("editModal").style.display =
            "none";


        // Reload students

        loadStudents();

    })

    .catch(error => {

        console.error("Error updating student:", error);

    });
}


// =====================================================
// CANCEL EDIT
// =====================================================

function cancelEdit() {

    document.getElementById("editModal").style.display =
        "none";
}


// =====================================================
// DELETE STUDENT
// =====================================================

function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );


    if (!confirmDelete) {

        return;
    }


    fetch(`${API_URL}/students/${id}`, {

        method: "DELETE",

        credentials: "include"

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        loadStudents();

    })

    .catch(error => {

        console.error("Error deleting student:", error);

    });
}


// =====================================================
// SEARCH STUDENTS
// =====================================================

function searchStudents() {

    const searchText =
        document.getElementById("search")
            .value
            .toLowerCase();


    const students =
        document.querySelectorAll("#studentList > tr");


    students.forEach(student => {

        const studentText =
            student.textContent.toLowerCase();


        if (studentText.includes(searchText)) {

            student.style.display = "";

        } else {

            student.style.display = "none";

        }

    });
}


// =====================================================
// ADMIN LOGIN
// =====================================================

function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const loginMessage =
        document.getElementById("loginMessage");


    // Check empty fields

    if (username === "" || password === "") {

        loginMessage.textContent =
            "Please enter username and password.";

        return;
    }


    // Send login request

    fetch(`${API_URL}/login`, {

        method: "POST",

        credentials: "include",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            username: username,

            password: password

        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.message === "Login successful") {

            alert("Login successful!");


            // Go to dashboard

            window.location.href = "index.html";

        } else {

            loginMessage.textContent =
                data.message;

        }

    })

    .catch(error => {

        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to connect to server.";

    });
}
// =====================================================
// ADMIN LOGOUT
// =====================================================

function logout() {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
        return;
    }

    fetch(`${API_URL}/logout`, {

        method: "POST",

        credentials: "include"

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        window.location.href = "login.html";

    })

    .catch(error => {

        console.error("Logout error:", error);

    });
}


// =====================================================
// CHECK ADMIN LOGIN
// =====================================================

function checkLogin() {

    fetch(`${API_URL}/check-login`, {

        method: "GET",

        credentials: "include"

    })

    .then(response => {

        if (!response.ok) {

            // User is not logged in

            window.location.href = "login.html";

            return null;
        }

        return response.json();

    })

    .then(data => {

        if (data && data.logged_in) {

            // User is authenticated

            loadStudents();

        }

    })

    .catch(error => {

        console.error("Login check error:", error);

        window.location.href = "login.html";

    });
}


// =====================================================
// PAGE DETECTION
// =====================================================

// Check which page is currently open

const currentPage =
    window.location.pathname;


// If index.html is open, check authentication

if (
    currentPage.endsWith("index.html") ||
    currentPage.endsWith("/")
) {

    checkLogin();

}
