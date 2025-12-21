import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import "./ExamManagement.css";

const ExamManagement = () => {
    const [showAddExamModal, setShowAddExamModal] = useState(false);
    const [showEditExamModal, setShowEditExamModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);

    const [newExam, setNewExam] = useState({
        type: "Examen",
        module: "",
        teacher: "",
        room: "",
        niveau: "",
        group: "",
        date: "",
        startTime: "",
        endTime: "",
        specialite: "informatique",
    });

    const [editExam, setEditExam] = useState({
        type: "",
        module: "",
        teacher: "",
        room: "",
        niveau: "",
        group: "",
        date: "",
        startTime: "",
        endTime: "",
        specialite: "",
    });

    /* ================= FETCH EXAMS ================= */
    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get("/exams");

            const allExams = [
                ...res.data.exams.map((e) => ({ ...e, type: "examen" })),
                ...res.data.ccs.map((e) => ({ ...e, type: "cc" })),
                ...res.data.rattrapages.map((e) => ({
                    ...e,
                    type: "rattrapage",
                })),
            ];

            setExams(allExams);
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    /* ================= ADD EXAM ================= */
    const handleAddExam = async () => {
        try {
            await api.post("/exams", {
                type: newExam.type.toLowerCase(),
                module: newExam.module,
                teacher: newExam.teacher,
                room: newExam.room,
                niveau: newExam.niveau,
                group: newExam.group,
                date: newExam.date,
                start_time: newExam.startTime,
                end_time: newExam.endTime,
                specialite: newExam.specialite,
                semester: 1,
            });

            setShowAddExamModal(false);

            // Reset form
            setNewExam({
                type: "Examen",
                module: "",
                teacher: "",
                room: "",
                niveau: "",
                group: "",
                date: "",
                startTime: "",
                endTime: "",
                specialite: "informatique",
            });

            fetchExams();
            alert("Examen ajouté avec succès!");
        } catch (err) {
            console.error("Create error", err);
            alert("Erreur lors de la création de l'examen");
        }
    };

    /* ================= EDIT EXAM ================= */
    const handleEditClick = async (exam) => {
        setSelectedExam(exam);
        setEditExam({
            type: exam.type.charAt(0).toUpperCase() + exam.type.slice(1),
            module: exam.module,
            teacher: exam.teacher || "",
            room: exam.room,
            niveau: exam.niveau,
            group: exam.group,
            date: exam.date,
            startTime: exam.start_time,
            endTime: exam.end_time,
            specialite: exam.specialite,
        });
        setShowEditExamModal(true);
    };

    const handleUpdateExam = async () => {
        try {
            await api.put(`/exams/${selectedExam.id}`, {
                type: editExam.type.toLowerCase(),
                module: editExam.module,
                teacher: editExam.teacher,
                room: editExam.room,
                niveau: editExam.niveau,
                group: editExam.group,
                date: editExam.date,
                start_time: editExam.startTime,
                end_time: editExam.endTime,
                specialite: editExam.specialite,
                semester: 1,
            });

            setShowEditExamModal(false);
            setSelectedExam(null);
            fetchExams();
            alert("Examen modifié avec succès!");
        } catch (err) {
            console.error("Update error", err);
            alert("Erreur lors de la modification de l'examen");
        }
    };

    /* ================= DELETE EXAM ================= */
    const handleDeleteClick = (exam) => {
        setSelectedExam(exam);
        setShowDeleteConfirmModal(true);
    };

    const handleDeleteExam = async () => {
        try {
            await api.delete(`/exams/${selectedExam.id}`);
            setShowDeleteConfirmModal(false);
            setSelectedExam(null);
            fetchExams();
            alert("Examen supprimé avec succès!");
        } catch (err) {
            console.error("Delete error", err);
            alert("Erreur lors de la suppression de l'examen");
        }
    };

    /* ================= FILTERING ================= */
    const examTypes = {
        examen: exams.filter((e) => e.type === "examen"),
        cc: exams.filter((e) => e.type === "cc"),
        rattrapage: exams.filter((e) => e.type === "rattrapage"),
    };

    return (
        <div className="exam-management">
            <div className="page-header">
                <h1>Planning des Examens</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowAddExamModal(true)}
                >
                    + Ajouter un examen
                </button>
            </div>

            {/* ================= EXAMENS ================= */}
            <Section
                title="Examens"
                data={examTypes.examen}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            {/* ================= CC ================= */}
            <Section
                title="Contrôle Continu"
                data={examTypes.cc}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            {/* ================= RATTRAPAGE ================= */}
            <Section
                title="Rattrapage"
                data={examTypes.rattrapage}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            {/* ================= ADD MODAL ================= */}
            <Modal
                isOpen={showAddExamModal}
                onClose={() => setShowAddExamModal(false)}
                title="Ajouter un examen"
            >
                <ExamForm
                    exam={newExam}
                    setExam={setNewExam}
                    onSubmit={handleAddExam}
                    onCancel={() => {
                        setShowAddExamModal(false);
                        setNewExam({
                            type: "Examen",
                            module: "",
                            teacher: "",
                            room: "",
                            niveau: "",
                            group: "",
                            date: "",
                            startTime: "",
                            endTime: "",
                            specialite: "informatique",
                        });
                    }}
                    submitLabel="Enregistrer"
                />
            </Modal>

            {/* ================= EDIT MODAL ================= */}
            <Modal
                isOpen={showEditExamModal}
                onClose={() => {
                    setShowEditExamModal(false);
                    setSelectedExam(null);
                }}
                title="Modifier l'examen"
            >
                <ExamForm
                    exam={editExam}
                    setExam={setEditExam}
                    onSubmit={handleUpdateExam}
                    onCancel={() => {
                        setShowEditExamModal(false);
                        setSelectedExam(null);
                    }}
                    submitLabel="Modifier"
                />
            </Modal>

            {/* ================= DELETE CONFIRMATION MODAL ================= */}
            <Modal
                isOpen={showDeleteConfirmModal}
                onClose={() => {
                    setShowDeleteConfirmModal(false);
                    setSelectedExam(null);
                }}
                title="Confirmer la suppression"
            >
                <div className="delete-confirmation">
                    <p>Êtes-vous sûr de vouloir supprimer cet examen ?</p>
                    {selectedExam && (
                        <div className="exam-details">
                            <p>
                                <strong>Module:</strong> {selectedExam.module}
                            </p>
                            <p>
                                <strong>Date:</strong> {selectedExam.date}
                            </p>
                            <p>
                                <strong>Salle:</strong> {selectedExam.room}
                            </p>
                        </div>
                    )}
                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowDeleteConfirmModal(false);
                                setSelectedExam(null);
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-danger"
                            onClick={handleDeleteExam}
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

/* ================= EXAM FORM (REUSABLE) ================= */
const ExamForm = ({ exam, setExam, onSubmit, onCancel, submitLabel }) => (
    <div className="add-exam-form">
        <div className="form-row">
            <div className="form-group">
                <label>Type</label>
                <select
                    value={exam.type}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            type: e.target.value,
                        })
                    }
                >
                    <option value="Examen">Examen</option>
                    <option value="CC">Contrôle Continu</option>
                    <option value="Rattrapage">Rattrapage</option>
                </select>
            </div>

            <div className="form-group">
                <label>Module</label>
                <input
                    type="text"
                    value={exam.module}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            module: e.target.value,
                        })
                    }
                    placeholder="Entrez le nom du module"
                />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Enseignant</label>
                <input
                    type="text"
                    value={exam.teacher}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            teacher: e.target.value,
                        })
                    }
                    placeholder="Nom de l'enseignant"
                />
            </div>

            <div className="form-group">
                <label>Salle</label>
                <input
                    type="text"
                    value={exam.room}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            room: e.target.value,
                        })
                    }
                    placeholder="Numéro de salle"
                />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Niveau</label>
                <input
                    type="text"
                    value={exam.niveau}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            niveau: e.target.value,
                        })
                    }
                    placeholder="Ex: L1, L2, L3, M1, M2"
                />
            </div>

            <div className="form-group">
                <label>Groupe</label>
                <input
                    type="text"
                    value={exam.group}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            group: e.target.value,
                        })
                    }
                    placeholder="Ex: G1, G2, G3"
                />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Spécialité</label>
                <select
                    value={exam.specialite}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            specialite: e.target.value,
                        })
                    }
                >
                    <option value="informatique">Informatique</option>
                    <option value="mathematiques">Mathématiques</option>
                    <option value="physique">Physique</option>
                    <option value="chimie">Chimie</option>
                </select>
            </div>

            <div className="form-group">
                <label>Date</label>
                <input
                    type="date"
                    value={exam.date}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            date: e.target.value,
                        })
                    }
                />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Heure de début</label>
                <input
                    type="time"
                    value={exam.startTime}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            startTime: e.target.value,
                        })
                    }
                />
            </div>

            <div className="form-group">
                <label>Heure de fin</label>
                <input
                    type="time"
                    value={exam.endTime}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            endTime: e.target.value,
                        })
                    }
                />
            </div>
        </div>

        <div className="form-actions">
            <button className="btn-secondary" onClick={onCancel}>
                Annuler
            </button>
            <button className="btn-primary" onClick={onSubmit}>
                {submitLabel}
            </button>
        </div>
    </div>
);

/* ================= TABLE SECTION (REUSABLE) ================= */
const Section = ({ title, data, onEdit, onDelete }) => (
    <section className="exam-section">
        <h2>{title}</h2>
        <table className="data-table">
            <thead>
                <tr>
                    <th>Module</th>
                    <th>Enseignant</th>
                    <th>Salle</th>
                    <th>Spécialité</th>
                    <th>Niveau</th>
                    <th>Groupe</th>
                    <th>Date</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map((exam) => (
                        <tr key={exam.id}>
                            <td>{exam.module}</td>
                            <td>{exam.teacher || "-"}</td>
                            <td>{exam.room}</td>
                            <td>{exam.specialite}</td>
                            <td>{exam.niveau}</td>
                            <td>{exam.group}</td>
                            <td>{exam.date}</td>
                            <td>{exam.start_time}</td>
                            <td>{exam.end_time}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-edit"
                                        onClick={() => onEdit(exam)}
                                        title="Modifier"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => onDelete(exam)}
                                        title="Supprimer"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="10" className="no-data">
                            Aucun examen
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </section>
);

export default ExamManagement;
