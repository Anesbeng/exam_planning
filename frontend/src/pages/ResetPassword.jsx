import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const token = params.get("token");
    const email = params.get("email");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/reset-password", {
                token,
                email,
                password,
                password_confirmation: confirm,
            });

            setMessage(res.data.message);
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Reset failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E6EEF7]">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded w-[350px]"
            >
                <h2 className="text-xl font-bold mb-4 text-center">
                    Reset Password
                </h2>

                {message && <p className="text-green-600">{message}</p>}
                {error && <p className="text-red-600">{error}</p>}

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border p-2 mb-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full border p-2 mb-4"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />

                <button className="w-full bg-[#123456] text-white py-2">
                    Reset
                </button>
            </form>
        </div>
    );
}
