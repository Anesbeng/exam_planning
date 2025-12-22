import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios"; // adjust path if needed

const Dashboard = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        api.get("/dashboard")
            .then((res) => {
                setStats([
                    {
                        label: "Utilisateurs",
                        value: res.data.users,
                        path: "/users",
                        color: "#667eea",
                    },
                    {
                        label: "Enseignants",
                        value: res.data.teachers,
                        path: "/teachers",
                        color: "#ed8936",
                    },
                    {
                        label: "Étudiants",
                        value: res.data.students,
                        path: "/students",
                        color: "#38a169",
                    },
                    {
                        label: "Modules",
                        value: res.data.modules,
                        path: "/modules",
                        color: "#9f7aea",
                    },
                    {
                        label: "Salles",
                        value: res.data.rooms,
                        path: "/rooms",
                        color: "#f56565",
                    },
                    {
                        label: "Examens",
                        value: res.data.exams,
                        path: "/exams",
                        color: "#4299e1",
                    },
                ]);
            })
            .catch((err) => console.error("Dashboard error:", err));
    }, []);

    return (
        <div className="dashboard">
            <h1>Tableau de Bord Administrateur</h1>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <Link to={stat.path} key={index} className="stat-card-link">
                        <div
                            className="stat-card"
                            style={{ borderLeftColor: stat.color }}
                        >
                            <h3>{stat.label}</h3>
                            <p className="stat-number">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="recent-actions">
                <h2>Actions Rapides</h2>

                <div className="quick-actions">
                    <Link to="/exams" className="quick-action-btn">
                        <span>📝</span>
                        Planifier un Examen
                    </Link>

                    <Link to="/students" className="quick-action-btn">
                        <span>🎓</span>
                        Ajouter des Étudiants
                    </Link>

                    <Link to="/teachers" className="quick-action-btn">
                        <span>👨‍🏫</span>
                        Gérer les Enseignants
                    </Link>

                    <Link to="/modules" className="quick-action-btn">
                        <span>📖</span>
                        Créer un Module
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
