import React, { useState } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import "./NotifyTeacherModal.css";

const NotifyTeacherModal = ({ exam, onClose, onSuccess }) => {
    const [sendingNotification, setSendingNotification] = useState(false);
    const [sendEmail, setSendEmail] = useState(false);
    const [customMessage, setCustomMessage] = useState("");

    const handleSendNotification = async () => {
        if (
            !window.confirm(
                `Envoyer la notification à ${exam.teacher} pour cet examen ?`
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
                `✅ Notification envoyée avec succès à ${exam.teacher}${
                    sendEmail ? " (email inclus)" : ""
                } !`
            );

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (error) {
            console.error("Error sending notification:", error);
            alert(
                "❌ Erreur lors de l'envoi de la notification: " +
                    (error.response?.data?.message || error.message)
            );
        } finally {
            setSendingNotification(false);
        }
    };

    if (!exam) return null;

    return (
        <Modal isOpen={true} onClose={onClose} title="📧 Notifier l'enseignant">
            <div className="notify-teacher-content">
                {/* Exam Summary */}
                <div className="exam-summary">
                    <h3>📋 Détails de l'examen</h3>
                    <div className="exam-info-grid">
                        <div className="info-item">
                            <span className="label">Module:</span>
                            <span className="value">{exam.module}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Enseignant:</span>
                            <span className="value font-bold text-blue-600">
                                {exam.teacher}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Date:</span>
                            <span className="value">
                                {new Date(exam.date).toLocaleDateString(
                                    "fr-FR"
                                )}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Horaire:</span>
                            <span className="value">
                                {exam.start_time || exam.startTime} -{" "}
                                {exam.end_time || exam.endTime}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Niveau/Groupe:</span>
                            <span className="value">
                                {exam.niveau}/{exam.group}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Salle:</span>
                            <span className="value">{exam.room}</span>
                        </div>
                    </div>
                </div>

                {/* Notification Options */}
                <div className="notification-options">
                    <h3>⚙️ Options de notification</h3>

                    <div className="option-item">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={sendEmail}
                                onChange={(e) => setSendEmail(e.target.checked)}
                            />
                            <span>Envoyer également par email</span>
                        </label>
                        <p className="option-description">
                            L'enseignant recevra une notification dans son
                            espace et optionnellement par email.
                        </p>
                    </div>

                    <div className="option-item">
                        <label className="textarea-label">
                            Message personnalisé (optionnel):
                        </label>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Ajoutez un message personnalisé pour l'enseignant..."
                            rows={4}
                            className="message-textarea"
                        />
                        <p className="option-description">
                            Si vide, un message automatique sera généré avec les
                            détails de l'examen.
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="info-box">
                    <div className="info-icon">ℹ️</div>
                    <div className="info-text">
                        <p className="font-semibold">L'enseignant pourra:</p>
                        <ul>
                            <li>✓ Voir la convocation avec tous les détails</li>
                            <li>✓ Consulter la liste complète des étudiants</li>
                            <li>✓ Télécharger le PDF de la convocation</li>
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={sendingNotification}
                    >
                        Annuler
                    </button>
                    <button
                        className="btn-send"
                        onClick={handleSendNotification}
                        disabled={sendingNotification}
                    >
                        {sendingNotification ? (
                            <>
                                <span className="spinner"></span>
                                Envoi en cours...
                            </>
                        ) : (
                            <>📤 Envoyer la notification</>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default NotifyTeacherModal;
