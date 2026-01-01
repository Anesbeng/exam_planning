import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "./UI/Modal";
import NotificationBell from "./NotificationBell";
import TeacherConvocationView from "./TeacherConvocationView";
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

    const [selectedNotification, setSelectedNotification] = useState(null);

    // Calendar view states
    const [calendarView, setCalendarView] = useState("month"); // 'month' or 'list'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Filter states
    const [selectedExamType, setSelectedExamType] = useState("ALL");
    const [selectedSemester, setSelectedSemester] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    /* ================= CLAIM STATES ================= */
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedExamForClaim, setSelectedExamForClaim] = useState(null);
    const [claimMessage, setClaimMessage] = useState("");
    const [claimSubmitting, setClaimSubmitting] = useState(false);
    const [responsableExams, setResponsableExams] = useState([]);

    /* ================= TRANSLATIONS ================= */
    const translations = {
        fr: {
            department: "Departement Informatique",
            teacherSpace: "Espace Enseignants",
            examSchedule: "Planning des Examens",
            myProfile: "Mon Profil",
            responsableExams: "Modules Responsables",
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
            responsableTitle: "Examens des modules dont je suis RESPONSABLE",
            surveillant: "Surveillant",
            notAssigned: "Non assigné",
            viewDetails: "Voir",
            examDetails: "Détails de l'examen",
            convocation: "Convocation",
            convocationView: "Voir la Convocation",
            studentsList: "Liste des Étudiants",
            downloadConvocation: "Télécharger la Convocation",
            closeConvocation: "Fermer la Convocation",
        },
        ar: {
            department: "قسم الإعلام الآلي",
            teacherSpace: "فضاء الأساتذة",
            examSchedule: "جدول الامتحانات",
            myProfile: "ملفي الشخصي",
            responsableExams: "المواد المسؤولة",
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
            responsableTitle: "امتحانات المواد التي أشرف عليها",
            surveillant: "المراقب",
            notAssigned: "غير معين",
            viewDetails: "عرض",
            examDetails: "تفاصيل الامتحان",
            convocation: "استدعاء",
            convocationView: "عرض الاستدعاء",
            studentsList: "قائمة الطلاب",
            downloadConvocation: "تحميل الاستدعاء",
            closeConvocation: "إغلاق الاستدعاء",
        },
    };

    const t = translations[language];

    /* ================= FETCH TEACHER'S EXAMS ================= */
    const fetchTeacherData = async () => {
        try {
            setLoading(true);
            setError(null);

            const examResponse = await api.get(`/teacher/exams`);
            const examData = examResponse.data;

            console.log("📊 Full API Response:", examData);
            console.log("🔍 Debug Info:", examData.debug);
            console.log(
                "📚 Raw Responsable Modules:",
                examData.responsable_modules
            );
            console.log("👤 Teacher Info:", examData.teacher);

            // Set teacher data
            setTeacherData(examData.teacher);

            // Process responsable exams with comprehensive validation
            const rawResponsableExams = examData.responsable_modules || [];
            console.log(
                "🔢 Raw Responsable Exams Count:",
                rawResponsableExams.length
            );

            const responsableExams = rawResponsableExams.map((exam, index) => {
                console.log(
                    `📝 Processing Responsable Exam ${index + 1}:`,
                    exam
                );

                return {
                    ...exam,
                    type: exam.type || "examen", // Default to "examen" if type is missing
                    semester: exam.semester || "-",
                    teacher: exam.teacher || null,
                };
            });

            console.log("✅ Processed Responsable Exams:", responsableExams);
            console.log(
                "📊 Final Responsable Exams Count:",
                responsableExams.length
            );

            // Set responsable exams
            setResponsableExams(responsableExams);

            // Process surveillance exams (where teacher is surveillant)
            const surveillanceExams = [
                ...(examData.exams || []).map((exam) => ({
                    ...exam,
                    type: "examen",
                })),
                ...(examData.cc || []).map((exam) => ({
                    ...exam,
                    type: "cc",
                })),
                ...(examData.rattrapage || []).map((exam) => ({
                    ...exam,
                    type: "rattrapage",
                })),
            ];

            console.log(
                "👁️ Surveillance Exams Count:",
                surveillanceExams.length
            );

            // Sort surveillance exams by date and time
            surveillanceExams.sort((a, b) => {
                const dateCompare = new Date(a.date) - new Date(b.date);
                if (dateCompare !== 0) return dateCompare;
                return a.start_time.localeCompare(b.start_time);
            });

            setAllExams(surveillanceExams);

            console.log("✅ Data fetch completed successfully");
            console.log("📊 Summary:", {
                responsableExams: responsableExams.length,
                surveillanceExams: surveillanceExams.length,
                totalExams: responsableExams.length + surveillanceExams.length,
            });
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Erreur lors du chargement des données";

            setError(errorMessage);
            console.error("❌ Error fetching teacher data:", err);
            console.error("❌ Error response:", err.response?.data);
            console.error("❌ Error status:", err.response?.status);
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
        fetchTeacherData();
    }, [navigate]);

    /* ================= CALENDAR HELPER FUNCTIONS ================= */
    /* ================= CALENDAR HELPER FUNCTIONS ================= */
    const getCalendarData = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // IMPORTANT: getDay() returns 0 for Sunday, 1 for Monday, etc.
        // We want Sunday to be the first day of the week (index 0)
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Get previous month's last days
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        // Build calendar array
        const calendar = [];

        // Previous month days
        // We need to show the days from the previous month that appear in the first week
        // If the month starts on Sunday (0), we don't need previous month days
        for (let i = startingDayOfWeek; i > 0; i--) {
            calendar.push({
                day: prevMonthLastDay - i + 1,
                date: new Date(year, month - 1, prevMonthLastDay - i + 1),
                isCurrentMonth: false,
                exams: [],
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split("T")[0];

            // Find exams for this day
            const dayExams = responsableExams.filter((exam) => {
                if (!exam.date) return false;
                const examDate = new Date(exam.date);
                return (
                    examDate.getDate() === day &&
                    examDate.getMonth() === month &&
                    examDate.getFullYear() === year
                );
            });

            calendar.push({
                day,
                date,
                isCurrentMonth: true,
                exams: dayExams,
            });
        }

        // Next month days
        // We need to fill the remaining cells to complete the 6-week grid (42 cells)
        const totalCells = 42; // 6 weeks * 7 days
        const nextMonthDays = totalCells - calendar.length;

        for (let day = 1; day <= nextMonthDays; day++) {
            calendar.push({
                day,
                date: new Date(year, month + 1, day),
                isCurrentMonth: false,
                exams: [],
            });
        }

        return calendar;
    };

    // Calendar navigation functions
    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(null);
    };

    /* ================= FILTER LOGIC ================= */
    const getUniqueSemesters = () => {
        const semesters = [
            ...new Set(allExams.map((exam) => exam.semester).filter(Boolean)),
        ];
        return semesters.sort();
    };

    const getFilteredExams = () => {
        let filtered = allExams;

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

        if (selectedSemester !== "ALL") {
            filtered = filtered.filter(
                (exam) => exam.semester === selectedSemester
            );
        }

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
        doc.setFontSize(16);
        doc.text(`${t.examSchedule}`, 20, 20);
        doc.setFontSize(12);
        doc.text(`${t.fullName}: ${teacherData?.name || ""}`, 20, 30);

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

    const exportResponsableToPDF = () => {
        if (!responsableExams.length) {
            alert(t.noExam);
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Examens des modules responsables", 20, 20);
        doc.setFontSize(12);
        doc.text(`Enseignant: ${teacherData?.name || ""}`, 20, 30);

        autoTable(doc, {
            head: [
                [
                    "Type",
                    "Module",
                    "Semestre",
                    "Niveau/Groupe",
                    "Salle",
                    "Date",
                    "Horaire",
                    "Surveillant",
                ],
            ],
            body: responsableExams.map((exam) => [
                getExamTypeLabel(exam.type),
                exam.module,
                exam.semester || "-",
                `${exam.niveau}/${exam.group}`,
                exam.room,
                new Date(exam.date).toLocaleDateString(),
                `${exam.start_time} - ${exam.end_time}`,
                exam.teacher || "Non assigné",
            ]),
            startY: 40,
        });

        doc.save(
            `examens_responsables_${teacherData?.name || "enseignant"}.pdf`
        );
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
                <div className="bg-[#EEF2F8] shadow-lg rounded-lg p-6 border-2 border-[#3A5377] mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                <td className="border border-[#3A5377] px-4 py-3">
                                                    <div className="flex justify-center space-x-2">
                                                        {/* Bouton Convocation - seulement pour les examens dont l'enseignant est responsable */}
                                                        {(exam.teacher_matricule ===
                                                            teacherData?.matricule ||
                                                            exam.responsable_id ===
                                                                teacherData?.id) && (
                                                            <button
                                                                onClick={() =>
                                                                    setSelectedNotification(
                                                                        {
                                                                            exam_id:
                                                                                exam.id,
                                                                            exam,
                                                                            type: "convocation",
                                                                        }
                                                                    )
                                                                }
                                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all text-sm flex items-center"
                                                                title="Voir la convocation"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4 mr-1"
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
                                                                {t.convocation}
                                                            </button>
                                                        )}

                                                        {/* Bouton Signaler */}
                                                        <button
                                                            onClick={() =>
                                                                handleOpenClaimModal(
                                                                    exam
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-all text-sm flex items-center"
                                                            title="Signaler un problème"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 mr-1"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.67 16.5c-.77.833.192 2.5 1.732 2.5z"
                                                                />
                                                            </svg>
                                                            {t.report}
                                                        </button>
                                                    </div>
                                                </td>
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

    /* ================= RESPONSABLE VIEW ================= */
    const ResponsableView = () => {
        console.log(
            "🔍 ResponsableView - Responsable Exams:",
            responsableExams
        );

        const calendarData = getCalendarData();
        const monthNames =
            language === "fr"
                ? [
                      "Janvier",
                      "Février",
                      "Mars",
                      "Avril",
                      "Mai",
                      "Juin",
                      "Juillet",
                      "Août",
                      "Septembre",
                      "Octobre",
                      "Novembre",
                      "Décembre",
                  ]
                : [
                      "يناير",
                      "فبراير",
                      "مارس",
                      "أبريل",
                      "مايو",
                      "يونيو",
                      "يوليو",
                      "أغسطس",
                      "سبتمبر",
                      "أكتوبر",
                      "نوفمبر",
                      "ديسمبر",
                  ];

        // CORRECTED: Ensure Sunday is first day for French/Arabic
        const dayNames =
            language === "fr"
                ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
                : [
                      "الأحد",
                      "الاثنين",
                      "الثلاثاء",
                      "الأربعاء",
                      "الخميس",
                      "الجمعة",
                      "السبت",
                  ];

        // Helper to get the actual date for debugging
        const getDebugInfo = () => {
            const today = new Date();
            return {
                today: today.toDateString(),
                currentMonth: currentMonth.toDateString(),
                firstDayOfMonth: new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    1
                ).toDateString(),
                firstDayOfMonthWeekday: new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    1
                ).getDay(),
                calendarDataLength: calendarData.length,
                firstFewDays: calendarData.slice(0, 7).map((d) => ({
                    day: d.day,
                    date: d.date.toDateString(),
                    isCurrentMonth: d.isCurrentMonth,
                })),
            };
        };

        console.log("📅 Calendar Debug Info:", getDebugInfo());

        return (
            <div className="mt-12 px-8 fade-in">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl rounded-xl p-6 border-4 border-blue-500">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-blue-500 p-3 rounded-lg mr-4">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-800 font-montserrat">
                                📋 {t.responsableTitle}
                            </h2>
                        </div>

                        {/* View Toggle */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCalendarView("month")}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    calendarView === "month"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-blue-600 border-2 border-blue-600"
                                }`}
                            >
                                📅 {language === "fr" ? "Calendrier" : "تقويم"}
                            </button>
                            <button
                                onClick={() => setCalendarView("list")}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    calendarView === "list"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-blue-600 border-2 border-blue-600"
                                }`}
                            >
                                📋 {language === "fr" ? "Liste" : "قائمة"}
                            </button>
                        </div>
                    </div>

                    {responsableExams.length > 0 ? (
                        <>
                            {/* Summary Stats */}
                            <div className="mb-6 bg-white p-4 rounded-lg border border-blue-300">
                                <p className="text-lg font-semibold text-blue-700 mb-2">
                                    {language === "fr" ? "Résumé:" : "ملخص:"}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold">
                                        📊 Total: {responsableExams.length}
                                    </div>
                                    <div className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold">
                                        🎓 Examens:{" "}
                                        {
                                            responsableExams.filter(
                                                (e) => e.type === "examen"
                                            ).length
                                        }
                                    </div>
                                    <div className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">
                                        📝 CC:{" "}
                                        {
                                            responsableExams.filter(
                                                (e) => e.type === "cc"
                                            ).length
                                        }
                                    </div>
                                    <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold">
                                        🔄 Rattrapages:{" "}
                                        {
                                            responsableExams.filter(
                                                (e) => e.type === "rattrapage"
                                            ).length
                                        }
                                    </div>
                                </div>

                                {/* Debug info (can be removed in production) */}
                                <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                                    <p className="font-mono">
                                        Debug:{" "}
                                        {currentMonth.toLocaleDateString(
                                            "fr-FR",
                                            { month: "long", year: "numeric" }
                                        )}
                                    </p>
                                    <p className="font-mono">
                                        Premier jour:{" "}
                                        {new Date(
                                            currentMonth.getFullYear(),
                                            currentMonth.getMonth(),
                                            1
                                        ).toLocaleDateString("fr-FR", {
                                            weekday: "long",
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Calendar View */}
                            {calendarView === "month" ? (
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    {/* Calendar Navigation */}
                                    <div className="flex items-center justify-between mb-6">
                                        <button
                                            onClick={goToPreviousMonth}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
                                        >
                                            ←{" "}
                                            {language === "fr"
                                                ? "Précédent"
                                                : "السابق"}
                                        </button>

                                        <div className="text-center">
                                            <h3 className="text-2xl font-bold text-blue-800">
                                                {
                                                    monthNames[
                                                        currentMonth.getMonth()
                                                    ]
                                                }{" "}
                                                {currentMonth.getFullYear()}
                                            </h3>
                                            <button
                                                onClick={goToToday}
                                                className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all"
                                            >
                                                {language === "fr"
                                                    ? "Aujourd'hui"
                                                    : "اليوم"}
                                            </button>
                                        </div>

                                        <button
                                            onClick={goToNextMonth}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
                                        >
                                            {language === "fr"
                                                ? "Suivant"
                                                : "التالي"}{" "}
                                            →
                                        </button>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-2">
                                        {/* Day Headers - CORRECTED ORDER */}
                                        {dayNames.map((day, index) => (
                                            <div
                                                key={index}
                                                className="text-center font-bold text-blue-700 py-2 bg-blue-100 rounded"
                                            >
                                                {day}
                                            </div>
                                        ))}

                                        {/* Calendar Days */}
                                        {calendarData.map((dayData, index) => {
                                            const isToday =
                                                dayData.date.toDateString() ===
                                                new Date().toDateString();
                                            const hasExams =
                                                dayData.exams.length > 0;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`min-h-[100px] border-2 rounded-lg p-2 transition-all cursor-pointer ${
                                                        !dayData.isCurrentMonth
                                                            ? "bg-gray-100 text-gray-400"
                                                            : isToday
                                                            ? "bg-yellow-100 border-yellow-500"
                                                            : hasExams
                                                            ? "bg-blue-50 border-blue-300 hover:bg-blue-100"
                                                            : "bg-white border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                    onClick={() =>
                                                        hasExams &&
                                                        setSelectedDate(
                                                            dayData.date
                                                        )
                                                    }
                                                >
                                                    <div
                                                        className={`text-sm font-semibold mb-1 ${
                                                            isToday
                                                                ? "text-yellow-800"
                                                                : ""
                                                        }`}
                                                    >
                                                        {dayData.day}
                                                        {isToday && (
                                                            <span className="ml-1 text-xs">
                                                                (Aujourd'hui)
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Exam indicators */}
                                                    {hasExams && (
                                                        <div className="space-y-1">
                                                            {dayData.exams
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        exam,
                                                                        examIndex
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                examIndex
                                                                            }
                                                                            className={`text-xs p-1 rounded truncate ${
                                                                                exam.type ===
                                                                                "cc"
                                                                                    ? "bg-green-500 text-white"
                                                                                    : exam.type ===
                                                                                      "examen"
                                                                                    ? "bg-purple-500 text-white"
                                                                                    : "bg-orange-500 text-white"
                                                                            }`}
                                                                            title={`${exam.module} - ${exam.start_time}`}
                                                                        >
                                                                            {
                                                                                exam.start_time
                                                                            }{" "}
                                                                            {exam.module.substring(
                                                                                0,
                                                                                10
                                                                            )}
                                                                            ...
                                                                        </div>
                                                                    )
                                                                )}
                                                            {dayData.exams
                                                                .length > 3 && (
                                                                <div className="text-xs text-blue-600 font-semibold">
                                                                    +
                                                                    {dayData
                                                                        .exams
                                                                        .length -
                                                                        3}{" "}
                                                                    {language ===
                                                                    "fr"
                                                                        ? "autre(s)"
                                                                        : "آخر"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Selected Date Details */}
                                    {selectedDate && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-lg font-bold text-blue-800">
                                                    📅{" "}
                                                    {selectedDate.toLocaleDateString(
                                                        language === "ar"
                                                            ? "ar-DZ"
                                                            : "fr-FR",
                                                        {
                                                            weekday: "long",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </h4>
                                                <button
                                                    onClick={() =>
                                                        setSelectedDate(null)
                                                    }
                                                    className="text-red-600 hover:text-red-800 font-bold"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            {calendarData
                                                .find(
                                                    (d) =>
                                                        d.date.toDateString() ===
                                                        selectedDate.toDateString()
                                                )
                                                ?.exams.map((exam, index) => (
                                                    <div
                                                        key={index}
                                                        className="mb-3 p-3 bg-white rounded border-l-4 border-blue-500"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-bold text-blue-800">
                                                                    {
                                                                        exam.module
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    ⏰{" "}
                                                                    {
                                                                        exam.start_time
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        exam.end_time
                                                                    }{" "}
                                                                    | 🏢{" "}
                                                                    {exam.room}{" "}
                                                                    | 👥{" "}
                                                                    {
                                                                        exam.niveau
                                                                    }
                                                                    /
                                                                    {exam.group}
                                                                </p>
                                                                <p className="text-sm">
                                                                    <span
                                                                        className={`px-2 py-1 rounded text-white ${
                                                                            exam.type ===
                                                                            "cc"
                                                                                ? "bg-green-500"
                                                                                : exam.type ===
                                                                                  "examen"
                                                                                ? "bg-purple-500"
                                                                                : "bg-orange-500"
                                                                        }`}
                                                                    >
                                                                        {getExamTypeLabel(
                                                                            exam.type
                                                                        )}
                                                                    </span>
                                                                </p>
                                                                {exam.teacher && (
                                                                    <p className="text-sm mt-1">
                                                                        👤
                                                                        Surveillant:{" "}
                                                                        <span className="font-semibold">
                                                                            {
                                                                                exam.teacher
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenClaimModal(
                                                                        exam
                                                                    )
                                                                }
                                                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                                            >
                                                                🚨 {t.report}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {/* Legend */}
                                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-blue-50 border border-blue-300 mr-2"></div>
                                            <span className="text-sm">
                                                Avec examens
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-500 mr-2"></div>
                                            <span className="text-sm">
                                                Aujourd'hui
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 mr-2"></div>
                                            <span className="text-sm">CC</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-purple-500 mr-2"></div>
                                            <span className="text-sm">
                                                Examens
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-orange-500 mr-2"></div>
                                            <span className="text-sm">
                                                Rattrapages
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* List View (Original Table) */
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border-2 border-blue-300 rounded-lg shadow-lg">
                                        <thead className="bg-blue-600 text-white">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    Type
                                                </th>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    Module
                                                </th>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    Semestre
                                                </th>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    Niveau/Groupe
                                                </th>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    Salle
                                                </th>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    Date
                                                </th>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    Horaire
                                                </th>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    {t.surveillant}
                                                </th>
                                                <th className="px-6 py-4 text-left font-bold">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {responsableExams.map(
                                                (exam, index) => (
                                                    <tr
                                                        key={exam.id || index}
                                                        className={`${
                                                            index % 2 === 0
                                                                ? "bg-blue-50"
                                                                : "bg-white"
                                                        } hover:bg-blue-100 transition-colors`}
                                                    >
                                                        <td className="px-6 py-3 border-b border-blue-200">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                                    exam.type ===
                                                                    "cc"
                                                                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                                                                        : exam.type ===
                                                                          "examen"
                                                                        ? "bg-purple-100 text-purple-800 border border-purple-300"
                                                                        : "bg-orange-100 text-orange-800 border border-orange-300"
                                                                }`}
                                                            >
                                                                {getExamTypeLabel(
                                                                    exam.type
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 border-b border-blue-200 font-bold text-blue-800">
                                                            {exam.module}
                                                        </td>
                                                        <td className="px-6 py-3 border-b border-blue-200">
                                                            {exam.semester ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-6 py-3 border-b border-blue-200">
                                                            {exam.niveau}/
                                                            {exam.group}
                                                        </td>
                                                        <td className="px-6 py-3 border-b border-blue-200 font-semibold">
                                                            {exam.room}
                                                        </td>
                                                        <td className="px-6 py-3 border-b border-blue-200">
                                                            {new Date(
                                                                exam.date
                                                            ).toLocaleDateString(
                                                                language ===
                                                                    "ar"
                                                                    ? "ar-DZ"
                                                                    : "fr-FR",
                                                                {
                                                                    weekday:
                                                                        "short",
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 border-b border-blue-200">
                                                            ⏰ {exam.start_time}{" "}
                                                            - {exam.end_time}
                                                        </td>
                                                        <td className="px-6 py-3 border-b border-blue-200">
                                                            {exam.teacher ? (
                                                                <span className="text-green-600 font-semibold">
                                                                    👤{" "}
                                                                    {
                                                                        exam.teacher
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-red-500 font-semibold">
                                                                    ❌{" "}
                                                                    {
                                                                        t.notAssigned
                                                                    }
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 border-b border-blue-200">
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenClaimModal(
                                                                        exam
                                                                    )
                                                                }
                                                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all font-semibold shadow-md"
                                                            >
                                                                🚨 {t.report}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={exportResponsableToPDF}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-montserrat font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2"
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
                                    <span>
                                        📥 Exporter les examens responsables
                                    </span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <svg
                                className="w-20 h-20 mx-auto mb-4 text-blue-400"
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
                            <p className="text-xl font-montserrat text-gray-600">
                                {language === "fr"
                                    ? "Aucun examen trouvé pour les modules dont vous êtes responsable"
                                    : "لا توجد امتحانات للمواد التي تشرف عليها"}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                {language === "fr"
                                    ? "Vérifiez que vous êtes bien désigné comme responsable de module dans le système"
                                    : "تحقق من أنك مسجل كمسؤول عن المواد في النظام"}
                            </p>
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
                <img
                    src={uniLogo}
                    alt="UABT Logo"
                    className="absolute top-4 left-4 w-14 h-14 object-contain logo-hover"
                />

                <h1 className="text-2xl font-semibold text-center pt-6 mb-6 text-[#0B2844] font-montserrat fade-in">
                    {t.department}
                </h1>

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
                            onNotificationClick={setSelectedNotification} // Add this prop
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

                {/* Navigation Tabs - 3 BUTTONS */}
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
                        onClick={() => setCurrentView("responsable")}
                        className={`px-8 py-3 rounded-lg font-montserrat font-semibold transition-all hover-scale ${
                            currentView === "responsable"
                                ? "bg-[#3A5377] text-white shadow-lg"
                                : "bg-[#EEF2F8] text-[#0B2844] border-2 border-[#3A5377] hover:bg-[#3A5377] hover:text-white"
                        }`}
                    >
                        {t.responsableExams}
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

                {/* Content - 3 VIEWS */}
                {currentView === "profile" ? (
                    <ProfileView />
                ) : currentView === "responsable" ? (
                    <ResponsableView />
                ) : (
                    <ScheduleView />
                )}
            </div>
            {selectedNotification && (
                <TeacherConvocationView
                    notification={selectedNotification}
                    onClose={() => setSelectedNotification(null)}
                    language={language} // Pass language if needed
                />
            )}

            <footer className="bg-white border-t border-[#768FA6] mt-auto fade-in">
                <div className="px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm text-[#768FA6] font-montserrat">
                            {t.copyright}
                        </p>
                    </div>
                </div>
            </footer>

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
