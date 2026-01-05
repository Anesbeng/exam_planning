import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logoutIcon from "./images/logout.png";
import uniLogo from "./images/logouni.png";
import studentIcon from "./images/student.png";
import "../styles/dashboard.css";

export default function EspaceEtudiants() {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [exams, setExams] = useState([]);
    const [cc, setCc] = useState([]);
    const [rattrapage, setRattrapage] = useState([]);
    const [studentSemesters, setStudentSemesters] = useState([]); // Only semesters student has exams in
    const [activeSemester, setActiveSemester] = useState(null);
    const [selectedExamType, setSelectedExamType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState("schedule");
    const [language, setLanguage] = useState("fr");

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
            semesters: "Mes Semestres :",
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
            cc: "CONTRÔLE CONTINU",
            exam: "EXAMENS",
            rattrapage: "RATTRAPAGES",
            copyright:
                "Copyright © 2026 Université Abou Bekr Belkaïd Tlemcen. Tous droits réservés.",
            noExamAvailable: "Aucun examen disponible",
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
            semesters: "سداسياتي :",
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
            cc: "المراقبة المستمرة",
            exam: "الامتحانات",
            rattrapage: "الاستدراك",
            copyright:
                "حقوق النشر © 2026 جامعة أبو بكر بلقايد تلمسان. جميع الحقوق محفوظة.",
            noExamAvailable: "لا توجد امتحانات",
        },
    };

    const t = translations[language];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "student") {
            navigate("/");
            return;
        }
        fetchStudentExams(user.matricule);
    }, [navigate]);

    const fetchStudentExams = async (matricule) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch student exams
            const examResponse = await api.get(
                `/student/exams?matricule=${matricule}`
            );
            const examData = examResponse.data;

            setStudentData(examData.student);
            setExams(examData.exams || []);
            setCc(examData.cc || []);
            setRattrapage(examData.rattrapage || []);

            // Extract unique semesters from student's exams
            const allStudentExams = [
                ...(examData.exams || []),
                ...(examData.cc || []),
                ...(examData.rattrapage || []),
            ];

            // Get unique semester names
            const uniqueSemesterNames = [
                ...new Set(
                    allStudentExams
                        .filter((exam) => exam.semester)
                        .map((exam) => exam.semester)
                ),
            ];

            // Create semester objects with name and id
            const studentSemestersData = uniqueSemesterNames.map(
                (name, index) => ({
                    id: index + 1,
                    name: name,
                })
            );

            setStudentSemesters(studentSemestersData);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to fetch exam data"
            );
            console.error("Error fetching exams:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterBySemester = (examList, semesterName) => {
        if (!examList) return [];
        return examList.filter((exam) => exam.semester === semesterName);
    };

    const handleSemesterExamClick = (semester, examType) => {
        setActiveSemester(semester);
        setSelectedExamType(examType);
    };

    const ExamTable = ({ title, examList }) => {
        if (!examList || examList.length === 0) {
            return (
                <div className="bg-[#EEF2F8] shadow-lg rounded-lg p-6 border-2 border-[#3A5377] fade-in">
                    <h2
                        className={`text-center text-[#0B2844] font-semibold font-montserrat mb-4 text-xl ${
                            language === "ar" ? "text-right" : ""
                        }`}
                    >
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
                <h2
                    className={`text-center text-[#0B2844] font-semibold font-montserrat mb-4 text-xl ${
                        language === "ar" ? "text-right" : ""
                    }`}
                >
                    {title}
                </h2>
                <div className="overflow-x-auto">
                    <table
                        className={`min-w-full border border-[#3A5377] rounded-lg text-[#0B2844] font-montserrat exam-table ${
                            language === "ar" ? "text-right" : ""
                        }`}
                    >
                        <thead>
                            <tr className="text-center bg-[#F8FAFC]">
                                <th className="border border-[#3A5377] px-4 py-3">
                                    {t.module}
                                </th>
                                <th className="border border-[#3A5377] px-4 py-3">
                                    {t.teacher}
                                </th>
                                <th className="border border-[#3A5377] px-4 py-3">
                                    {t.room}
                                </th>
                                <th className="border border-[#3A5377] px-4 py-3">
                                    {t.date}
                                </th>
                                <th className="border border-[#3A5377] px-4 py-3">
                                    {t.schedule}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {examList.map((exam, index) => (
                                <tr
                                    key={exam.id || index}
                                    className="text-center hover-row"
                                >
                                    <td className="border border-[#3A5377] px-4 py-3 font-semibold">
                                        {exam.module}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {exam.teacher}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {exam.room}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {new Date(exam.date).toLocaleDateString(
                                            language === "ar"
                                                ? "ar-DZ"
                                                : "fr-FR"
                                        )}
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
                <div
                    className={`bg-[#EEF2F8] shadow-lg rounded-lg p-8 border-2 border-[#3A5377] ${
                        language === "ar" ? "text-right" : ""
                    }`}
                    style={{ width: "800px" }}
                >
                    <h2 className="text-center text-[#0B2844] font-semibold font-montserrat mb-8 text-2xl">
                        {t.studentProfile}
                    </h2>

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
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                {t.fullName}
                            </p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {studentData?.name || "N/A"}
                            </p>
                        </div>

                        <div className="border-b border-[#3A5377] pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                {t.studentId}
                            </p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {user?.matricule || "N/A"}
                            </p>
                        </div>

                        <div className="border-b border-[#3A5377] pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                {t.email}
                            </p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {studentData?.email || "N/A"}
                            </p>
                        </div>

                        {studentData?.specialite && (
                            <div className="border-b border-[#3A5377] pb-4">
                                <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                    {t.specialty}
                                </p>
                                <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                    {studentData.specialite}
                                </p>
                            </div>
                        )}

                        {studentData?.niveau && (
                            <div className="border-b border-[#3A5377] pb-4">
                                <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                    {t.level}
                                </p>
                                <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                    {studentData.niveau}
                                </p>
                            </div>
                        )}

                        {studentData?.groupe && (
                            <div className="pb-4">
                                <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                    {t.group}
                                </p>
                                <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                    {studentData.groupe}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            onClick={() =>
                                setLanguage(language === "fr" ? "ar" : "fr")
                            }
                            className="px-8 py-3 bg-[#3A5377] text-white rounded-lg font-montserrat font-semibold hover:bg-[#0B2844] transition-all shadow-md flex items-center space-x-2 hover-scale"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                                />
                            </svg>
                            <span>
                                {language === "fr" ? "عربية" : "Français"}
                            </span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="px-8 py-3 bg-red-600 text-white rounded-lg font-montserrat font-semibold hover:bg-red-700 transition-all shadow-md flex items-center space-x-2 hover-scale"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span>{t.logout}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleLogout = async () => {
        try {
            // Call the logout endpoint to invalidate the token server-side
            await api.post("/auth/logout"); // Adjust the endpoint as per your backend
            // If your backend doesn't require a body or specific headers, this is fine
        } catch (err) {
            // Even if the logout request fails (e.g., network issue),
            // we still want to clear local data for security
            console.warn(
                "Logout API failed, proceeding with local cleanup:",
                err
            );
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
        <div
            className={`flex flex-col min-h-screen bg-[#E6EEF7] ${
                language === "ar" ? "rtl" : "ltr"
            }`}
        >
            <div className="flex-grow relative">
                <img
                    src={uniLogo}
                    alt="UABT Logo"
                    className="absolute top-4 left-4 w-14 h-14 object-contain logo-hover"
                />

                <h1 className="text-2xl font-semibold text-center pt-6 mb-6 text-[#0B2844] font-montserrat fade-in">
                    {t.department}
                </h1>

                <div
                    className="absolute top-4 right-4 border-2 border-[#0B2844] rounded-2xl p-2 cursor-pointer hover:bg-gray-100 icon-hover"
                    onClick={handleLogout}
                >
                    <img
                        src={logoutIcon}
                        alt="user-logout"
                        className="w-6 h-6 object-contain"
                    />
                </div>

                <div className="mt-4 border-t border-[#3A5377] w-full fade-in"></div>

                <div
                    className={`mt-12 flex ${
                        language === "ar"
                            ? "justify-end mr-8"
                            : "justify-start ml-8"
                    }`}
                >
                    <p className="text-[#0B2844] text-lg font-semibold font-montserrat fade-in">
                        {t.studentSpace}
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mt-8 space-x-4 fade-in">
                    <button
                        onClick={() => {
                            setCurrentView("schedule");
                            setActiveSemester(null);
                            setSelectedExamType(null);
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
                            setActiveSemester(null);
                            setSelectedExamType(null);
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
                                className={`bg-[#EEF2F8] shadow-lg rounded-lg p-4 border-2 border-[#3A5377] ${
                                    language === "ar" ? "text-right" : ""
                                }`}
                                style={{ width: "1600px", minHeight: "300px" }}
                            >
                                {studentData && (
                                    <>
                                        <p
                                            className={`text-[#0B2844] mb-4 text-xl font-semibold font-montserrat ${
                                                language === "ar"
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}
                                        >
                                            {t.studentName} {studentData.name}
                                        </p>
                                        {studentData.specialite && (
                                            <p
                                                className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${
                                                    language === "ar"
                                                        ? "text-right"
                                                        : "text-left"
                                                }`}
                                            >
                                                {t.specialty}{" "}
                                                {studentData.specialite}
                                            </p>
                                        )}
                                        {studentData.niveau && (
                                            <p
                                                className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${
                                                    language === "ar"
                                                        ? "text-right"
                                                        : "text-left"
                                                }`}
                                            >
                                                {t.level} {studentData.niveau}
                                            </p>
                                        )}
                                        {studentData.groupe && (
                                            <p
                                                className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${
                                                    language === "ar"
                                                        ? "text-right"
                                                        : "text-left"
                                                }`}
                                            >
                                                {t.group} {studentData.groupe}
                                            </p>
                                        )}
                                    </>
                                )}

                                <p
                                    className={`text-[#0B2844] mb-4 font-semibold font-montserrat ${
                                        language === "ar"
                                            ? "text-right"
                                            : "text-left"
                                    }`}
                                >
                                    {t.semesters}
                                </p>

                                {/* Show only student's semesters with exams */}
                                {studentSemesters.length > 0 ? (
                                    studentSemesters.map((semester) => (
                                        <div
                                            key={semester.id}
                                            className="flex items-center space-x-4 mb-2"
                                        >
                                            <p className="text-[#0B2844] font-regular font-montserrat w-24">
                                                {semester.name}
                                            </p>
                                            <div className="flex space-x-3">
                                                {["CC", "EXAM", "RATT"].map(
                                                    (tab) => (
                                                        <button
                                                            key={tab}
                                                            onClick={() =>
                                                                handleSemesterExamClick(
                                                                    semester,
                                                                    tab
                                                                )
                                                            }
                                                            className={`text-[#0B2844] font-montserrat hover:underline tab-hover ${
                                                                activeSemester?.id ===
                                                                    semester.id &&
                                                                selectedExamType ===
                                                                    tab
                                                                    ? "underline font-semibold"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {tab}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        {t.noExamAvailable}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Show Selected Exam Table */}
                        {activeSemester && selectedExamType && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable
                                    title={`${activeSemester.name} - ${
                                        selectedExamType === "CC"
                                            ? t.cc
                                            : selectedExamType === "EXAM"
                                            ? t.exam
                                            : t.rattrapage
                                    }`}
                                    examList={
                                        selectedExamType === "CC"
                                            ? filterBySemester(
                                                  cc,
                                                  activeSemester.name
                                              )
                                            : selectedExamType === "EXAM"
                                            ? filterBySemester(
                                                  exams,
                                                  activeSemester.name
                                              )
                                            : filterBySemester(
                                                  rattrapage,
                                                  activeSemester.name
                                              )
                                    }
                                />
                                <button
                                    onClick={() => {
                                        setActiveSemester(null);
                                        setSelectedExamType(null);
                                    }}
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
