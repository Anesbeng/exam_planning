import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

    useEffect(() => {
        // Check if user is logged in
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

            const response = await fetch(
                `http://localhost/exam_planning/public/api/student/exams?matricule=${matricule}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to fetch exam data"
                );
            }

            const data = await response.json();
            console.log("Fetched data:", data); // Debug log

            setStudentData(data.student);
            setExams(data.exams || []);
            setCc(data.cc || []);
            setRattrapage(data.rattrapage || []);
        } catch (err) {
            setError(err.message);
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
                                    Enseignant
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
                                        {exam.teacher}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {exam.room}
                                    </td>
                                    <td className="border border-[#3A5377] px-4 py-3">
                                        {new Date(exam.date).toLocaleDateString(
                                            "fr-FR"
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

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/Login");
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
                    src="universite-abou-bekr-belkaid-tlemcen-logo-algeria-removebg-preview (1).png"
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
                        src="user-logout.png"
                        alt="user-logout"
                        className="w-6 h-6 object-contain"
                    />
                </div>

                <div className="mt-4 border-t border-[#3A5377] w-full"></div>

                <div className="mt-12 flex justify-start ml-8">
                    <p className="text-[#0B2844] text-lg font-semibold font-montserrat">
                        Espace Etudiants
                    </p>
                </div>

                <div className="flex items-center justify-center mt-12">
                    <div
                        className="bg-[#EEF2F8] shadow-lg rounded-lg p-4 border-2 border-[#3A5377]"
                        style={{ width: "1600px", minHeight: "300px" }}
                    >
                        {studentData && (
                            <>
                                <p className="text-left text-[#0B2844] mb-4 text-xl font-semibold font-montserrat">
                                    Nom Etudiant : {studentData.name}
                                </p>
                                <p className="text-left text-[#0B2844] mb-4 font-semibold font-montserrat">
                                    Spécialité : {studentData.specialite}
                                </p>
                                <p className="text-left text-[#0B2844] mb-4 font-semibold font-montserrat">
                                    Niveau : {studentData.niveau}
                                </p>
                                <p className="text-left text-[#0B2844] mb-4 font-semibold font-montserrat">
                                    Groupe : {studentData.groupe}
                                </p>
                            </>
                        )}

                        <p className="text-left text-[#0B2844] mb-4 font-semibold font-montserrat">
                            Semestres :
                        </p>

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
                    </div>
                </div>

                {activeTabS1 === "CC" && (
                    <div className="flex flex-col items-center justify-center mt-12">
                        <ExamTable
                            title="PLANNING S1 - CONTRÔLE CONTINU"
                            examList={filterBySemester(cc, "1")}
                        />
                        <button
                            onClick={() => setActiveTabS1("")}
                            className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                        >
                            Fermer
                        </button>
                    </div>
                )}

                {activeTabS1 === "EXAM" && (
                    <div className="flex flex-col items-center justify-center mt-12">
                        <ExamTable
                            title="PLANNING S1 - EXAMENS"
                            examList={filterBySemester(exams, "1")}
                        />
                        <button
                            onClick={() => setActiveTabS1("")}
                            className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                        >
                            Fermer
                        </button>
                    </div>
                )}

                {activeTabS1 === "RATT" && (
                    <div className="flex flex-col items-center justify-center mt-12">
                        <ExamTable
                            title="PLANNING S1 - RATTRAPAGES"
                            examList={filterBySemester(rattrapage, "1")}
                        />
                        <button
                            onClick={() => setActiveTabS1("")}
                            className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                        >
                            Fermer
                        </button>
                    </div>
                )}

                {activeTabS2 === "CC" && (
                    <div className="flex flex-col items-center justify-center mt-12">
                        <ExamTable
                            title="PLANNING S2 - CONTRÔLE CONTINU"
                            examList={filterBySemester(cc, "2")}
                        />
                        <button
                            onClick={() => setActiveTabS2("")}
                            className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                        >
                            Fermer
                        </button>
                    </div>
                )}

                {activeTabS2 === "EXAM" && (
                    <div className="flex flex-col items-center justify-center mt-12">
                        <ExamTable
                            title="PLANNING S2 - EXAMENS"
                            examList={filterBySemester(exams, "2")}
                        />
                        <button
                            onClick={() => setActiveTabS2("")}
                            className="mt-4 px-6 py-2 border border-[#3A5377] rounded-lg text-[#0B2844] hover:bg-gray-100"
                        >
                            Fermer
                        </button>
                    </div>
                )}

                {activeTabS2 === "RATT" && (
                    <div className="flex flex-col items-center justify-center mt-12">
                        <ExamTable
                            title="PLANNING S2 - RATTRAPAGES"
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
            </div>

            <footer className="bg-white border-t border-[#768FA6] mt-auto">
                <div className="px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm text-[#768FA6] font-montserrat">
                            Copyright © 2014 Université Abou Bekr Belkaïd
                            Tlemcen. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
