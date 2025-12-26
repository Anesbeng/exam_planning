import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "./UI/Modal";
import logoutIcon from "./logout.png";
import uniLogo from "./logouniversite.jpg";

export default function EspaceEnseignants() {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState(""); // "exams" or "surveillance"
    const [activeTabS1, setActiveTabS1] = useState("");
    const [activeTabS2, setActiveTabS2] = useState("");
    const [teacherData, setTeacherData] = useState(null);
    const [exams, setExams] = useState([]);
    const [cc, setCc] = useState([]);
    const [rattrapage, setRattrapage] = useState([]);
    const [surveillance, setSurveillance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Claim modal states
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimCandidates, setClaimCandidates] = useState([]);
    const [selectedExamForClaim, setSelectedExamForClaim] = useState(null);
    const [claimReason, setClaimReason] = useState("");
    const [claimSubmitting, setClaimSubmitting] = useState(false);



    useEffect(() => {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "teacher") {
            navigate("/Login");
            return;
        }
        setTeacherData(user);
        fetchTeacherData(user.matricule);

        // Listen for cross-tab exam updates (set by Admin when exams change)
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
            console.log("Fetched data:", data);

            setExams(data.exams || []);
            setCc(data.cc || []);
            setRattrapage(data.rattrapage || []);
            setSurveillance(data.surveillance || []);
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
                <div className="bg-[#EEF2F8] shadow-lg rounded-lg p-6 border-2 border-[#3A5377]">
                    <h2 className="text-center text-[#0B2844] font-semibold font-montserrat mb-4 text-xl">
                        {title}
                    </h2>
                    <div className="text-center text-gray-500 py-8">
                        Aucun examen planifié
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-[#EEF2F8] shadow-lg rounded-lg p-6 border-2 border-[#3A5377]">
                <h2 className="text-center text-[#0B2844] font-semibold font-montserrat mb-4 text-xl">
                    {title}
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full border border-[#3A5377] rounded-lg text-[#0B2844] font-montserrat">
                        <thead>
                            <tr className="text-center bg-[#F8FAFC]">
                                <th className="border border-[#3A5377] px-4 py-3">
                                    Module
                                </th>
                                <th className="border border-[#3A5377] px-4 py-3">
                                    Niveau/Groupe
                                </th>
                                <th className="border border-[#3A5377] px-4 py-3">
                                    Salle
                                </th>
                                <th className="border border-[#3A5377] px-4 py-3">
                                    Date
                                </th>
                                <th className="border border-[#3A5377] px-4 py-3">
                                    Horaire
                                </th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {examList.map((exam, index) => (
                                <tr key={index} className="text-center">
                                    <td className="border border-[#3A5377] px-4 py-3 font-semibold">
                                        {exam.module}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {exam.niveau} / {exam.group}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {exam.room}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {new Date(exam.date).toLocaleDateString("fr-FR")}
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

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    // ===== Claims: submit from teacher =====
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

            // Map 'examen' -> 'exam' to match backend's accepted exam_type values
            const typeMap = (t) => (t === "examen" ? "exam" : t);

            await api.post("/claims", {
                exam_id: selectedExamForClaim.id,
                exam_type: typeMap(selectedExamForClaim.type),
                message: claimReason.trim(),
                // include teacher matricule so the API can associate teacher without web auth
                teacher_matricule: teacherData?.matricule,
            });

            // notify admin pages
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#E6EEF7]">
                <div className="text-[#0B2844] text-xl font-semibold">
                    Chargement...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#E6EEF7]">
                <div className="text-red-600 text-xl font-semibold mb-4">
                    Erreur: {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#E6EEF7]">
            <div className="flex-grow relative">
                <img
                    src={uniLogo}
                    alt="UABT Logo"
                    className="absolute top-4 left-4 w-14 h-14 object-contain"
                />

                <h1 className="text-2xl font-semibold text-center pt-6 mb-6 text-[#0B2844] font-montserrat">
                    Departement Informatique
                </h1>

                <div
                    className="absolute top-4 right-4 border-2 border-[#0B2844] rounded-2xl p-2 cursor-pointer hover:bg-gray-100"
                    onClick={handleLogout}
                >
                    <img
                        src={logoutIcon}
                        alt="logout"
                        className="w-6 h-6 object-contain"
                    />
                </div>

                <div className="mt-4 border-t border-[#3A5377] w-full"></div>

                <div className="mt-12 flex justify-start ml-8">
                    <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                        Espace Enseignants
                    </p>
                </div>

                <div className="flex items-center justify-center mt-12">
                    <div
                        className="bg-[#EEF2F8] shadow-lg rounded-lg p-4 border-2 border-[#3A5377]"
                        style={{ width: "1600px", minHeight: "300px" }}
                    >
                        {teacherData && (
                            <>
                                <p className="text-left text-[#0B2844] mb-4 text-xl font-semibold font-montserrat">
                                    Nom Enseignant : {teacherData.name}
                                </p>
                                <p className="text-left text-[#0B2844] mb-4 font-semibold font-montserrat">
                                    Matricule : {teacherData.matricule}
                                </p>
                                <p className="text-left text-[#0B2844] mb-4 font-semibold font-montserrat">
                                    Email : {teacherData.email}
                                </p>
                            </>
                        )}

                        <p className="text-left text-[#0B2844] mb-4 font-semibold font-montserrat">
                            Mes Examens :
                        </p>

                        {/* Main Buttons */}
                        <div className="flex space-x-4 mb-6">
                            <button
                                onClick={() => {
                                    setActiveView("exams");
                                    setActiveTabS1("");
                                    setActiveTabS2("");
                                }}
                                className={`px-6 py-3 rounded-lg font-montserrat transition-colors ${
                                    activeView === "exams"
                                        ? "bg-[#3A5377] text-white font-semibold"
                                        : "bg-white border-2 border-[#3A5377] text-[#0B2844] hover:bg-gray-50"
                                }`}
                            >
                                Mes plannings
                            </button>
                            
                        </div>

                        {/* Semester Tabs - Only show when a view is active */}
                        {activeView === "exams" && (
                            <>
                                <div className="flex items-center space-x-4 mb-2">
                                    <p className="text-[#0B2844] font-regular font-montserrat w-12">
                                        S1
                                    </p>
                                    <div className="flex space-x-3">
                                        {["CC", "EXAM", "RATT"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTabS1(tab);
                                                    setActiveTabS2("");
                                                }}
                                                className={`text-[#0B2844] font-montserrat hover:underline ${
                                                    activeTabS1 === tab
                                                        ? "underline font-semibold"
                                                        : ""
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 mb-2">
                                    <p className="text-[#0B2844] font-regular font-montserrat w-12">
                                        S2
                                    </p>
                                    <div className="flex space-x-3">
                                        {["CC", "EXAM", "RATT"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTabS2(tab);
                                                    setActiveTabS1("");
                                                }}
                                                className={`text-[#0B2844] font-montserrat hover:underline ${
                                                    activeTabS2 === tab
                                                        ? "underline font-semibold"
                                                        : ""
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        
                    </div>
                </div>

                {/* EXAMS VIEW - Taught Exams */}
                {activeView === "exams" && (
                    <>
                        {activeTabS1 === "CC" && (
                            <div className="flex flex-col items-center justify-center mt-12">
                                <ExamTable
                                    title="PLANNING S1 - CONTRÔLE CONTINU (Enseignés)"
                                    examList={filterBySemester(cc, "1")}
                                />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS1("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(cc, "1");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500"
                                    >
                                        Signaler
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS1 === "EXAM" && (
                            <div className="flex flex-col items-center justify-center mt-12">
                                <ExamTable
                                    title="PLANNING S1 - EXAMENS (Enseignés)"
                                    examList={filterBySemester(exams, "1")}
                                />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS1("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(exams, "1");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500"
                                    >
                                        Signaler
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS1 === "RATT" && (
                            <div className="flex flex-col items-center justify-center mt-12">
                                <ExamTable
                                    title="PLANNING S1 - RATTRAPAGES (Enseignés)"
                                    examList={filterBySemester(rattrapage, "1")}
                                />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS1("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(rattrapage, "1");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500"
                                    >
                                        Signaler
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "CC" && (
                            <div className="flex flex-col items-center justify-center mt-12">
                                <ExamTable
                                    title="PLANNING S2 - CONTRÔLE CONTINU (Enseignés)"
                                    examList={filterBySemester(cc, "2")}
                                />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS2("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(cc, "2");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500"
                                    >
                                        Signaler
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "EXAM" && (
                            <div className="flex flex-col items-center justify-center mt-12">
                                <ExamTable
                                    title="PLANNING S2 - EXAMENS (Enseignés)"
                                    examList={filterBySemester(exams, "2")}
                                />
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTabS2("")}
                                        className="px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => {
                                            const list = filterBySemester(exams, "2");
                                            setClaimCandidates(list);
                                            setSelectedExamForClaim(list[0] || null);
                                            setClaimReason("");
                                            setShowClaimModal(true);
                                        }}
                                        className="px-6 py-2 bg-yellow-400 rounded-lg text-black hover:bg-yellow-500"
                                    >
                                        Signaler
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTabS2 === "RATT" && (
                            <div className="flex flex-col items-center justify-center mt-12">
                                <ExamTable
                                    title="PLANNING S2 - RATTRAPAGES (Enseignés)"
                                    examList={filterBySemester(rattrapage, "2")}
                                />
                                <button
                                    onClick={() => setActiveTabS2("")}
                                    className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                                >
                                    Fermer
                                </button>
                            </div>
                        )}
                    </>
                )}

                
            </div>

            {/* ================= Claim Modal ================= */}
            <Modal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                title="Signaler un examen"
            >
                <div>
                    <p className="font-semibold mb-2">Sélectionnez l'examen :</p>
                    <select
                        value={selectedExamForClaim?.id || ""}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            const ex = claimCandidates.find((c) => c.id === id) || null;
                            setSelectedExamForClaim(ex);
                        }}
                        className="w-full border p-2 mb-3"
                    >
                        {claimCandidates.length === 0 && (
                            <option value="">Aucun examen disponible</option>
                        )}
                        {claimCandidates.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                                {exam.module} — {exam.niveau}/{exam.group} — {new Date(exam.date).toLocaleDateString("fr-FR")}
                            </option>
                        ))}
                    </select>

                    <p className="font-semibold mb-2">Raison :</p>
                    <textarea
                        rows={6}
                        value={claimReason}
                        onChange={(e) => setClaimReason(e.target.value)}
                        className="w-full border p-2"
                        placeholder="Expliquez la raison de votre signalement"
                    />

                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            className="btn-secondary"
                            onClick={() => setShowClaimModal(false)}
                            disabled={claimSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleSubmitClaim}
                            disabled={claimSubmitting || !selectedExamForClaim}
                        >
                            {claimSubmitting ? "Envoi..." : "Envoyer"}
                        </button>
                    </div>
                </div>
            </Modal>

            <footer className="bg-white border-t border-[#768FA6] mt-auto">
                <div className="px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm text-[#768FA6] font-montserrat">
                            Copyright © 2026 Université Abou Bekr Belkaïd
                            Tlemcen. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}