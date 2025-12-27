import React, { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await api.post("/forgot-password", { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Error occurred");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E6EEF7]">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded w-[350px]"
            >
                <h2 className="text-xl font-bold mb-4 text-center">
                    Forgot Password
                </h2>

                {message && <p className="text-green-600">{message}</p>}
                {error && <p className="text-red-600">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button className="w-full bg-[#123456] text-white py-2">
                    Send Reset Link
                </button>
            </form>
        </div>
    );
}
