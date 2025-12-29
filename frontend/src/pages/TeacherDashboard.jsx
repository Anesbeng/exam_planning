import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "./UI/Modal";
import logoutIcon from "./logout.png";
import uniLogo from "./logouni.png";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import teacherIcon from "./teacher.png";
import '../styles/dashboard.css';
import { translations } from './translations';

export default function EspaceEnseignants() {
    const navigate = useNavigate();
    const [activeTabS1, setActiveTabS1] = useState("");
    const [activeTabS2, setActiveTabS2] = useState("");
    const [teacherData, setTeacherData] = useState(null);
    const [exams, setExams] = useState([]);
    const [cc, setCc] = useState([]);
    const [rattrapage, setRattrapage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState("schedule");
    const [language, setLanguage] = useState("fr");

    // Claim modal states
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimCandidates, setClaimCandidates] = useState([]);
    const [selectedExamForClaim, setSelectedExamForClaim] = useState(null);
    const [claimReason, setClaimReason] = useState("");
    const [claimSubmitting, setClaimSubmitting] = useState(false);

    // NOTIFICATION STATES
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);

    const t = translations[language];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "teacher") {
            navigate("/Login");
            return;
        }
        setTeacherData(user);
        fetchTeacherData(user.matricule);

        const storageHandler = (e) => {
            if (e.key === 'examUpdate') {
                fetchTeacherData(user.matricule);
                fetchNotifications(user.matricule);
            }
        };
        window.addEventListener('storage', storageHandler);

        return () => {
            window.removeEventListener('storage', storageHandler);
        };
    }, [navigate]);

    useEffect(() => {
        if (teacherData?.matricule) {
            fetchNotifications(teacherData.matricule);
            
            const interval = setInterval(() => {
                fetchNotifications(teacherData.matricule);
            }, 30000);
            
            return () => clearInterval(interval);
        }
    }, [teacherData?.matricule]);

    const fetchNotifications = async (matricule) => {
        if (!matricule) return;
        
        try {
            const response = await api.get(`/notifications/teacher/${matricule}`);
            const notifs = response.data.notifications || [];
            setNotifications(notifs);
            
            const unread = notifs.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            fetchNotifications(teacherData.matricule);
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        if (!teacherData?.matricule) return;
        
        try {
            setNotificationLoading(true);
            await api.put(`/notifications/teacher/${teacherData.matricule}/read-all`);
            fetchNotifications(teacherData.matricule);
        } catch (err) {
            console.error("Error marking all as read:", err);
        } finally {
            setNotificationLoading(false);
        }
    };

    const formatNotificationDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return t.justNow || "À l'instant";
        if (minutes < 60) return (t.minutesAgo || "Il y a {0} minutes").replace('{0}', minutes);
        if (hours < 24) return (t.hoursAgo || "Il y a {0} heures").replace('{0}', hours);
        if (days < 7) return (t.daysAgo || "Il y a {0} jours").replace('{0}', days);
        
        return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR');
    };

    const fetchTeacherData = async (matricule) => {
    try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/teacher/exams?matricule=${matricule}`);
        const data = response.data;
        
        setExams(data.exams || []);
        setCc(data.cc || []);  // Use singular 'cc'
        setRattrapage(data.rattrapage || []);  // Use singular 'rattrapage'
    } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch exam data");
        console.error("Error fetching exams:", err);
    } finally {
        setLoading(false);
    }
};

    const filterBySemester = (examList, semester) => {
        return examList.filter((exam) => exam.semester === semester);
    };

    const NotificationButton = () => (
        <div className="relative">
            <div
                className="border-2 border-[#0B2844] rounded-2xl p-2 cursor-pointer hover:bg-gray-100 icon-hover transition-all"
                onClick={() => setShowNotificationsModal(true)}
            >
                <svg 
                    className="w-6 h-6 text-[#0B2844]" 
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
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </div>
        </div>
    );

    const NotificationsModal = () => (
        <Modal
            isOpen={showNotificationsModal}
            onClose={() => setShowNotificationsModal(false)}
            title={t.notifications || "Notifications"}
        >
            <div className="notifications-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {unreadCount > 0 && (
                    <div className="flex justify-end mb-3">
                        <button
                            onClick={markAllAsRead}
                            disabled={notificationLoading}
                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {notificationLoading ? (t.loading || "Chargement...") : (t.markAllRead || "Tout marquer comme lu")}
                        </button>
                    </div>
                )}
                
                {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="font-montserrat">{t.noNotifications || "Aucune notification"}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                    notif.is_read
                                        ? 'bg-white border-gray-200'
                                        : 'bg-blue-50 border-blue-300'
                                }`}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${notif.is_read ? 'bg-gray-300' : 'bg-blue-600'}`} />
                                        <span className="font-semibold text-[#0B2844] font-montserrat">
                                            {notif.message.includes('modifié') ? (t.examUpdated || "Examen modifié") : (t.newExam || "Nouvel examen")}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-montserrat">
                                        {formatNotificationDate(notif.created_at)}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-2 font-montserrat">
                                    {notif.message}
                                </p>
                                
                                {notif.exam_details && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1 border border-gray-200">
                                        <p className="font-montserrat">
                                            <strong>{t.module || "Module"}:</strong> {notif.exam_details.module}
                                        </p>
                                        <p className="font-montserrat">
                                            <strong>{t.date || "Date"}:</strong> {new Date(notif.exam_details.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                                        </p>
                                        <p className="font-montserrat">
                                            <strong>{t.schedule || "Horaire"}:</strong> {notif.exam_details.start_time} - {notif.exam_details.end_time}
                                        </p>
                                        <p className="font-montserrat">
                                            <strong>{t.room || "Salle"}:</strong> {notif.exam_details.room}
                                        </p>
                                        <p className="font-montserrat">
                                            <strong>{t.levelGroup || "Niveau/Groupe"}:</strong> {notif.exam_details.niveau} / {notif.exam_details.group}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );

    const ProfileView = () => {
        return (
            <div className="flex items-center justify-center mt-12 fade-in">
                <div className={`bg-[#EEF2F8] shadow-lg rounded-lg p-8 border-2 border-[#3A5377] ${language === 'ar' ? 'text-right' : ''}`} style={{ width: "800px" }}>
                    <h2 className="text-center text-[#0B2844] font-semibold font-montserrat mb-8 text-2xl">
                        {t.teacherProfile || "Profil Enseignant"}
                    </h2>
                    
                    <div className="flex justify-center mb-8">
                        <div className="relative profile-photo">
                            <div className="w-32 h-32 overflow-hidden flex items-center justify-center">
                                <img 
                                    src={teacherData?.photo || teacherIcon} 
                                    alt="Photo de profil" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="border-b border-[#3A5377] pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">{t.fullName || t.teacherName}</p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {teacherData?.name || "N/A"}
                            </p>
                        </div>
                        
                        <div className="border-b border-[#3A5377] pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">{t.teacherId}</p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {teacherData?.matricule || "N/A"}
                            </p>
                        </div>
                        
                        <div className="pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">{t.email}</p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {teacherData?.email || "N/A"}
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                            className="px-8 py-3 bg-[#3A5377] text-white rounded-lg font-montserrat font-semibold hover:bg-[#0B2844] transition-all shadow-md flex items-center space-x-2 hover-scale"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <span>{language === 'fr' ? 'عربية' : 'Français'}</span>
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="px-8 py-3 bg-red-600 text-white rounded-lg font-montserrat font-semibold hover:bg-red-700 transition-all shadow-md flex items-center space-x-2 hover-scale"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>{t.logout}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // RESTORED ORIGINAL ExamTable FROM OLD VERSION (working structure)
    const ExamTable = ({ title, examList }) => {
        if (!examList || examList.length === 0) {
            return (
                <div className="bg-[#EEF2F8] shadow-lg rounded-lg p-6 border-2 border-[#3A5377] fade-in">
                    <h2 className={`text-center text-[#0B2844] font-semibold font-montserrat mb-4 text-xl ${language === 'ar' ? 'text-right' : ''}`}>
                        {title}
                    </h2>
                    <div className="text-center text-gray-500 py-8">
                        {t.noExam}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-[#EEF2F8] shadow-lg rounded-lg p-6 border-2 border-[#3A5377] fade-in">
                <h2 className={`text-center text-[#0B2844] font-semibold font-montserrat mb-4 text-xl ${language === 'ar' ? 'text-right' : ''}`}>
                    {title}
                </h2>
                <div className="overflow-x-auto">
                    <table className={`min-w-full border border-[#3A5377] rounded-lg text-[#0B2844] font-montserrat exam-table ${language === 'ar' ? 'text-right' : ''}`}>
                        <thead>
                            <tr className="text-center bg-[#F8FAFC]">
                                <th className="border border-[#3A5377] px-4 py-3">{t.module}</th>
                                <th className="border border-[#3A5377] px-4 py-3">{t.levelGroup}</th>
                                <th className="border border-[#3A5377] px-4 py-3">{t.room}</th>
                                <th className="border border-[#3A5377] px-4 py-3">{t.date}</th>
                                <th className="border border-[#3A5377] px-4 py-3">{t.schedule}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examList.map((exam, index) => (
                                <tr key={index} className="text-center hover-row">
                                    <td className="border border-[#3A5377] px-4 py-3 font-semibold">{exam.module}</td>
                                    <td className="border border-[#3A5377] px-4 py-3">{exam.niveau} / {exam.group}</td>
                                    <td className="border border-[#3A5377] px-4 py-3">{exam.room}</td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {new Date(exam.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {exam.start_time} - {exam.end_time}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const handleLogout = async () => {
    try {
        // Call the logout endpoint to invalidate the token server-side
        await api.post('/auth/logout'); // Adjust the endpoint as per your backend
        // If your backend doesn't require a body or specific headers, this is fine
    } catch (err) {
        // Even if the logout request fails (e.g., network issue), 
        // we still want to clear local data for security
        console.warn("Logout API failed, proceeding with local cleanup:", err);
    } finally {
        // Always clear local data regardless of API success/failure
        localStorage.removeItem("user");
        
        // Optional: Clear any auth token if stored separately
        // localStorage.removeItem("token");
        // Or if using axios defaults:
        // delete api.defaults.headers.common['Authorization'];

        // Redirect to login or home
        navigate("/"); // Better to go directly to Login
    }
};

    const typeMap = (type) => {
        const mapping = {
            examen: "exam", exam: "exam", cc: "cc", rattrapage: "rattrapage",
        };
        return mapping[type?.toLowerCase()] || "exam";
    };

    const handleSubmitClaim = async () => {
        if (!selectedExamForClaim || !claimReason.trim()) {
            alert("Veuillez sélectionner un examen et saisir un motif.");
            return;
        }

        try {
            setClaimSubmitting(true);

            await api.post("/claims", {
                exam_id: selectedExamForClaim.id,
                exam_type: typeMap(selectedExamForClaim.type),
                message: claimReason.trim(),
                teacher_matricule: teacherData?.matricule,
            });

            localStorage.setItem("claimUpdate", Date.now().toString());

            alert("Signalement envoyé avec succès.");
            setShowClaimModal(false);
            setSelectedExamForClaim(null);
            setClaimCandidates([]);
            setClaimReason("");
        } catch (err) {
            console.error("Error submitting claim:", err);
            alert("Erreur lors de l'envoi du signalement.");
        } finally {
            setClaimSubmitting(false);
        }
    };

    const handleExportPDF = (title, examList) => {
        if (!examList || examList.length === 0) {
            alert(language === 'fr' ? "Aucun examen à exporter" : "لا توجد امتحانات للتصدير");
            return;
        }

        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(t.university || "Université Abou Bekr Belkaïd", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
            
            doc.setFontSize(14);
            doc.text(t.department || "Département Informatique", doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${t.teacherName || "Nom Enseignant"}: ${teacherData?.name}`, 14, 45);
            doc.text(`${t.teacherId || "Matricule"}: ${teacherData?.matricule}`, 14, 51);

            const tableData = examList.map(exam => [
                exam.module,
                `${exam.niveau} / ${exam.group}`,
                exam.room,
                new Date(exam.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR'),
                `${exam.start_time} - ${exam.end_time}`
            ]);

            autoTable(doc, {
                startY: 60,
                head: [[t.module, t.levelGroup, t.room, t.date, t.schedule]],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [58, 83, 119], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
                bodyStyles: { textColor: [11, 40, 68], halign: 'center' },
                alternateRowStyles: { fillColor: [238, 242, 248] },
                margin: { left: 14, right: 14 },
                styles: { fontSize: 9, cellPadding: 5, lineColor: [58, 83, 119], lineWidth: 0.5 }
            });

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(118, 143, 166);
                doc.text(t.copyright || "Copyright © 2026 Université Abou Bekr Belkaïd Tlemcen", doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
            }

            doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(language === 'fr' ? "Erreur lors de la génération du PDF" : "خطأ في إنشاء ملف PDF");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#E6EEF7]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#3A5377] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#0B2844] font-montserrat font-semibold">{t.loading || "Chargement..."}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#E6EEF7] p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border-2 border-red-500">
                    <p className="text-red-600 mb-4">{t.error || "Erreur"}: {error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {t.retry || "Réessayer"}
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col min-h-screen bg-[#E6EEF7] ${language === 'ar' ? 'rtl' : 'ltr'}`}>
            <div className="flex-grow relative">
                <img src={uniLogo} alt="UABT Logo" className="absolute top-4 left-4 w-14 h-14 object-contain logo-hover" />

                <h1 className="text-2xl font-semibold text-center pt-6 mb-6 text-[#0B2844] font-montserrat fade-in">
                    {t.department}
                </h1>

                <div className="absolute top-4 right-4 flex items-center space-x-3">
                    <NotificationButton />
                    <div
                        className="border-2 border-[#0B2844] rounded-2xl p-2 cursor-pointer hover:bg-gray-100 icon-hover"
                        onClick={handleLogout}
                    >
                        <img src={logoutIcon} alt="user-logout" className="w-6 h-6 object-contain" />
                    </div>
                </div>

                <div className="mt-4 border-t border-[#3A5377] w-full fade-in"></div>

                <div className={`mt-12 flex ${language === 'ar' ? 'justify-end mr-8' : 'justify-start ml-8'}`}>
                    <p className="text-[#0B2844] text-lg font-semibold font-montserrat fade-in">{t.teacherSpace}</p>
                </div>

                <div className="flex justify-center mt-8 space-x-4 fade-in">
                    <button
                        onClick={() => {
                            setCurrentView("schedule");
                            setActiveTabS1("");
                            setActiveTabS2("");
                        }}
                        className={`px-8 py-3 rounded-lg font-montserrat font-semibold transition-all hover-scale ${
                            currentView === "schedule"
                                ? "bg-[#3A5377] text-white shadow-lg"
                                : "bg-[#EEF2F8] text-[#0B2844] border-2 border-[#3A5377] hover:bg-[#3A5377] hover:text-white"
                        }`}
                    >
                        {t.examSchedule}
                    </button>
                    <button
                        onClick={() => {
                            setCurrentView("profile");
                            setActiveTabS1("");
                            setActiveTabS2("");
                        }}
                        className={`px-8 py-3 rounded-lg font-montserrat font-semibold transition-all hover-scale ${
                            currentView === "profile"
                                ? "bg-[#3A5377] text-white shadow-lg"
                                : "bg-[#EEF2F8] text-[#0B2844] border-2 border-[#3A5377] hover:bg-[#3A5377] hover:text-white"
                        }`}
                    >
                        {t.myProfile}
                    </button>
                </div>

                {currentView === "profile" ? (
                    <ProfileView />
                ) : (
                    <>
                        <div className="flex items-center justify-center mt-12 fade-in">
                            <div
                                className={`bg-[#EEF2F8] shadow-lg rounded-lg p-4 border-2 border-[#3A5377] ${language === 'ar' ? 'text-right' : ''}`}
                                style={{ width: "1600px", minHeight: "300px" }}
                            >
                                {teacherData && (
                                    <>
                                        <p className={`text-[#0B2844] mb-4 text-xl font-semibold font-montserrat ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.teacherName} {teacherData.name}
                                        </p>
                                        <p className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.teacherId} {teacherData.matricule}
                                        </p>
                                        <p className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.email} {teacherData.email}
                                        </p>
                                    </>
                                )}

                                <p className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                    {t.semesters}
                                </p>

                                <div className="flex items-center space-x-4 mb-2">
                                    <p className="text-[#0B2844] font-regular font-montserrat w-12">S1</p>
                                    <div className="flex space-x-3">
                                        {["CC", "EXAM", "RATT"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTabS1(tab);
                                                    setActiveTabS2("");
                                                }}
                                                className={`px-6 py-2 rounded-lg font-montserrat font-semibold transition-all hover-scale ${
                                                    activeTabS1 === tab
                                                        ? "bg-[#3A5377] text-white shadow-md"
                                                        : "bg-white text-[#0B2844] border-2 border-[#3A5377] hover:bg-[#3A5377] hover:text-white"
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 mb-6">
                                    <p className="text-[#0B2844] font-regular font-montserrat w-12">S2</p>
                                    <div className="flex space-x-3">
                                        {["CC", "EXAM", "RATT"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTabS2(tab);
                                                    setActiveTabS1("");
                                                }}
                                                className={`px-6 py-2 rounded-lg font-montserrat font-semibold transition-all hover-scale ${
                                                    activeTabS2 === tab
                                                        ? "bg-[#3A5377] text-white shadow-md"
                                                        : "bg-white text-[#0B2844] border-2 border-[#3A5377] hover:bg-[#3A5377] hover:text-white"
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* All tab contents use the restored ExamTable */}
                        {activeTabS1 === "CC" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.ccS1} examList={filterBySemester(cc, "1")} />
                                <div className="mt-4 flex space-x-3">
                                    <button onClick={() => setActiveTabS1("")} className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale">
                                        {t.close}
                                    </button>
                                    <button onClick={() => handleExportPDF(t.ccS1, filterBySemester(cc, "1"))} className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button onClick={() => { const list = filterBySemester(cc, "1"); setClaimCandidates(list); setSelectedExamForClaim(list[0] || null); setClaimReason(""); setShowClaimModal(true); }} className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale">
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Repeat similar pattern for other tabs... (EXAM S1, RATT S1, S2, etc.) */}
                        {/* ... (same as in your original code, only ExamTable changed) */}

                        {/* For brevity, the other 5 tab blocks are identical in structure to the one above */}
                        {/* Only difference is title, list, and activeTab */}

                        {activeTabS1 === "EXAM" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.examS1} examList={filterBySemester(exams, "1")} />
                                <div className="mt-4 flex space-x-3">
                                    <button onClick={() => setActiveTabS1("")} className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale">{t.close}</button>
                                    <button onClick={() => handleExportPDF(t.examS1, filterBySemester(exams, "1"))} className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button onClick={() => { const list = filterBySemester(exams, "1"); setClaimCandidates(list); setSelectedExamForClaim(list[0] || null); setClaimReason(""); setShowClaimModal(true); }} className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale">
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS1 === "RATT" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.rattS1} examList={filterBySemester(rattrapage, "1")} />
                                <div className="mt-4 flex space-x-3">
                                    <button onClick={() => setActiveTabS1("")} className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale">{t.close}</button>
                                    <button onClick={() => handleExportPDF(t.rattS1, filterBySemester(rattrapage, "1"))} className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button onClick={() => { const list = filterBySemester(rattrapage, "1"); setClaimCandidates(list); setSelectedExamForClaim(list[0] || null); setClaimReason(""); setShowClaimModal(true); }} className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale">
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "CC" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.ccS2} examList={filterBySemester(cc, "2")} />
                                <div className="mt-4 flex space-x-3">
                                    <button onClick={() => setActiveTabS2("")} className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale">{t.close}</button>
                                    <button onClick={() => handleExportPDF(t.ccS2, filterBySemester(cc, "2"))} className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button onClick={() => { const list = filterBySemester(cc, "2"); setClaimCandidates(list); setSelectedExamForClaim(list[0] || null); setClaimReason(""); setShowClaimModal(true); }} className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale">
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "EXAM" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.examS2} examList={filterBySemester(exams, "2")} />
                                <div className="mt-4 flex space-x-3">
                                    <button onClick={() => setActiveTabS2("")} className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale">{t.close}</button>
                                    <button onClick={() => handleExportPDF(t.examS2, filterBySemester(exams, "2"))} className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button onClick={() => { const list = filterBySemester(exams, "2"); setClaimCandidates(list); setSelectedExamForClaim(list[0] || null); setClaimReason(""); setShowClaimModal(true); }} className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale">
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "RATT" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.rattS2} examList={filterBySemester(rattrapage, "2")} />
                                <div className="mt-4 flex space-x-3">
                                    <button onClick={() => setActiveTabS2("")} className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale">{t.close}</button>
                                    <button onClick={() => handleExportPDF(t.rattS2, filterBySemester(rattrapage, "2"))} className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button onClick={() => { const list = filterBySemester(rattrapage, "2"); setClaimCandidates(list); setSelectedExamForClaim(list[0] || null); setClaimReason(""); setShowClaimModal(true); }} className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale">
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <NotificationsModal />

            <Modal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                title={t.reportExam}
            >
                <div>
                    <p className="font-semibold mb-2">{t.selectExam}</p>
                    <select
                        value={selectedExamForClaim?.id || ""}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            const ex = claimCandidates.find((c) => c.id === id) || null;
                            setSelectedExamForClaim(ex);
                        }}
                        className="w-full border p-2 mb-3 rounded"
                    >
                        {claimCandidates.length === 0 && (
                            <option value="">{t.noExamAvailable}</option>
                        )}
                        {claimCandidates.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                                {exam.module} — {exam.niveau}/{exam.group} — {new Date(exam.date).toLocaleDateString("fr-FR")}
                            </option>
                        ))}
                    </select>

                    <p className="font-semibold mb-2">{t.reason}</p>
                    <textarea
                        rows={6}
                        value={claimReason}
                        onChange={(e) => setClaimReason(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder={t.reasonPlaceholder}
                    />

                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                            onClick={() => setShowClaimModal(false)}
                            disabled={claimSubmitting}
                        >
                            {t.cancel}
                        </button>
                        <button
                            className="px-6 py-2 bg-[#3A5377] text-white rounded-lg hover:bg-[#0B2844] disabled:bg-gray-400"
                            onClick={handleSubmitClaim}
                            disabled={claimSubmitting || !selectedExamForClaim}
                        >
                            {claimSubmitting ? t.sending : t.send}
                        </button>
                    </div>
                </div>


            <footer className="bg-white border-t border-[#768FA6] mt-auto fade-in">
                <div className="px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm text-[#768FA6] font-montserrat">
                            {t.copyright}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-2">
                            Exam Schedule
                        </h3>
                        <p className="text-gray-600">View your exam schedule</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-2">Students</h3>
                        <p className="text-gray-600">Manage your students</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
