import React, { useState, useEffect } from "react";
import api from "../api/axios";
import TeacherConvocationView from "./TeacherConvocationView";
import "./NotificationBell.css";

const NotificationBell = ({ teacherMatricule, onNotificationSelect }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Fetch notifications on mount and set up polling
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!teacherMatricule) return;

            try {
                const response = await api.get(
                    `/notifications/teacher/${teacherMatricule}`
                );
                setNotifications(response.data.notifications);

                // Check for unread notifications
                const unreadCount = response.data.notifications.filter(
                    (n) => !n.is_read
                ).length;
                setUnreadCount(unreadCount);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        // Initial fetch
        fetchNotifications();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [teacherMatricule]); // In NotificationBell.js (if it exists)
    const fetchNotifications = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            // Use matricule from teacherData or localStorage
            const matricule = teacherMatricule || user?.matricule;

            const response = await api.get(
                `/notifications/teacher/${matricule}`
            );
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };
    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put(
                `/notifications/teacher/${teacherMatricule}/read-all`
            );
            fetchNotifications();
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            fetchNotifications();
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Check if it's a convocation notification
        if (
            notification.message.includes("Convocation") ||
            notification.message.includes("convocation")
        ) {
            // Call the callback with the notification
            if (onNotificationSelect) {
                // ✅ Use the correct prop name
                onNotificationSelect(notification);
            }
            setShowDropdown(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return "À l'instant";
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
        if (diffInMinutes < 1440)
            return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getNotificationIcon = (message) => {
        if (message.includes("Convocation") || message.includes("convocation"))
            return "📋";
        if (message.includes("Nouvel examen")) return "📝";
        if (message.includes("modifié")) return "✏️";
        if (message.includes("supprimé")) return "🗑️";
        return "🔔";
    };

    return (
        <>
            <div className="notification-bell-container">
                <button
                    className="notification-bell-button"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <svg
                        className="bell-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="notification-badge">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {showDropdown && (
                    <div className="notification-dropdown">
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    className="mark-all-read"
                                    onClick={markAllAsRead}
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="no-notifications">
                                    <p>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`notification-item ${
                                            !notif.is_read ? "unread" : ""
                                        } ${
                                            notif.message.includes(
                                                "Convocation"
                                            )
                                                ? "clickable"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(notif)
                                        }
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notif.message)}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-message">
                                                {notif.message}
                                            </p>
                                            {notif.exam_details && (
                                                <div className="notification-exam-details">
                                                    <span>
                                                        {
                                                            notif.exam_details
                                                                .niveau
                                                        }
                                                        /
                                                        {
                                                            notif.exam_details
                                                                .group
                                                        }
                                                    </span>
                                                    <span>
                                                        Salle:{" "}
                                                        {
                                                            notif.exam_details
                                                                .room
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            <span className="notification-time">
                                                {formatDate(notif.created_at)}
                                            </span>
                                            {notif.message.includes(
                                                "Convocation"
                                            ) && (
                                                <span className="view-convocation-hint">
                                                    👆 Cliquez pour voir la
                                                    convocation
                                                </span>
                                            )}
                                        </div>
                                        <div className="notification-actions">
                                            {!notif.is_read && (
                                                <button
                                                    className="mark-read-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notif.id);
                                                    }}
                                                    title="Marquer comme lu"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(
                                                        notif.id
                                                    );
                                                }}
                                                title="Supprimer"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {showDropdown && (
                    <div
                        className="notification-backdrop"
                        onClick={() => setShowDropdown(false)}
                    />
                )}
            </div>

            {/* Convocation View Modal */}
            {selectedNotification && (
                <TeacherConvocationView
                    notification={selectedNotification}
                    onClose={() => setSelectedNotification(null)}
                />
            )}
        </>
    );
};

export default NotificationBell;
