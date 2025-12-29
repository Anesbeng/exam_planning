import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import "./exam-Management.css";

const ExamManagement = () => {
    const [showAddExamModal, setShowAddExamModal] = useState(false);
    const [showEditExamModal, setShowEditExamModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);

    // available rooms for add / edit forms
    const [availableRoomsNew, setAvailableRoomsNew] = useState([]);
    const [availableRoomsEdit, setAvailableRoomsEdit] = useState([]);

    // list of teachers for select
    const [teachers, setTeachers] = useState([]);

    // list of modules for select
    const [modules, setModules] = useState([]);

    const [newExam, setNewExam] = useState({
        type: "examen",
        module: "",
        teacher: "", // This will be the teacher's name
        teacherMatricule: "", // ✅ NEW: Store matricule separately
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
        teacherMatricule: "", // ✅ NEW: Store matricule separately
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

    /* ================= AVAILABLE ROOMS ================= */
    const fetchAllRooms = async () => {
        try {
            const res = await api.get('/salles');
            return res.data.salles || [];
        } catch (e) {
            console.error('Fetch all rooms error:', e);
            return [];
        }
    };

    const fetchAvailableRoomsForNew = async () => {
        try {
            const res = await api.get("/salles/available", {
                params: {
                    date: newExam.date,
                    start_time: newExam.startTime,
                    end_time: newExam.endTime,
                },
            });
            setAvailableRoomsNew(res.data.salles || []);
        } catch (err) {
            console.error("Fetch available rooms (new) error:", err);
            const all = await fetchAllRooms();
            setAvailableRoomsNew(all);
        }
    };

    useEffect(() => {
        fetchAvailableRoomsForNew();
        if (showAddExamModal) {
            fetchTeachers();
            fetchModules();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newExam.date, newExam.startTime, newExam.endTime, showAddExamModal]);

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers');
            setTeachers(res.data.teachers || []);
        } catch (err) {
            console.error('Fetch teachers error:', err);
            setTeachers([]);
        }
    };

    const fetchModules = async () => {
        try {
            const res = await api.get('/modules');
            setModules(res.data.modules || []);
        } catch (err) {
            console.error('Fetch modules error:', err);
            setModules([]);
        }
    };

    useEffect(() => {
        fetchTeachers();
        fetchModules();
    }, []);

    const fetchAvailableRoomsForEdit = async () => {
        try {
            const res = await api.get("/salles/available", {
                params: {
                    date: editExam.date,
                    start_time: editExam.startTime,
                    end_time: editExam.endTime,
                    exclude_exam_id: selectedExam ? selectedExam.id : undefined,
                },
            });
            setAvailableRoomsEdit(res.data.salles || []);
        } catch (err) {
            console.error("Fetch available rooms (edit) error:", err);
            const all = await fetchAllRooms();
            setAvailableRoomsEdit(all);
        }
    };

    useEffect(() => {
        if (selectedExam) fetchAvailableRoomsForEdit();
        if (showEditExamModal) {
            fetchTeachers();
            fetchModules();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editExam.date, editExam.startTime, editExam.endTime, selectedExam, showEditExamModal]);

    /* ================= ADD EXAM ================= */
    const handleAddExam = async () => {
        try {
            if (!newExam.module) {
                alert("Veuillez sélectionner un module pour cet examen.");
                return;
            }

            if (!newExam.room) {
                alert("Veuillez sélectionner une salle disponible pour cet examen.");
                return;
            }

            // ✅ FIXED: Send teacher matricule instead of name
            await api.post("/exams", {
                type: newExam.type,
                module: newExam.module,
                teacher: newExam.teacherMatricule, // ✅ Send matricule, not name
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

            setNewExam({
                type: "examen",
                module: "",
                teacher: "",
                teacherMatricule: "",
                room: "",
                niveau: "",
                group: "",
                date: "",
                startTime: "",
                endTime: "",
                specialite: "informatique",
            });

            fetchExams();
            localStorage.setItem('examUpdate', Date.now().toString());
            alert("Examen ajouté avec succès!");
        } catch (err) {
            console.error("Create error", err);
            const message = err?.response?.data?.message || "Erreur lors de la création de l'examen";
            alert(message);
        }
    };

    /* ================= EDIT EXAM ================= */
    const handleEditClick = async (exam) => {
        setSelectedExam(exam);
        
        // ✅ Find the teacher's matricule from the teacher name
        const teacher = teachers.find(t => t.name === exam.teacher);
        
        setEditExam({
            type: exam.type,
            module: exam.module,
            teacher: exam.teacher || "",
            teacherMatricule: teacher?.matricule || exam.teacher || "", // Try to get matricule
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
            if (!editExam.module) {
                alert("Veuillez sélectionner un module pour cet examen.");
                return;
            }

            if (!editExam.room) {
                alert("Veuillez sélectionner une salle disponible pour cet examen.");
                return;
            }

            // ✅ FIXED: Send teacher matricule instead of name
            await api.put(`/exams/${selectedExam.id}`, {
                type: editExam.type,
                module: editExam.module,
                teacher: editExam.teacherMatricule, // ✅ Send matricule, not name
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
            localStorage.setItem('examUpdate', Date.now().toString());
            alert("Examen modifié avec succès!");
        } catch (err) {
            console.error("Update error", err);
            const message = err?.response?.data?.message || "Erreur lors de la modification de l'examen";
            alert(message);
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
            localStorage.setItem('examUpdate', Date.now().toString());
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
                    availableRooms={availableRoomsNew}
                    availableTeachers={teachers}
                    availableModules={modules}
                    onSubmit={handleAddExam}
                    onCancel={() => {
                        setShowAddExamModal(false);
                        setNewExam({
                            type: "examen",
                            module: "",
                            teacher: "",
                            teacherMatricule: "",
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
                    availableRooms={availableRoomsEdit}
                    availableTeachers={teachers}
                    availableModules={modules}
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
const ExamForm = ({ exam, setExam, onSubmit, onCancel, submitLabel, availableRooms, availableTeachers, availableModules }) => {
    
    // ✅ FIXED: Handle teacher selection to store both name and matricule
    const handleTeacherChange = (e) => {
        const selectedMatricule = e.target.value;
        const teacher = availableTeachers.find(t => t.matricule === selectedMatricule);
        
        setExam({
            ...exam,
            teacher: teacher ? teacher.name : "",
            teacherMatricule: selectedMatricule
        });
    };

    return (
        <div className="add-exam-form">
            <div className="form-row">
                <div className="form-group">
                    <label>Type</label>
                    <select
                        value={exam.type}
                        onChange={(e) => setExam({ ...exam, type: e.target.value })}
                    >
                        <option value="examen">Examen</option>
                        <option value="cc">Contrôle Continu</option>
                        <option value="rattrapage">Rattrapage</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Module</label>
                    <select
                        value={exam.module}
                        onChange={(e) =>
                            setExam({
                                ...exam,
                                module: e.target.value,
                            })
                        }
                    >
                        <option value="">-- Sélectionner un module --</option>
                        {availableModules && availableModules.length > 0 ? (
                            availableModules.map((m) => (
                                <option key={m.id} value={m.name}>
                                    {m.name} {m.code ? `(${m.code})` : ''}
                                </option>
                            ))
                        ) : (
                            <option value="">Aucun module disponible</option>
                        )}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Enseignant</label>
                    <select
                        value={exam.teacherMatricule}
                        onChange={handleTeacherChange}
                    >
                        <option value="">-- Sélectionner un enseignant --</option>
                        {availableTeachers && availableTeachers.length > 0 ? (
                            availableTeachers.map((t) => (
                                <option key={t.id} value={t.matricule}>
                                    {t.name} ({t.matricule})
                                </option>
                            ))
                        ) : (
                            <option value="">Aucun enseignant disponible</option>
                        )}
                    </select>
                </div>

                <div className="form-group">
                    <label>Salle</label>
                    <select
                        value={exam.room}
                        onChange={(e) =>
                            setExam({
                                ...exam,
                                room: e.target.value,
                            })
                        }
                    >
                        <option value="">-- Sélectionner une salle --</option>
                        {availableRooms && availableRooms.length > 0 ? (
                            availableRooms.map((r) => (
                                <option key={r.id} value={r.name}>
                                    {r.name} {r.capacity ? `(${r.capacity})` : ''}
                                </option>
                            ))
                        ) : (
                            <option value="">Aucune salle disponible</option>
                        )}
                    </select>
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
};

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