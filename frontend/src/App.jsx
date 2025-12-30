import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import Summary from "./pages/Summary"; // or wherever your Summary component is located

// Other dashboards
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// Layout
import Header from "./pages/Layout/Header";
import Sidebar from "./pages/Layout/Sidebar";
import MainContent from "./pages/Layout/MainContent";

import "./styles/App.css";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Admin layout wrapper (OLD STYLE)
    const AdminLayout = ({ children }) => (
        <div className="app">
            <Header
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onLogout={() => {
                    localStorage.removeItem("user");
                    window.location.href = "/";
                }}
            />

            <div className="app-body">
                <Sidebar isOpen={sidebarOpen} />
                <MainContent isSidebarOpen={sidebarOpen}>
                    {children}
                </MainContent>
            </div>
        </div>
    );

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/summary" element={<Summary />} />

                {/* ADMIN ROUTES WITH LAYOUT */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <AdminLayout>
                            <Dashboard />
                        </AdminLayout>
                    }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                    path="/academic"
                    element={
                        <AdminLayout>
                            <AcademicManagement />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <AdminLayout>
                            <UserManagement />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/teachers"
                    element={
                        <AdminLayout>
                            <TeacherManagement />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/students"
                    element={
                        <AdminLayout>
                            <StudentManagement />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/modules"
                    element={
                        <AdminLayout>
                            <ModuleManagement />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/rooms"
                    element={
                        <AdminLayout>
                            <RoomManagement />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/exams"
                    element={
                        <AdminLayout>
                            <ExamManagement />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/claims"
                    element={
                        <AdminLayout>
                            <ClaimsManagement />
                        </AdminLayout>
                    }
                />

                {/* Teacher / Student */}
                <Route
                    path="/EspaceEnseignants"
                    element={<TeacherDashboard />}
                />
                <Route
                    path="/student-dashboard"
                    element={<StudentDashboard />}
                />

                {/* Forgot password */}
                <Route
                    path="/ForgotP1"
                    element={<div className="p-8">Forgot Password Page</div>}
                />
            </Routes>
        </Router>
    );
}

export default App;
