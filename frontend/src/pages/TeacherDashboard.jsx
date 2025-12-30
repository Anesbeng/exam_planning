import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "./UI/Modal";
import NotificationBell from "./NotificationBell";
import logoutIcon from "./logout.png";
import uniLogo from "./logouni.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import teacherIcon from "./teacher.png";
import "../styles/dashboard.css";

export default function EspaceEnseignants() {
    const navigate = useNavigate();

    /* ================= STATES ================= */
    const [teacherData, setTeacherData] = useState(null);
    const [allExams, setAllExams] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState("schedule");
    const [language, setLanguage] = useState("fr");

    // Filter states
    const [selectedExamType, setSelectedExamType] = useState("ALL"); // ALL, CC, EXAM, RATT
    const [selectedSemester, setSelectedSemester] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    /* ================= CLAIM STATES ================= */
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedExamForClaim, setSelectedExamForClaim] = useState(null);
    const [claimMessage, setClaimMessage] = useState("");
    const [claimSubmitting, setClaimSubmitting] = useState(false);

    /* ================= TRANSLATIONS ================= */
    const translations = {
        fr: {
            department: "Departement Informatique",
            teacherSpace: "Espace Enseignants",
            examSchedule: "Planning des Examens",
            myProfile: "Mon Profil",
            teacherProfile: "Profil Enseignant",
            fullName: "Nom Complet",
            teacherId: "Matricule",
            email: "Email",
            logout: "Déconnexion",
            specialty: "Spécialité",
            level: "Niveau",
            group: "Groupe",
            module: "Module",
            levelGroup: "Niveau/Groupe",
            room: "Salle",
            date: "Date",
            schedule: "Horaire",
            semester: "Semestre",
            close: "Fermer",
            report: "Signaler",
            export: "Exporter PDF",
            loading: "Chargement...",
            error: "Erreur:",
            retry: "Réessayer",
            noExam: "Aucun examen planifié",
            all: "TOUS",
            cc: "CONTRÔLE CONTINU",
            exam: "EXAMENS",
            ratt: "RATTRAPAGES",
            reportExam: "Signaler un examen",
            reason: "Message :",
            reasonPlaceholder: "Expliquez la raison de votre réclamation...",
            cancel: "Annuler",
            send: "Envoyer",
            sending: "Envoi...",
            noExamAvailable: "Aucun examen disponible",
            university: "Université Abou Bekr Belkaïd - Tlemcen",
            copyright:
                "Copyright © 2026 Université Abou Bekr Belkaïd Tlemcen. Tous droits réservés.",
            filterByType: "Filtrer par type :",
            filterBySemester: "Filtrer par semestre :",
            search: "Rechercher...",
            totalExams: "Total des examens",
            type: "Type",
            allSemesters: "Tous les semestres",
        },
        ar: {
            department: "قسم الإعلام الآلي",
            teacherSpace: "فضاء الأساتذة",
            examSchedule: "جدول الامتحانات",
            myProfile: "ملفي الشخصي",
            teacherProfile: "الملف الشخصي للأستاذ",
            fullName: "الاسم الكامل",
            teacherId: "رقم التسجيل",
            email: "البريد الإلكتروني",
            logout: "تسجيل الخروج",
            specialty: "التخصص",
            level: "المستوى",
            group: "المجموعة",
            module: "المقياس",
            levelGroup: "المستوى/المجموعة",
            room: "القاعة",
            date: "التاريخ",
            schedule: "التوقيت",
            semester: "السداسي",
            close: "إغلاق",
            report: "إبلاغ",
            export: "تصدير PDF",
            loading: "جاري التحميل...",
            error: "خطأ:",
            retry: "إعادة المحاولة",
            noExam: "لا توجد امتحانات",
            all: "الكل",
            cc: "المراقبة المستمرة",
            exam: "الامتحانات",
            ratt: "الاستدراك",
            reportExam: "إبلاغ عن امتحان",
            reason: "الرسالة :",
            reasonPlaceholder: "اشرح سبب إبلاغك...",
            cancel: "إلغاء",
            send: "إرسال",
            sending: "جاري الإرسال...",
            noExamAvailable: "لا توجد امتحانات",
            university: "جامعة أبو بكر بلقايد - تلمسان",
            copyright:
                "حقوق النشر © 2026 جامعة أبو بكر بلقايد تلمسان. جميع الحقوق محفوظة.",
            filterByType: "تصفية حسب النوع :",
            filterBySemester: "تصفية حسب السداسي :",
            search: "بحث...",
            totalExams: "إجمالي الامتحانات",
            type: "النوع",
            allSemesters: "جميع السداسيات",
        },
    };

    const t = translations[language];

    /* ================= FETCH TEACHER'S EXAMS ================= */
    const fetchTeacherData = async (matricule) => {
        try {
            setLoading(true);
            setError(null);

            const examResponse = await api.get(
                `/teacher/exams?matricule=${matricule}`
            );
            const examData = examResponse.data;

            setTeacherData(examData.teacher);

            // Combine all exams into one array with type property
            const combinedExams = [
                ...(examData.exams || []).map((exam) => ({
                    ...exam,
                    type: "examen",
                })),
                ...(examData.cc || []).map((exam) => ({ ...exam, type: "cc" })),
                ...(examData.rattrapage || []).map((exam) => ({
                    ...exam,
                    type: "rattrapage",
                })),
            ];

            // Sort by date and time
            combinedExams.sort((a, b) => {
                const dateCompare = new Date(a.date) - new Date(b.date);
                if (dateCompare !== 0) return dateCompare;
                return a.start_time.localeCompare(b.start_time);
            });

            setAllExams(combinedExams);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Erreur lors du chargement des données"
            );
            console.error("Error fetching teacher data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "teacher") {
            navigate("/Login");
            return;
        }
        fetchTeacherData(user.matricule);
    }, [navigate]);

    /* ================= FILTER LOGIC ================= */
    const getUniqueSemesters = () => {
        const semesters = [
            ...new Set(allExams.map((exam) => exam.semester).filter(Boolean)),
        ];
        return semesters.sort();
    };

    const getFilteredExams = () => {
        let filtered = allExams;

        // Filter by type
        if (selectedExamType !== "ALL") {
            const typeMap = {
                CC: "cc",
                EXAM: "examen",
                RATT: "rattrapage",
            };
            filtered = filtered.filter(
                (exam) => exam.type === typeMap[selectedExamType]
            );
        }

        // Filter by semester
        if (selectedSemester !== "ALL") {
            filtered = filtered.filter(
                (exam) => exam.semester === selectedSemester
            );
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (exam) =>
                    exam.module?.toLowerCase().includes(search) ||
                    exam.niveau?.toLowerCase().includes(search) ||
                    exam.group?.toLowerCase().includes(search) ||
                    exam.room?.toLowerCase().includes(search)
            );
        }

        return filtered;
    };

    const getExamTypeLabel = (type) => {
        const typeMap = {
            cc: t.cc,
            examen: t.exam,
            rattrapage: t.ratt,
        };
        return typeMap[type] || type;
    };

    /* ================= EXPORT PDF ================= */
    const exportToPDF = () => {
        const filteredExams = getFilteredExams();

        if (!filteredExams.length) {
            alert(t.noExam);
            return;
        }

        const doc = new jsPDF();

        // Title
        doc.setFontSize(16);
        doc.text(`${t.examSchedule}`, 20, 20);
        doc.setFontSize(12);
        doc.text(`${t.fullName}: ${teacherData?.name || ""}`, 20, 30);

        // Filter info
        let filterInfo = "";
        if (selectedExamType !== "ALL") {
            const typeMap = { CC: t.cc, EXAM: t.exam, RATT: t.ratt };
            filterInfo += `${t.type}: ${typeMap[selectedExamType]} `;
        }
        if (selectedSemester !== "ALL") {
            filterInfo += `${t.semester}: ${selectedSemester}`;
        }
        if (filterInfo) {
            doc.text(filterInfo, 20, 37);
        }

        // Table
        autoTable(doc, {
            head: [
                [
                    t.type,
                    t.module,
                    t.semester,
                    t.levelGroup,
                    t.room,
                    t.date,
                    t.schedule,
                ],
            ],
            body: filteredExams.map((exam) => [
                getExamTypeLabel(exam.type),
                exam.module,
                exam.semester || "-",
                `${exam.niveau}/${exam.group}`,
                exam.room,
                new Date(exam.date).toLocaleDateString(),
                `${exam.start_time} - ${exam.end_time}`,
            ]),
            startY: filterInfo ? 45 : 40,
        });

        doc.save(`planning_examens_${teacherData?.name || "enseignant"}.pdf`);
    };

    /* ================= CLAIM FUNCTIONS ================= */
    const handleOpenClaimModal = (exam) => {
        setSelectedExamForClaim(exam);
        setClaimMessage("");
        setShowClaimModal(true);
    };

    const handleSubmitClaim = async () => {
        if (!claimMessage.trim()) {
            alert("Veuillez saisir un message");
            return;
        }

        if (!selectedExamForClaim) {
            alert("Veuillez sélectionner un examen");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("Utilisateur non connecté");
            return;
        }

        setClaimSubmitting(true);
        try {
            await api.post("/claims", {
                exam_id: selectedExamForClaim.id,
                exam_type: selectedExamForClaim.type,
                message: claimMessage,
                teacher_matricule: user.matricule,
            });

            alert("Réclamation envoyée avec succès");
            setShowClaimModal(false);
            setClaimMessage("");
            setSelectedExamForClaim(null);
        } catch (err) {
            console.error("Error submitting claim:", err);
            alert(
                err.response?.data?.message ||
                    "Erreur lors de l'envoi de la réclamation"
            );
        } finally {
            setClaimSubmitting(false);
        }
    };

    /* ================= LOGOUT ================= */
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    /* ================= PROFILE VIEW ================= */
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
                        {t.teacherProfile}
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
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                {t.fullName}
                            </p>
                            <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                {teacherData?.name || "N/A"}
                            </p>
                        </div>

                        <div className="border-b border-[#3A5377] pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                {t.teacherId}
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
                                {teacherData?.email || "N/A"}
                            </p>
                        </div>

                        {teacherData?.specialite && (
                            <div className="pb-4">
                                <p className="text-[#768FA6] text-sm font-montserrat mb-1">
                                    {t.specialty}
                                </p>
                                <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                                    {teacherData.specialite}
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

    /* ================= SCHEDULE VIEW ================= */
    const ScheduleView = () => {
        const filteredExams = getFilteredExams();
        const uniqueSemesters = getUniqueSemesters();

        return (
            <div className="mt-12 px-8 fade-in">
                {/* Filters Section */}
                <div className="bg-[#EEF2F8] shadow-lg rounded-lg p-6 border-2 border-[#3A5377] mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-[#0B2844] font-semibold font-montserrat mb-2">
                                {t.filterByType}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {["ALL", "CC", "EXAM", "RATT"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() =>
                                            setSelectedExamType(type)
                                        }
                                        className={`px-4 py-2 rounded-lg font-montserrat font-semibold transition-all ${
                                            selectedExamType === type
                                                ? "bg-[#3A5377] text-white shadow-md"
                                                : "bg-white text-[#0B2844] border-2 border-[#3A5377] hover:bg-[#3A5377] hover:text-white"
                                        }`}
                                    >
                                        {type === "ALL"
                                            ? t.all
                                            : type === "CC"
                                            ? t.cc
                                            : type === "EXAM"
                                            ? t.exam
                                            : t.ratt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Semester Filter */}
                        <div>
                            <label className="block text-[#0B2844] font-semibold font-montserrat mb-2">
                                {t.filterBySemester}
                            </label>
                            <select
                                value={selectedSemester}
                                onChange={(e) =>
                                    setSelectedSemester(e.target.value)
                                }
                                className="w-full px-4 py-2 border-2 border-[#3A5377] rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-[#3A5377]"
                            >
                                <option value="ALL">{t.allSemesters}</option>
                                {uniqueSemesters.map((semester) => (
                                    <option key={semester} value={semester}>
                                        {semester}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-[#0B2844] font-semibold font-montserrat mb-2">
                                {t.search}
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t.search}
                                className="w-full px-4 py-2 border-2 border-[#3A5377] rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-[#3A5377]"
                            />
                        </div>
                    </div>

                    {/* Stats and Export */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#3A5377]">
                        <p className="text-[#0B2844] font-semibold font-montserrat">
                            {t.totalExams}:{" "}
                            <span className="text-[#3A5377] text-lg">
                                {filteredExams.length}
                            </span>
                        </p>
                        <button
                            onClick={exportToPDF}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-montserrat font-semibold hover:bg-green-700 transition-all shadow-md flex items-center space-x-2 hover-scale"
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
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span>{t.export}</span>
                        </button>
                    </div>
                </div>

                {/* Exams Table */}
                <div className="bg-[#EEF2F8] shadow-lg rounded-lg p-6 border-2 border-[#3A5377]">
                    {filteredExams.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <p className="text-xl font-montserrat">
                                {t.noExam}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table
                                className={`min-w-full border border-[#3A5377] rounded-lg text-[#0B2844] font-montserrat exam-table ${
                                    language === "ar" ? "text-right" : ""
                                }`}
                            >
                                <thead>
                                    <tr className="text-center bg-[#F8FAFC]">
                                        <th className="border border-[#3A5377] px-4 py-3">
                                            {t.type}
                                        </th>
                                        <th className="border border-[#3A5377] px-4 py-3">
                                            {t.module}
                                        </th>
                                        <th className="border border-[#3A5377] px-4 py-3">
                                            {t.semester}
                                        </th>
                                        <th className="border border-[#3A5377] px-4 py-3">
                                            {t.levelGroup}
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
                                        <th className="border border-[#3A5377] px-4 py-3">
                                            {t.report}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExams.map((exam, index) => (
                                        <tr
                                            key={exam.id || index}
                                            className="text-center hover-row"
                                        >
                                            <td className="border border-[#3A5377] px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        exam.type === "cc"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : exam.type ===
                                                              "examen"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-orange-100 text-orange-800"
                                                    }`}
                                                >
                                                    {getExamTypeLabel(
                                                        exam.type
                                                    )}
                                                </span>
                                            </td>
                                            <td className="border border-[#3A5377] px-4 py-3 font-semibold">
                                                {exam.module}
                                            </td>
                                            <td className="border border-[#3A5377] px-4 py-3">
                                                {exam.semester || "-"}
                                            </td>
                                            <td className="border border-[#3A5377] px-4 py-3">
                                                {exam.niveau}/{exam.group}
                                            </td>
                                            <td className="border border-[#3A5377] px-4 py-3">
                                                {exam.room}
                                            </td>
                                            <td className="border border-[#3A5377] px-4 py-3">
                                                {new Date(
                                                    exam.date
                                                ).toLocaleDateString(
                                                    language === "ar"
                                                        ? "ar-DZ"
                                                        : "fr-FR"
                                                )}
                                            </td>
                                            <td className="border border-[#3A5377] px-4 py-3">
                                                {exam.start_time} -{" "}
                                                {exam.end_time}
                                            </td>
                                            <td className="border border-[#3A5377] px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        handleOpenClaimModal(
                                                            exam
                                                        )
                                                    }
                                                    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-all text-sm"
                                                >
                                                    {t.report}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    /* ================= LOADING & ERROR STATES ================= */
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

    /* ================= MAIN RENDER ================= */
    return (
        <div
            className={`flex flex-col min-h-screen bg-[#E6EEF7] ${
                language === "ar" ? "rtl" : "ltr"
            }`}
        >
            <div className="flex-grow relative">
                {/* Header */}
                <img
                    src={uniLogo}
                    alt="UABT Logo"
                    className="absolute top-4 left-4 w-14 h-14 object-contain logo-hover"
                />

                <h1 className="text-2xl font-semibold text-center pt-6 mb-6 text-[#0B2844] font-montserrat fade-in">
                    {t.department}
                </h1>

                {/* Notification Bell - Add this before logout icon */}
                {teacherData && (
                    <div
                        className="absolute top-4 right-20"
                        style={{ zIndex: 1000 }}
                    >
                        <NotificationBell
                            teacherMatricule={
                                teacherData.matricule ||
                                JSON.parse(localStorage.getItem("user"))
                                    ?.matricule
                            }
                        />
                    </div>
                )}

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
                        {t.teacherSpace}
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mt-8 space-x-4 fade-in">
                    <button
                        onClick={() => setCurrentView("schedule")}
                        className={`px-8 py-3 rounded-lg font-montserrat font-semibold transition-all hover-scale ${
                            currentView === "schedule"
                                ? "bg-[#3A5377] text-white shadow-lg"
                                : "bg-[#EEF2F8] text-[#0B2844] border-2 border-[#3A5377] hover:bg-[#3A5377] hover:text-white"
                        }`}
                    >
                        {t.examSchedule}
                    </button>
                    <button
                        onClick={() => setCurrentView("profile")}
                        className={`px-8 py-3 rounded-lg font-montserrat font-semibold transition-all hover-scale ${
                            currentView === "profile"
                                ? "bg-[#3A5377] text-white shadow-lg"
                                : "bg-[#EEF2F8] text-[#0B2844] border-2 border-[#3A5377] hover:bg-[#3A5377] hover:text-white"
                        }`}
                    >
                        {t.myProfile}
                    </button>
                </div>

                {/* Content */}
                {currentView === "profile" ? <ProfileView /> : <ScheduleView />}
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-[#768FA6] mt-auto fade-in">
                <div className="px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm text-[#768FA6] font-montserrat">
                            {t.copyright}
                        </p>
                    </div>
                </div>
            </footer>

            {/* Claim Modal */}
            <Modal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                title={t.reportExam}
            >
                <div className="p-4">
                    {selectedExamForClaim && (
                        <div className="mb-4 p-3 bg-gray-50 rounded border">
                            <p className="font-semibold">
                                {selectedExamForClaim.module}
                            </p>
                            <p className="text-sm text-gray-600">
                                {getExamTypeLabel(selectedExamForClaim.type)} |{" "}
                                {selectedExamForClaim.semester} |{" "}
                                {selectedExamForClaim.niveau}/
                                {selectedExamForClaim.group} | Salle:{" "}
                                {selectedExamForClaim.room} | Date:{" "}
                                {new Date(
                                    selectedExamForClaim.date
                                ).toLocaleDateString()}{" "}
                                | Horaire: {selectedExamForClaim.start_time} -{" "}
                                {selectedExamForClaim.end_time}
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block font-semibold mb-2">
                            {t.reason}
                        </label>
                        <textarea
                            rows={6}
                            value={claimMessage}
                            onChange={(e) => setClaimMessage(e.target.value)}
                            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t.reasonPlaceholder}
                        />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 transition-colors"
                            onClick={() => setShowClaimModal(false)}
                            disabled={claimSubmitting}
                        >
                            {t.cancel}
                        </button>
                        <button
                            className="px-6 py-2 bg-[#3A5377] text-white rounded-lg hover:bg-[#0B2844] disabled:bg-gray-400 transition-colors"
                            onClick={handleSubmitClaim}
                            disabled={claimSubmitting || !claimMessage.trim()}
                        >
                            {claimSubmitting ? t.sending : t.send}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
