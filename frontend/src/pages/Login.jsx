// Login.jsx (Updated with Sanctum Token Handling)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/login.css";

export default function Login() {
    const navigate = useNavigate();
    const [matricule, setMatricule] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/Login", {
                matricule,
                password,
            });

            const data = response.data;

            // Expected response from Laravel:
            // {
            //   "user": { "id": 1, "name": "...", "matricule": "...", "role": "student", ... },
            //   "token": "1|laravel_sanctum_abc123..."   // plain-text token
            // }

            if (!data.user || !data.token) {
                throw new Error("Invalid response from server: missing user or token");
            }

            // Clear any old auth data
            localStorage.removeItem("user");
            delete api.defaults.headers.common["Authorization"];

            // Create user object with token
            const userWithToken = {
                ...data.user,
                token: data.token  // Attach token to user object
            };

            // Save to localStorage
            localStorage.setItem("user", JSON.stringify(userWithToken));

            // Set Authorization header for all future API requests
            api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

            // Role-based navigation
            switch (data.user.role) {
                case "admin":
                    navigate("/admin-dashboard");
                    break;
                case "teacher":
                    navigate("/EspaceEnseignants");
                    break;
                case "student":
                    navigate("/student-dashboard");
                    break;
                default:
                    setError("Rôle inconnu ou non autorisé");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(
                err.response?.data?.message ||
                err.message ||
                "Échec de la connexion. Veuillez réessayer."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Subtle professional blob backgrounds */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            
            {/* University-themed floating elements */}
            <div className="themed-shape shape-book">📚</div>
            <div className="themed-shape shape-computer">💻</div>
            <div className="themed-shape shape-graduation">🎓</div>
            <div className="themed-shape shape-study">📝</div>
            
            <img
                src="/logouni.png"
                alt="UABT Logo"
                className="login-logo"
            />

            <div className="login-card">
                <h1 className="text-2xl font-semibold text-center text-[#0B2844]">
                    UABT
                </h1>

                <p className="text-center text-[#0B2844] mb-6">
                    Departement Informatique
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Matricule"
                        value={matricule}
                        onChange={(e) => setMatricule(e.target.value)}
                        className="login-input"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? <div className="spinner"></div> : "Log In"}
                    </button>
                </form>

                {error && (
                    <p className="login-error">
                        {error}
                    </p>
                )}

                <p
                    className="text-right text-sm text-gray-500 mt-4 cursor-pointer hover:underline"
                    onClick={() => navigate("/forgot-password")}
                >
                    Forgot Password?
                </p>
            </div>
        </div>
    );
}