import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import api from "./api/axios";

import Login from "./pages/Login";

// Admin pages
import Dashboard from "./pages/Admin/Dashboard";
import AcademicManagement from "./pages/Admin/AcademicManagement";
import UserManagement from "./pages/Admin/UserManagement";
import TeacherManagement from "./pages/Admin/TeacherManagement";
import StudentManagement from "./pages/Admin/StudentManagement";
import ModuleManagement from "./pages/Admin/ModuleManagement";
import RoomManagement from "./pages/Admin/RoomManagement";
import ExamManagement from "./pages/Admin/ExamManagement";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ClaimsManagement from "./pages/ClaimsManagement";
import Summary from "./pages/Summary";

// Other dashboards
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// Layout
import Header from "./pages/Layout/Header";
import Sidebar from "./pages/Layout/Sidebar";
import MainContent from "./pages/Layout/MainContent";

import "./styles/App.css";

// ===================================================================
// AUTH CONTEXT - Global authentication state management
// ===================================================================
const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth from localStorage on mount
    useEffect(() => {
        const initAuth = () => {
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    if (userData.token) {
                        // Restore auth header
                        api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
                        setUser(userData);
                        console.log("✅ Auth restored:", userData.role);
                    }
                }
            } catch (error) {
                console.error("❌ Failed to restore auth:", error);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (userData, token) => {
        const userWithToken = { ...userData, token };
        localStorage.setItem("user", JSON.stringify(userWithToken));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(userWithToken);
        console.log("✅ User logged in:", userData.role);
    };

    const logout = () => {
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        console.log("👋 User logged out");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// ===================================================================
// PROTECTED ROUTE - Now uses Context instead of localStorage directly
// ===================================================================
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px',
                color: '#0B2844'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        console.log("🚫 No user, redirecting to login");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== allowedRole) {
        console.log(`🚫 Wrong role: ${user.role}, expected: ${allowedRole}`);
        // Redirect to appropriate dashboard based on actual role
        switch (user.role) {
            case "student":
                return <Navigate to="/student-dashboard" replace />;
            case "teacher":
                return <Navigate to="/EspaceEnseignants" replace />;
            case "admin":
                return <Navigate to="/admin-dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    console.log("✅ Access granted for", user.role);
    return children;
};

// ===================================================================
// MAIN APP COMPONENT
// ===================================================================
function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Admin layout wrapper
    const AdminLayout = ({ children }) => (
        <div className="app">
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="app-body">
                <Sidebar isOpen={sidebarOpen} />
                <MainContent isSidebarOpen={sidebarOpen}>
                    {children}
                </MainContent>
            </div>
        </div>
    );

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* PUBLIC ROUTES */}
                    <Route path="/" element={<Summary />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/ForgotP1" element={<div className="p-8">Forgot Password Page</div>} />

                    {/* ADMIN ROUTES */}
                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><Dashboard /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/academic"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><AcademicManagement /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><UserManagement /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teachers"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><TeacherManagement /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/students"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><StudentManagement /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/modules"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><ModuleManagement /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/rooms"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><RoomManagement /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/exams"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><ExamManagement /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/claims"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminLayout><ClaimsManagement /></AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* TEACHER ROUTE */}
                    <Route
                        path="/EspaceEnseignants"
                        element={
                            <ProtectedRoute allowedRole="teacher">
                                <TeacherDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* STUDENT ROUTE */}
                    <Route
                        path="/student-dashboard"
                        element={
                            <ProtectedRoute allowedRole="student">
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* LEGACY & CATCH ALL */}
                    <Route path="/summary" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;