import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const ClaimsManagement = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await api.get("/claims");
            // API returns { claims: [...] }
            setClaims(res.data.claims || []);
        } catch (err) {
            console.error("Fetch claims error:", err);
            setError(err.message || "Erreur lors du chargement des réclamations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();

        const handler = (e) => {
            if (e.key === "claimUpdate") fetchClaims();
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const resolveClaim = async (id) => {
        try {
            await api.put(`/claims/${id}`, { status: "resolved" });
            // notify others
            localStorage.setItem("claimUpdate", Date.now().toString());
            fetchClaims();
        } catch (err) {
            console.error("Resolve error:", err);
            alert("Erreur lors de la résolution.");
        }
    };

    const deleteClaim = async (id) => {
        if (!window.confirm("Supprimer cette réclamation ?")) return;
        try {
            await api.delete(`/claims/${id}`);
            localStorage.setItem("claimUpdate", Date.now().toString());
            fetchClaims();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Erreur lors de la suppression.");
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div className="text-red-600">Erreur: {error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Réclamations</h1>
            <div className="overflow-x-auto">
                <table className="data-table min-w-full">
                    <thead>
                        <tr>
                            <th>Module</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Enseignant</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-6">
                                    Aucune réclamation
                                </td>
                            </tr>
                        )}
                        {claims.map((c) => (
                            <tr key={c.id}>
                                <td>{c.exam?.module || "-"}</td>
                                <td>{c.exam_type}</td>
                                <td>{c.exam ? new Date(c.exam.date).toLocaleDateString("fr-FR") : "-"}</td>
                                <td>{c.teacher_name || c.teacher?.name || "-"}</td>
                                <td style={{ maxWidth: 400 }}>{c.message}</td>
                                <td>{c.status}</td>
                                <td>
                                    <div className="flex space-x-2">
                                        {c.status !== "resolved" && (
                                            <button
                                                className="btn-primary px-3 py-1"
                                                onClick={() => resolveClaim(c.id)}
                                            >
                                                Marquer résolu
                                            </button>
                                        )}
                                        <button
                                            className="btn-danger px-3 py-1"
                                            onClick={() => deleteClaim(c.id)}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClaimsManagement;
