import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "./UI/Modal";
import logoutIcon from "./logout.png";
import uniLogo from "./logouni.png";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import teacherIcon from "./teacher.png";
import '../styles/dashboard.css';

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

    // Translations object
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
            semesters: "Semestres :",
            teacherName: "Nom Enseignant :",
            module: "Module",
            levelGroup: "Niveau/Groupe",
            room: "Salle",
            date: "Date",
            schedule: "Horaire",
            close: "Fermer",
            report: "Signaler",
            export: "Exporter PDF",
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
            copyright: "Copyright © 2026 Université Abou Bekr Belkaïd Tlemcen. Tous droits réservés.",
            reportExam: "Signaler un examen",
            selectExam: "Sélectionnez l'examen :",
            reason: "Raison :",
            reasonPlaceholder: "Expliquez la raison de votre signalement",
            cancel: "Annuler",
            send: "Envoyer",
            sending: "Envoi...",
            noExamAvailable: "Aucun examen disponible",
            university: "Université Abou Bekr Belkaïd - Tlemcen"
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
            semesters: "السداسيات:",
            teacherName: "اسم الأستاذ:",
            module: "المقياس",
            levelGroup: "المستوى/المجموعة",
            room: "القاعة",
            date: "التاريخ",
            schedule: "التوقيت",
            close: "إغلاق",
            report: "إبلاغ",
            export: "تصدير PDF",
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
            copyright: "حقوق النشر © 2026 جامعة أبو بكر بلقايد تلمسان. جميع الحقوق محفوظة.",
            reportExam: "إبلاغ عن امتحان",
            selectExam: "اختر الامتحان:",
            reason: "السبب:",
            reasonPlaceholder: "اشرح سبب الإبلاغ",
            cancel: "إلغاء",
            send: "إرسال",
            sending: "جاري الإرسال...",
            noExamAvailable: "لا توجد امتحانات متاحة",
            university: "جامعة أبو بكر بلقايد - تلمسان"
        }
    };

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
            }
        };
        window.addEventListener('storage', storageHandler);

        return () => {
            window.removeEventListener('storage', storageHandler);
        };
    }, [navigate]);

    const fetchTeacherData = async (matricule) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/teacher/exams?matricule=${matricule}`);
            const data = response.data;
            
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

    const ExamTable = ({ title, examList, onReport }) => {
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

    const ProfileView = () => {
        return (
            <div className="flex items-center justify-center mt-12 fade-in">
                <div className={`bg-[#EEF2F8] shadow-lg rounded-lg p-8 border-2 border-[#3A5377] ${language === 'ar' ? 'text-right' : ''}`} style={{ width: "800px" }}>
                    <h2 className="text-center text-[#0B2844] font-semibold font-montserrat mb-8 text-2xl">
                        {t.teacherProfile}
                    </h2>
                    
                    {/* Profile Photo Section */}
<div className="flex justify-center mb-8">
    <div className="relative profile-photo">
        <div className="w-32 h-32 overflow-hidden flex items-center justify-center">
            <img 
                src={teacherData?.photo || teacherIcon} 
                alt="Photo de profil" 
                className="w-full h-full object-contain"
            />
        </div>
    </div>
</div>
                    
                    <div className="space-y-6">
                        <div className="border-b border-[#3A5377] pb-4">
                            <p className="text-[#768FA6] text-sm font-montserrat mb-1">{t.fullName}</p>
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

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleSubmitClaim = async () => {
        if (!selectedExamForClaim) {
            alert("Veuillez sélectionner un examen à signaler.");
            return;
        }
        if (!claimReason.trim()) {
            alert("Veuillez fournir une raison pour le signalement.");
            return;
        }

        try {
            setClaimSubmitting(true);
            const typeMap = (t) => (t === "examen" ? "exam" : t);

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
            const doc = new jsPDF('l', 'mm', 'a4'); // landscape, millimeters, A4
            
            // Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(t.university, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
            
            doc.setFontSize(14);
            doc.text(t.department, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

            // Title
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

            // Teacher info
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${t.teacherName} ${teacherData?.name}`, 14, 45);
            doc.text(`${t.teacherId} ${teacherData?.matricule}`, 14, 51);

            // Table data
            const tableData = examList.map(exam => [
                exam.module,
                `${exam.niveau} / ${exam.group}`,
                exam.room,
                new Date(exam.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR'),
                `${exam.start_time} - ${exam.end_time}`
            ]);

            // Generate table
            autoTable(doc, {
                startY: 60,
                head: [[t.module, t.levelGroup, t.room, t.date, t.schedule]],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [58, 83, 119], // #3A5377
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    textColor: [11, 40, 68], // #0B2844
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [238, 242, 248] // #EEF2F8
                },
                margin: { left: 14, right: 14 },
                styles: {
                    fontSize: 9,
                    cellPadding: 5,
                    lineColor: [58, 83, 119],
                    lineWidth: 0.5
                }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(118, 143, 166); // #768FA6
                doc.text(
                    t.copyright,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Save the PDF
            const fileName = `${title.replace(/\s+/g, '_')}_${teacherData?.name?.replace(/\s+/g, '_')}.pdf`;
            doc.save(fileName);
            
            console.log('PDF generated successfully:', fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(language === 'fr' 
                ? "Erreur lors de la génération du PDF. Vérifiez la console." 
                : "خطأ في إنشاء ملف PDF"
            );
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                                                className={`text-[#0B2844] font-montserrat hover:underline ${
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
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS1("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                    >
                                        {t.close}
                                    </button>
                                    <button
                                        onClick={() => handleExportPDF(t.ccS1, filterBySemester(cc, "1"))}
                                        className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(cc, "1");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale"
                                    >
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS1 === "EXAM" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.examS1} examList={filterBySemester(exams, "1")} />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS1("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                    >
                                        {t.close}
                                    </button>
                                    <button
                                        onClick={() => handleExportPDF(t.examS1, filterBySemester(exams, "1"))}
                                        className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(exams, "1");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale"
                                    >
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS1 === "RATT" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.rattS1} examList={filterBySemester(rattrapage, "1")} />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS1("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                    >
                                        {t.close}
                                    </button>
                                    <button
                                        onClick={() => handleExportPDF(t.rattS1, filterBySemester(rattrapage, "1"))}
                                        className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(rattrapage, "1");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale"
                                    >
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "CC" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.ccS2} examList={filterBySemester(cc, "2")} />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS2("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                    >
                                        {t.close}
                                    </button>
                                    <button
                                        onClick={() => handleExportPDF(t.ccS2, filterBySemester(cc, "2"))}
                                        className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(cc, "2");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale"
                                    >
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "EXAM" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.examS2} examList={filterBySemester(exams, "2")} />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS2("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                    >
                                        {t.close}
                                    </button>
                                    <button
                                        onClick={() => handleExportPDF(t.examS2, filterBySemester(exams, "2"))}
                                        className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(exams, "2");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale"
                                    >
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "RATT" && (
                            <div className="flex flex-col items-center justify-center mt-12 slide-in">
                                <ExamTable title={t.rattS2} examList={filterBySemester(rattrapage, "2")} />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS2("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100 hover-scale"
                                    >
                                        {t.close}
                                    </button>
                                    <button
                                        onClick={() => handleExportPDF(t.rattS2, filterBySemester(rattrapage, "2"))}
                                        className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center space-x-2 hover-scale"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{t.export}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(rattrapage, "2");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500 hover-scale"
                                    >
                                        {t.report}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Claim Modal */}
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
            </Modal>

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