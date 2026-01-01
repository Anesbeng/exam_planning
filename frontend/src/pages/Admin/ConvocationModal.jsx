import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./convocation.css";

const ConvocationModal = ({ exam, onClose }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingNotification, setSendingNotification] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null); // 'preview' or 'notify'
    const [sendEmail, setSendEmail] = useState(false);
    const [customMessage, setCustomMessage] = useState("");

    useEffect(() => {
        if (exam?.id) {
            fetchStudents();
        }
    }, [exam]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get(
                `/convocations/exam/${exam.id}/students`
            );
            setStudents(response.data.students || []);
        } catch (error) {
            console.error("Error fetching students:", error);
            alert("Erreur lors de la récupération des étudiants");
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        try {
            const response = await api.get(
                `/convocations/exam/${exam.id}/preview`
            );
            const data = response.data;

            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(data.university, 105, 20, { align: "center" });

            doc.setFontSize(14);
            doc.text(data.department, 105, 30, { align: "center" });

            // Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("CONVOCATION D'EXAMEN", 105, 45, { align: "center" });

            // Exam details box
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            const examDetails = [
                `Type: ${data.exam_info.type.toUpperCase()}`,
                `Module: ${data.exam_info.module}`,
                `Date: ${new Date(data.exam_info.date).toLocaleDateString(
                    "fr-FR"
                )}`,
                `Horaire: ${data.exam_info.start_time} - ${data.exam_info.end_time}`,
                `Salle: ${data.exam_info.room}`,
                `Niveau: ${data.exam_info.niveau} - Groupe: ${data.exam_info.group}`,
                `Spécialité: ${data.exam_info.specialite}`,
                `Semestre: ${data.exam_info.semester}`,
            ];

            let yPos = 55;
            examDetails.forEach((detail) => {
                doc.text(detail, 20, yPos);
                yPos += 7;
            });

            // Teacher info
            yPos += 5;
            doc.setFont("helvetica", "bold");
            doc.text(`Enseignant: ${data.teacher_info.name}`, 20, yPos);

            // Students table
            yPos += 10;
            autoTable(doc, {
                head: [["N°", "Nom", "Matricule", "Email"]],
                body: data.students.map((student) => [
                    student.numero,
                    student.name,
                    student.matricule,
                    student.email,
                ]),
                startY: yPos,
                headStyles: {
                    fillColor: [59, 83, 119],
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: "bold",
                },
                alternateRowStyles: {
                    fillColor: [238, 242, 248],
                },
                margin: { left: 20, right: 20 },
            });

            // Footer
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Total: ${data.total_students} étudiant(s)`, 20, finalY);
            doc.text(
                `Généré le: ${new Date(data.generated_at).toLocaleString(
                    "fr-FR"
                )}`,
                20,
                finalY + 7
            );

            // Save PDF
            const fileName = `convocation_${data.exam_info.module}_${data.exam_info.date}.pdf`;
            doc.save(fileName);

            alert("PDF généré avec succès !");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Erreur lors de la génération du PDF");
        }
    };

    const sendNotification = async () => {
        if (
            !window.confirm(
                "Voulez-vous envoyer la notification à l'enseignant ?"
            )
        ) {
            return;
        }

        try {
            setSendingNotification(true);

            await api.post(`/convocations/exam/${exam.id}/notify`, {
                send_email: sendEmail,
                message: customMessage || undefined,
            });

            alert(
                `Notification envoyée avec succès${
                    sendEmail ? " (email inclus)" : ""
                } !`
            );
            setSelectedAction(null);
            setCustomMessage("");
            setSendEmail(false);
        } catch (error) {
            console.error("Error sending notification:", error);
            alert("Erreur lors de l'envoi de la notification");
        } finally {
            setSendingNotification(false);
        }
    };

    if (!exam) return null;

    return (
        <div className="convocation-modal-overlay">
            <div className="convocation-modal">
                {/* Header */}
                <div className="convocation-header">
                    <h2>📋 Convocation - {exam.module}</h2>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Exam Info */}
                <div className="convocation-exam-info">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Type:</span>
                            <span className="info-value">{exam.type}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Date:</span>
                            <span className="info-value">
                                {new Date(exam.date).toLocaleDateString(
                                    "fr-FR"
                                )}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Horaire:</span>
                            <span className="info-value">
                                {exam.start_time} - {exam.end_time}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Salle:</span>
                            <span className="info-value">{exam.room}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Niveau/Groupe:</span>
                            <span className="info-value">
                                {exam.niveau}/{exam.group}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Enseignant:</span>
                            <span className="info-value">{exam.teacher}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {!selectedAction && (
                    <div className="convocation-actions">
                        <button
                            className="action-btn preview-btn"
                            onClick={() => setSelectedAction("preview")}
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            Aperçu & Télécharger PDF
                        </button>

                        <button
                            className="action-btn notify-btn"
                            onClick={() => setSelectedAction("notify")}
                        >
                            <svg
                                className="w-5 h-5 mr-2"
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
                            Générer Convocation & Notifier
                        </button>
                    </div>
                )}

                {/* Preview Action */}
                {selectedAction === "preview" && (
                    <div className="action-panel">
                        <h3>📄 Aperçu Convocation</h3>
                        <p className="action-description">
                            La liste des étudiants sera affichée ci-dessous.
                            Cliquez sur "Télécharger PDF" pour générer le
                            document.
                        </p>

                        <div className="button-group">
                            <button
                                className="btn-primary"
                                onClick={generatePDF}
                            >
                                ⬇️ Télécharger PDF
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedAction(null)}
                            >
                                Retour
                            </button>
                        </div>
                    </div>
                )}

                {/* Notify Action */}
                {selectedAction === "notify" && (
                    <div className="action-panel">
                        <h3>📧 Envoyer Notification</h3>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={sendEmail}
                                    onChange={(e) =>
                                        setSendEmail(e.target.checked)
                                    }
                                />
                                <span>Envoyer également par email</span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Message personnalisé (optionnel):</label>
                            <textarea
                                value={customMessage}
                                onChange={(e) =>
                                    setCustomMessage(e.target.value)
                                }
                                placeholder="Ajoutez un message personnalisé pour l'enseignant..."
                                rows={4}
                                className="form-textarea"
                            />
                        </div>

                        <div className="button-group">
                            <button
                                className="btn-primary"
                                onClick={sendNotification}
                                disabled={sendingNotification}
                            >
                                {sendingNotification
                                    ? "Envoi..."
                                    : "✉️ Envoyer Notification"}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedAction(null)}
                                disabled={sendingNotification}
                            >
                                Retour
                            </button>
                        </div>
                    </div>
                )}

                {/* Students List */}
                <div className="convocation-students">
                    <h3>👥 Liste des Étudiants ({students.length})</h3>

                    {loading ? (
                        <div className="loading-spinner">Chargement...</div>
                    ) : students.length === 0 ? (
                        <div className="no-students">
                            <p>Aucun étudiant trouvé pour ce groupe</p>
                        </div>
                    ) : (
                        <div className="students-table-container">
                            <table className="students-table">
                                <thead>
                                    <tr>
                                        <th>N°</th>
                                        <th>Nom</th>
                                        <th>Matricule</th>
                                        <th>Email</th>
                                        <th>Niveau</th>
                                        <th>Groupe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr key={student.id}>
                                            <td>{index + 1}</td>
                                            <td>{student.name}</td>
                                            <td>{student.matricule}</td>
                                            <td>{student.email}</td>
                                            <td>{student.niveau}</td>
                                            <td>{student.groupe}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="convocation-footer">
                    <button className="btn-close" onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConvocationModal;
