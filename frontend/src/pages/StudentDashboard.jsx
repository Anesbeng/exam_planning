import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logoutIcon from "./logout.png";
import uniLogo from "./logouni.png";
import studentIcon from "./student.png";
import '../styles/dashboard.css'; // Added import for custom CSS with animations and styles

export default function EspaceEtudiants() {
    const navigate = useNavigate();
    const [activeTabS1, setActiveTabS1] = useState("");
    const [activeTabS2, setActiveTabS2] = useState("");
    const [studentData, setStudentData] = useState(null);
    const [exams, setExams] = useState([]);
    const [cc, setCc] = useState([]);
    const [rattrapage, setRattrapage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState("schedule"); // "schedule" or "profile"
    const [language, setLanguage] = useState("fr"); // "fr" or "ar"

    // Translations object
    const translations = {
        fr: {
            department: "Departement Informatique",
            studentSpace: "Espace Etudiants",
            examSchedule: "Planning des Examens",
            myProfile: "Mon Profil",
            studentProfile: "Profil Étudiant",
            fullName: "Nom Complet",
            studentId: "Matricule",
            email: "Email",
            logout: "Déconnexion",
            specialty: "Spécialité",
            level: "Niveau",
            group: "Groupe",
            semesters: "Semestres :",
            studentName: "Nom Etudiant :",
            module: "Module",
            teacher: "Enseignant",
            room: "Salle",
            date: "Date",
            schedule: "Horaire",
            close: "Fermer",
            loading: "Chargement...",
            error: "Erreur:",
            retry: "Réessayer",
            noExam: "Aucun examen planifié",
            ccS1: "PLANNING S1 - CONTRÔLE CONTINU",
            ccS2: "PLANNING S2 - CONTRÔLE CONTINU",
            examS1: "PLANNING S1 - EXAMENS",
            examS2: "PLANNING S2 - EXAMENS",
            rattS1: "PLANNING S1 - RATTRAPAGES",
            rattS2: "PLANNING S2 - RATTRAPAGES",
            copyright: "Copyright © 2026 Université Abou Bekr Belkaïd Tlemcen. Tous droits réservés."
        },
        ar: {
            department: "قسم الإعلام الآلي",
            studentSpace: "فضاء الطلبة",
            examSchedule: "جدول الامتحانات",
            myProfile: "ملفي الشخصي",
            studentProfile: "الملف الشخصي للطالب",
            fullName: "الاسم الكامل",
            studentId: "رقم التسجيل",
            email: "البريد الإلكتروني",
            logout: "تسجيل الخروج",
            specialty: "التخصص",
            level: "المستوى",
            group: "المجموعة",
            semesters: "السداسيات:",
            studentName: "اسم الطالب:",
            module: "المقياس",
            teacher: "الأستاذ",
            room: "القاعة",
            date: "التاريخ",
            schedule: "التوقيت",
            close: "إغلاق",
            loading: "جاري التحميل...",
            error: "خطأ:",
            retry: "إعادة المحاولة",
            noExam: "لا توجد امتحانات مجدولة",
            ccS1: "جدول السداسي الأول - المراقبة المستمرة",
            ccS2: "جدول السداسي الثاني - المراقبة المستمرة",
            examS1: "جدول السداسي الأول - الامتحانات",
            examS2: "جدول السداسي الثاني - الامتحانات",
            rattS1: "جدول السداسي الأول - الاستدراك",
            rattS2: "جدول السداسي الثاني - الاستدراك",
            copyright: "حقوق النشر © 2026 جامعة أبو بكر بلقايد تلمسان. جميع الحقوق محفوظة."
            
        }
    };

    const t = translations[language];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "student") {
            navigate("/Login");
            return;
        }
        fetchStudentExams(user.matricule);
    }, [navigate]);

    const fetchStudentExams = async (matricule) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/student/exams?matricule=${matricule}`);
            const data = response.data;
            
            setStudentData(data.student);
            setExams(data.exams || []);
            setCc(data.cc || []);
            setRattrapage(data.rattrapage || []);
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
                                <th className="border border-[#3A5377] px-4 py-3">{t.teacher}</th>
                                <th className="border border-[#3A5377] px-4 py-3">{t.room}</th>
                                <th className="border border-[#3A5377] px-4 py-3">{t.date}</th>
                                <th className="border border-[#3A5377] px-4 py-3">{t.schedule}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examList.map((exam, index) => (
                                <tr key={index} className="text-center hover-row">
                                    <td className="border border-[#3A5377] px-4 py-3 font-semibold">{exam.module}</td>
                                    <td className="border border-[#3A5377] px-4 py-3">{exam.teacher}</td>
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

    const ProfileView = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        
        return (
            <div className="flex items-center justify-center mt-12 fade-in">
                <div className={`bg-[#EEF2F8] shadow-lg rounded-lg p-8 border-2 border-[#3A5377] ${language === 'ar' ? 'text-right' : ''}`} style={{ width: "800px" }}>
                    <h2 className="text-center text-[#0B2844] font-semibold font-montserrat mb-8 text-2xl">
                        {t.studentProfile}
                    </h2>
                    
                    {/* Profile Photo Section */}
                    <div className="flex justify-center mb-8">
                        <div className="relative profile-photo">
                            <div className="w-32 h-32 overflow-hidden flex items-center justify-center">
                                <img 
                                    src={studentData?.photo || studentIcon} 
                                    alt="Photo de profil" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="border-b border-[#3A5377] pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">{t.fullName}</p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {studentData?.name || "N/A"}
                            </p>
                        </div>
                        
                        <div className="border-b border-[#3A5377] pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">{t.studentId}</p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {user?.matricule || "N/A"}
                            </p>
                        </div>
                        
                        <div className="pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">{t.email}</p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {user?.email || "N/A"}
                            </p>
                        </div>
                    </div>
                    
                    {/* Language and Logout Buttons */}
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

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#E6EEF7]">
                <div className="text-[#0B2844] text-xl font-semibold">
                    {t.loading}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#E6EEF7]">
                <div className="text-red-600 text-xl font-semibold mb-4">
                    {t.error} {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover-scale"
                >
                    {t.retry}
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

                <div
                    className="absolute top-4 right-4 border-2 border-[#0B2844] rounded-2xl p-2 cursor-pointer hover:bg-gray-100 icon-hover"
                    onClick={handleLogout}
                >
                    <img src={logoutIcon} alt="user-logout" className="w-6 h-6 object-contain" />
                </div>

                <div className="mt-4 border-t border-[#3A5377] w-full fade-in"></div>

                <div className={`mt-12 flex ${language === 'ar' ? 'justify-end mr-8' : 'justify-start ml-8'}`}>
                    <p className="text-[#0B2844] text-lg font-semibold font-montserrat fade-in">{t.studentSpace}</p>
                </div>

                {/* Navigation Tabs */}
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

                {/* Conditional Rendering Based on Current View */}
                {currentView === "profile" ? (
                    <ProfileView />
                ) : (
                    <>
                        <div className="flex items-center justify-center mt-12 fade-in">
                            <div
                                className={`bg-[#EEF2F8] shadow-lg rounded-lg p-4 border-2 border-[#3A5377] ${language === 'ar' ? 'text-right' : ''}`}
                                style={{ width: "1600px", minHeight: "300px" }}
                            >
                                {studentData && (
                                    <>
                                        <p className={`text-[#0B2844] mb-4 text-xl font-semibold font-montserrat ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.studentName} {studentData.name}
                                        </p>
                                        <p className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.specialty} {studentData.specialite}
                                        </p>
                                        <p className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.level} {studentData.niveau}
                                        </p>
                                        <p className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t.group} {studentData.groupe}
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
                                                className={`text-[#0B2844] font-montserrat hover:underline tab-hover ${
                                                    activeTabS1 === tab ? "underline font-semibold" : ""
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 mb-2">
                                    <p className="text-[#0B2844] font-regular font-montserrat w-12">S2</p>
                                    <div className="flex space-x-3">
                                        {["CC", "EXAM", "RATT"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTabS2(tab);
                                                    setActiveTabS1("");
                                                }}
                                                className={`text-[#0B2844] font-montserrat hover:underline tab-hover ${
                                                    activeTabS2 === tab ? "underline font-semibold" : ""
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {activeTabS1 === "CC" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.ccS1} examList={filterBySemester(cc, "1")} />
                                <button
                                    onClick={() => setActiveTabS1("")}
                                    className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                >
                                    {t.close}
                                </button>
                            </div>
                        )}

                        {activeTabS1 === "EXAM" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.examS1} examList={filterBySemester(exams, "1")} />
                                <button
                                    onClick={() => setActiveTabS1("")}
                                    className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                >
                                    {t.close}
                                </button>
                            </div>
                        )}

                        {activeTabS1 === "RATT" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.rattS1} examList={filterBySemester(rattrapage, "1")} />
                                <button
                                    onClick={() => setActiveTabS1("")}
                                    className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                >
                                    {t.close}
                                </button>
                            </div>
                        )}

                        {activeTabS2 === "CC" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.ccS2} examList={filterBySemester(cc, "2")} />
                                <button
                                    onClick={() => setActiveTabS2("")}
                                    className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                >
                                    {t.close}
                                </button>
                            </div>
                        )}

                        {activeTabS2 === "EXAM" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.examS2} examList={filterBySemester(exams, "2")} />
                                <button
                                    onClick={() => setActiveTabS2("")}
                                    className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                >
                                    {t.close}
                                </button>
                            </div>
                        )}

                        {activeTabS2 === "RATT" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.rattS2} examList={filterBySemester(rattrapage, "2")} />
                                <button
                                    onClick={() => setActiveTabS2("")}
                                    className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                >
                                    {t.close}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <footer className="bg-white border-t border-[#768FA6] mt-auto fade-in">
                <div className="px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm text-[#768FA6] font-montserrat">
                            {t.copyright}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}