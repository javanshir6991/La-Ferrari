const API_URL = "http://localhost:1337/api"; // Strapi backend

async function registerUser() {
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const msg = document.getElementById("message");

    try {
        const res = await fetch(`${API_URL}/auth/local/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error?.message || "Register failed");

        localStorage.setItem("token", data.jwt);
        msg.style.color = "green";
        msg.textContent = "✅ Registration successful!";
    } catch (err) {
        msg.style.color = "red";
        msg.textContent = "❌ " + err.message;
    }
}

async function loginUser() {
    const identifier = document.getElementById("login-identifier").value;
    const password = document.getElementById("login-password").value;
    const msg = document.getElementById("message");

    try {
        const res = await fetch(`${API_URL}/auth/local`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error?.message || "Login failed");

        localStorage.setItem("token", data.jwt);
        msg.style.color = "green";
        msg.textContent = "✅ Login successful! Welcome " + data.user.username;
    } catch (err) {
        msg.style.color = "red";
        msg.textContent = "❌ " + err.message;
    }
}