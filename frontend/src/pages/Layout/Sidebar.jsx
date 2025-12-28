import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
    const location = useLocation();

    const menuItems = [
        { path: "/admin-dashboard", label: "Dashboard", icon: "📊" },

        { path: "/academic", label: "Gestion Académique", icon: "🎓" },
        { path: "/teachers", label: "Enseignants", icon: "👨‍🏫" },
        { path: "/students", label: "Étudiants", icon: "📚" },
        { path: "/modules", label: "Modules", icon: "📖" },
        { path: "/rooms", label: "Salles", icon: "🏫" },
        { path: "/exams", label: "Examens", icon: "📝" },
        { path: "/users", label: "Utilisateurs", icon: "👥" },
        { path: "/claims", label: "Réclamations", icon: "📋" }
    ];

    return (
        <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-item ${
                            location.pathname === item.path ? "active" : ""
                        }`}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
