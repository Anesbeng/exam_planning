import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // ← Add this import (adjust path if needed)

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
            // Use api instead of fetch
            const response = await api.post("/Login", {
                matricule,
                password
            });

            const data = response.data;

            localStorage.setItem("user", JSON.stringify(data.user));

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
                    setError("Unknown role");
                    setLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E6EEF7] flex flex-col items-center pt-10">
            <img
                src="/logouniversite.jpg"
                alt="UABT Logo"
                className="w-32 mb-6"
            />

            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-semibold text-center mb-2 text-[#0B2844]">
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
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                {error && (
                    <p className="text-red-600 text-center mt-4">{error}</p>
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