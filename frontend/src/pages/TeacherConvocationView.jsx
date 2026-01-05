import React, { useState, useEffect } from "react";
import api from "../api/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/TeacherConvocationView.css";

const TeacherConvocationView = ({ notification, onClose }) => {
    const [students, setStudents] = useState([]);
    const [examDetails, setExamDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (notification?.exam_id) {
            fetchConvocationData();
        }
    }, [notification]);

    const fetchConvocationData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch students and exam details
            const response = await api.get(
                `/convocations/exam/${notification.exam_id}/students`
            );

            setExamDetails(response.data.exam);
            setStudents(response.data.students || []);
        } catch (err) {
            console.error("Error fetching convocation data:", err);
            setError("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        try {
            const response = await api.get(
                `/convocations/exam/${notification.exam_id}/preview`
            );
            const data = response.data;

            const doc = new jsPDF();

            // Header with University Info
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(11, 40, 68); // #0B2844
            doc.text(data.university, 105, 20, { align: "center" });

            doc.setFontSize(14);
            doc.setTextColor(58, 83, 119); // #3A5377
            doc.text(data.department, 105, 30, { align: "center" });

            // Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(11, 40, 68);
            doc.text("CONVOCATION D'EXAMEN", 105, 45, { align: "center" });

            // Line separator
            doc.setDrawColor(58, 83, 119);
            doc.setLineWidth(0.5);
            doc.line(20, 50, 190, 50);

            // Exam details box
            doc.setFillColor(238, 242, 248); // #EEF2F8
            doc.roundedRect(20, 55, 170, 65, 3, 3, "F");

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(11, 40, 68);

            const examDetails = [
                { label: "Type", value: data.exam_info.type.toUpperCase() },
                { label: "Module", value: data.exam_info.module },
                {
                    label: "Date",
                    value: new Date(data.exam_info.date).toLocaleDateString(
                        "fr-FR",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    ),
                },
                {
                    label: "Horaire",
                    value: `${data.exam_info.start_time} - ${data.exam_info.end_time}`,
                },
                { label: "Salle", value: data.exam_info.room },
                {
                    label: "Niveau",
                    value: `${data.exam_info.niveau} - Groupe ${data.exam_info.group}`,
                },
                { label: "Spécialité", value: data.exam_info.specialite },
                { label: "Semestre", value: data.exam_info.semester },
            ];

            let yPos = 62;
            examDetails.forEach((detail) => {
                doc.setFont("helvetica", "bold");
                doc.setTextColor(58, 83, 119);
                doc.text(`${detail.label}:`, 25, yPos);

                doc.setFont("helvetica", "normal");
                doc.setTextColor(11, 40, 68);
                doc.text(detail.value, 70, yPos);

                yPos += 8;
            });

            // Teacher info
            yPos = 125;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(58, 83, 119);
            doc.text(
                `Enseignant responsable: ${data.teacher_info.name}`,
                20,
                yPos
            );

            // Students table
            yPos += 10;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(11, 40, 68);
            doc.text(`Liste des étudiants (${data.total_students})`, 20, yPos);

            yPos += 5;
            autoTable(doc, {
                head: [["N°", "Nom", "Matricule"]],
                body: data.students.map((student) => [
                    student.numero,
                    student.name,
                    student.matricule,
                ]),
                startY: yPos,
                headStyles: {
                    fillColor: [58, 83, 119],
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: "bold",
                    halign: "center",
                },
                bodyStyles: {
                    fontSize: 9,
                    textColor: [11, 40, 68],
                },
                alternateRowStyles: {
                    fillColor: [238, 242, 248],
                },
                margin: { left: 20, right: 20 },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { cellWidth: 100 },
                    2: { halign: "center", cellWidth: 45 },
                },
            });

            // Footer
            const finalY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(118, 143, 166);
            doc.text(
                `Document généré le ${new Date().toLocaleString("fr-FR")}`,
                20,
                finalY
            );

            // Page border
            doc.setDrawColor(58, 83, 119);
            doc.setLineWidth(0.5);
            doc.rect(15, 15, 180, 267);

            // Save PDF
            const fileName = `convocation_${data.exam_info.module.replace(
                /\s+/g,
                "_"
            )}_${data.exam_info.date}.pdf`;
            doc.save(fileName);

            alert("✅ PDF téléchargé avec succès !");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("❌ Erreur lors de la génération du PDF");
        }
    };

    if (!notification) return null;

    return (
        <div className="convocation-overlay">
            <div className="convocation-container">
                {/* Header */}
                <div className="convocation-header">
                    <h2>📋 Convocation d'Examen</h2>
                    <button className="close-button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <p>Chargement des informations...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <p>{error}</p>
                        <button
                            className="btn-retry"
                            onClick={fetchConvocationData}
                        >
                            Réessayer
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Exam Details */}
                        {examDetails && (
                            <div className="exam-details-section">
                                <h3>📚 Détails de l'examen</h3>
                                <div className="details-grid">
                                    <div className="detail-card">
                                        <span className="detail-label">
                                            Type
                                        </span>
                                        <span
                                            className={`detail-value type-badge ${examDetails.type}`}
                                        >
                                            {examDetails.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">
                                            Module
                                        </span>
                                        <span className="detail-value font-bold">
                                            {examDetails.module}
                                        </span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">
                                            Date
                                        </span>
                                        <span className="detail-value">
                                            {new Date(
                                                examDetails.date
                                            ).toLocaleDateString("fr-FR", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">
                                            Horaire
                                        </span>
                                        <span className="detail-value">
                                            ⏰ {examDetails.start_time} -{" "}
                                            {examDetails.end_time}
                                        </span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">
                                            Salle
                                        </span>
                                        <span className="detail-value">
                                            🏢 {examDetails.room}
                                        </span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">
                                            Niveau / Groupe
                                        </span>
                                        <span className="detail-value">
                                            👥 {examDetails.niveau} /{" "}
                                            {examDetails.group}
                                        </span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">
                                            Spécialité
                                        </span>
                                        <span className="detail-value">
                                            {examDetails.specialite}
                                        </span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">
                                            Semestre
                                        </span>
                                        <span className="detail-value">
                                            {examDetails.semester}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Students Count */}
                        <div className="students-count-banner">
                            <div className="count-icon">👥</div>
                            <div className="count-text">
                                <span className="count-number">
                                    {students.length}
                                </span>
                                <span className="count-label">
                                    étudiant(s) convoqué(s)
                                </span>
                            </div>
                        </div>

                        {/* Students List */}
                        <div className="students-section">
                            <h3>📝 Liste des étudiants</h3>
                            {students.length === 0 ? (
                                <div className="no-students">
                                    <p>Aucun étudiant trouvé pour ce groupe</p>
                                </div>
                            ) : (
                                <div className="students-table-wrapper">
                                    <table className="students-table">
                                        <thead>
                                            <tr>
                                                <th>N°</th>
                                                <th>Nom complet</th>
                                                <th>Matricule</th>
                                                <th>Email</th>
                                                <th>Niveau</th>
                                                <th>Groupe</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student, index) => (
                                                <tr key={student.id}>
                                                    <td className="text-center">
                                                        {index + 1}
                                                    </td>
                                                    <td className="font-semibold">
                                                        {student.name}
                                                    </td>
                                                    <td className="text-center">
                                                        {student.matricule}
                                                    </td>
                                                    <td>{student.email}</td>
                                                    <td className="text-center">
                                                        {student.niveau}
                                                    </td>
                                                    <td className="text-center">
                                                        {student.groupe}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="convocation-actions">
                            <button
                                className="btn-download"
                                onClick={downloadPDF}
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
                                Télécharger la convocation (PDF)
                            </button>
                            <button
                                className="btn-close-bottom"
                                onClick={onClose}
                            >
                                Fermer
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TeacherConvocationView;
