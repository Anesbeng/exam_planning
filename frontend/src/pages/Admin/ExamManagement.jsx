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

    const [availableRoomsNew, setAvailableRoomsNew] = useState([]);
    const [availableRoomsEdit, setAvailableRoomsEdit] = useState([]);

    const [teachers, setTeachers] = useState([]);
    const [modules, setModules] = useState([]);
    const [levels, setLevels] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [groups, setGroups] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const emptyExam = {
        type: "examen",
        module: "",
        teacher: "",
        room: "",
        specialite: "informatique",
        niveau: "",
        group: "",
        semester: "",
        date: "",
        startTime: "",
        endTime: "",
    };

    const [newExam, setNewExam] = useState(emptyExam);
    const [editExam, setEditExam] = useState(emptyExam);

    /* ================= FETCH DATA ================= */
    useEffect(() => {
        fetchExams();
        fetchTeachers();
        fetchModules();
        fetchAcademicData();
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
            console.error("Fetch exams error:", err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await api.get("/teachers");
            setTeachers(res.data.teachers || []);
        } catch (err) {
            console.error("Fetch teachers error:", err);
            setTeachers([]);
        }
    };

    const fetchModules = async () => {
        try {
            const res = await api.get("/modules");
            setModules(res.data.modules || []);
        } catch (err) {
            console.error("Fetch modules error:", err);
            setModules([]);
        }
    };

    const fetchAcademicData = async () => {
        try {
            // Fetch levels, specialties, groups, and semesters
            const [levelsRes, specialtiesRes, groupsRes, semestersRes] =
                await Promise.all([
                    api.get("/levels"),
                    api.get("/specialties"),
                    api.get("/groups"),
                    api.get("/semesters"),
                ]);

            setLevels(levelsRes.data.levels || []);
            setSpecialties(specialtiesRes.data.specialties || []);
            setGroups(groupsRes.data.groups || []);
            setSemesters(semestersRes.data.semesters || []);
        } catch (err) {
            console.error("Fetch academic data error:", err);
            // Fallback values
            setLevels(["L1", "L2", "L3", "M1", "M2"]);
            setSpecialties([
                "informatique",
                "mathematiques",
                "physique",
                "chimie",
            ]);
            setGroups(["G1", "G2", "G3", "G4"]);
            setSemesters([
                { id: 1, name: "S1" },
                { id: 2, name: "S2" },
                { id: 3, name: "S3" },
                { id: 4, name: "S4" },
                { id: 5, name: "S5" },
                { id: 6, name: "S6" },
            ]);
        }
    };

    /* ================= ROOMS ================= */
    const fetchAllRooms = async () => {
        try {
            const res = await api.get("/salles");
            return res.data.salles || [];
        } catch (err) {
            console.error("Fetch all rooms error:", err);
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
        if (newExam.date && newExam.startTime && newExam.endTime) {
            fetchAvailableRoomsForNew();
        }
        if (showAddExamModal) {
            fetchTeachers();
            fetchModules();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newExam.date, newExam.startTime, newExam.endTime, showAddExamModal]);

    const fetchAvailableRoomsForEdit = async () => {
        if (!selectedExam) return;

        try {
            const res = await api.get("/salles/available", {
                params: {
                    date: editExam.date,
                    start_time: editExam.startTime,
                    end_time: editExam.endTime,
                    exclude_exam_id: selectedExam.id,
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
        if (
            selectedExam &&
            editExam.date &&
            editExam.startTime &&
            editExam.endTime
        ) {
            fetchAvailableRoomsForEdit();
        }
        if (showEditExamModal) {
            fetchTeachers();
            fetchModules();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        editExam.date,
        editExam.startTime,
        editExam.endTime,
        selectedExam,
        showEditExamModal,
    ]);

    /* ================= CRUD ================= */
    const handleAddExam = async () => {
        try {
            if (!newExam.module) {
                alert("Veuillez sélectionner un module pour cet examen.");
                return;
            }
            if (!newExam.room) {
                alert(
                    "Veuillez sélectionner une salle disponible pour cet examen."
                );
                return;
            }
            if (!newExam.semester) {
                alert("Veuillez sélectionner un semestre.");
                return;
            }

            await api.post("/exams", {
                type: newExam.type,
                module: newExam.module,
                teacher: newExam.teacher,
                room: newExam.room,
                specialite: newExam.specialite,
                niveau: newExam.niveau,
                group: newExam.group,
                date: newExam.date,
                start_time: newExam.startTime,
                end_time: newExam.endTime,
                semester: newExam.semester,
            });

            setShowAddExamModal(false);
            setNewExam(emptyExam);
            fetchExams();

            // Notify other tabs (teachers) that exams changed
            localStorage.setItem("examUpdate", Date.now().toString());
            alert("Examen ajouté avec succès!");
        } catch (err) {
            console.error("Create error", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de la création de l'examen";
            alert(message);
        }
    };

    const handleEditClick = (exam) => {
        setSelectedExam(exam);
        setEditExam({
            type: exam.type,
            module: exam.module,
            teacher: exam.teacher,
            room: exam.room,
            specialite: exam.specialite,
            niveau: exam.niveau,
            group: exam.group,
            semester: exam.semester || "",
            date: exam.date,
            startTime: exam.start_time,
            endTime: exam.end_time,
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
                alert(
                    "Veuillez sélectionner une salle disponible pour cet examen."
                );
                return;
            }
            if (!editExam.semester) {
                alert("Veuillez sélectionner un semestre.");
                return;
            }

            await api.put(`/exams/${selectedExam.id}`, {
                type: editExam.type,
                module: editExam.module,
                teacher: editExam.teacher,
                room: editExam.room,
                specialite: editExam.specialite,
                niveau: editExam.niveau,
                group: editExam.group,
                date: editExam.date,
                start_time: editExam.startTime,
                end_time: editExam.endTime,
                semester: editExam.semester,
            });

            setShowEditExamModal(false);
            setSelectedExam(null);
            fetchExams();

            localStorage.setItem("examUpdate", Date.now().toString());
            alert("Examen modifié avec succès!");
        } catch (err) {
            console.error("Update error", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de la modification de l'examen";
            alert(message);
        }
    };

    const handleDeleteExam = async () => {
        try {
            await api.delete(`/exams/${selectedExam.id}`);
            setShowDeleteConfirmModal(false);
            setSelectedExam(null);
            fetchExams();

            localStorage.setItem("examUpdate", Date.now().toString());
            alert("Examen supprimé avec succès!");
        } catch (err) {
            console.error("Delete error", err);
            alert("Erreur lors de la suppression de l'examen");
        }
    };

    const examTypes = {
        examen: exams.filter((e) => e.type === "examen"),
        cc: exams.filter((e) => e.type === "cc"),
        rattrapage: exams.filter((e) => e.type === "rattrapage"),
    };

    return (
        <div className="exam-management">
            <h1>Planning des Examens</h1>

            <button onClick={() => setShowAddExamModal(true)}>
                + Ajouter un examen
            </button>

            <Section
                title="Examens"
                data={examTypes.examen}
                onEdit={handleEditClick}
                onDelete={(e) => {
                    setSelectedExam(e);
                    setShowDeleteConfirmModal(true);
                }}
            />
            <Section
                title="CC"
                data={examTypes.cc}
                onEdit={handleEditClick}
                onDelete={(e) => {
                    setSelectedExam(e);
                    setShowDeleteConfirmModal(true);
                }}
            />
            <Section
                title="Rattrapage"
                data={examTypes.rattrapage}
                onEdit={handleEditClick}
                onDelete={(e) => {
                    setSelectedExam(e);
                    setShowDeleteConfirmModal(true);
                }}
            />

            {/* ADD MODAL */}
            <Modal
                isOpen={showAddExamModal}
                onClose={() => setShowAddExamModal(false)}
                title="Ajouter un examen"
            >
                <ExamForm
                    exam={newExam}
                    setExam={setNewExam}
                    rooms={availableRoomsNew}
                    teachers={teachers}
                    modules={modules}
                    levels={levels}
                    specialties={specialties}
                    groups={groups}
                    semesters={semesters}
                    onSubmit={handleAddExam}
                    onCancel={() => {
                        setShowAddExamModal(false);
                        setNewExam(emptyExam);
                    }}
                    submitLabel="Enregistrer"
                />
            </Modal>

            {/* EDIT MODAL */}
            <Modal
                isOpen={showEditExamModal}
                onClose={() => setShowEditExamModal(false)}
                title="Modifier l'examen"
            >
                <ExamForm
                    exam={editExam}
                    setExam={setEditExam}
                    rooms={availableRoomsEdit}
                    teachers={teachers}
                    modules={modules}
                    levels={levels}
                    specialties={specialties}
                    groups={groups}
                    semesters={semesters}
                    onSubmit={handleUpdateExam}
                    onCancel={() => setShowEditExamModal(false)}
                    submitLabel="Modifier"
                />
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                title="Supprimer l'examen"
            >
                <div className="delete-confirm-modal">
                    <p>Êtes-vous sûr de vouloir supprimer cet examen ?</p>
                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => setShowDeleteConfirmModal(false)}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleDeleteExam}
                        >
                            Confirmer la suppression
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

/* ================= FORM COMPONENT ================= */
const ExamForm = ({
    exam,
    setExam,
    rooms,
    teachers,
    modules,
    levels,
    specialties,
    groups,
    semesters,
    onSubmit,
    onCancel,
    submitLabel,
}) => (
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
                        setExam({ ...exam, module: e.target.value })
                    }
                >
                    <option value="">Choisir un module</option>
                    {modules.map((m) => (
                        <option key={m.id} value={m.name}>
                            {m.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Enseignant</label>
                <select
                    value={exam.teacher}
                    onChange={(e) =>
                        setExam({ ...exam, teacher: e.target.value })
                    }
                >
                    <option value="">Choisir un enseignant</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.name}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Salle</label>
                <select
                    value={exam.room}
                    onChange={(e) => setExam({ ...exam, room: e.target.value })}
                >
                    <option value="">Salle disponible</option>
                    {rooms.map((r) => (
                        <option key={r.id} value={r.name}>
                            {r.name}{" "}
                            {r.capacity ? `(${r.capacity} places)` : ""}
                        </option>
                    ))}
                </select>
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
                    <option value="">Spécialité</option>
                    {specialties.map((s) => (
                        <option key={s.id} value={s.name}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Niveau</label>
                <select
                    value={exam.niveau}
                    onChange={(e) =>
                        setExam({
                            ...exam,
                            niveau: e.target.value,
                        })
                    }
                >
                    <option value="">Niveau</option>
                    {levels.map((l) => (
                        <option key={l.id} value={l.name}>
                            {l.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Groupe</label>
                <select
                    value={exam.group}
                    onChange={(e) =>
                        setExam({ ...exam, group: e.target.value })
                    }
                >
                    <option value="">Groupe</option>
                    {groups
                        .filter(
                            (g) =>
                                g.level?.name === exam.niveau &&
                                g.specialty?.name === exam.specialite
                        )
                        .map((g) => (
                            <option key={g.id} value={g.name}>
                                {g.name}
                            </option>
                        ))}
                </select>
            </div>

            <div className="form-group">
                <label>Semestre</label>
                <select
                    value={exam.semester}
                    onChange={(e) =>
                        setExam({ ...exam, semester: e.target.value })
                    }
                >
                    <option value="">Semestre</option>
                    {semesters.map((s) => (
                        <option key={s.id} value={s.name}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Date</label>
                <input
                    type="date"
                    value={exam.date}
                    onChange={(e) => setExam({ ...exam, date: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Heure début</label>
                <input
                    type="time"
                    value={exam.startTime}
                    onChange={(e) =>
                        setExam({ ...exam, startTime: e.target.value })
                    }
                />
            </div>

            <div className="form-group">
                <label>Heure fin</label>
                <input
                    type="time"
                    value={exam.endTime}
                    onChange={(e) =>
                        setExam({ ...exam, endTime: e.target.value })
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

/* ================= TABLE COMPONENT ================= */
const Section = ({ title, data, onEdit, onDelete }) => (
    <div className="exam-section">
        <h2>{title}</h2>
        <table className="exam-table">
            <thead>
                <tr>
                    <th>Module</th>
                    <th>Enseignant</th>
                    <th>Salle</th>
                    <th>Spécialité</th>
                    <th>Niveau</th>
                    <th>Groupe</th>
                    <th>Semestre</th>
                    <th>Date</th>
                    <th>Heure début</th>
                    <th>Heure fin</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan="11" className="empty">
                            Aucun examen
                        </td>
                    </tr>
                ) : (
                    data.map((e) => (
                        <tr key={e.id}>
                            <td>{e.module}</td>
                            <td>{e.teacher}</td>
                            <td>{e.room}</td>
                            <td>{e.specialite}</td>
                            <td>{e.niveau}</td>
                            <td>{e.group}</td>
                            <td>{e.semester}</td>
                            <td>{e.date}</td>
                            <td>{e.start_time || e.startTime}</td>
                            <td>{e.end_time || e.endTime}</td>
                            <td className="actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => onEdit(e)}
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(e)}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

export default ExamManagement;
