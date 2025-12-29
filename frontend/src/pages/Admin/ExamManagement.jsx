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
        specialite: "",
        niveau: "",
        group: "",
        semester: "", // ✅ Add this line
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
        const res = await api.get("/exams");
        setExams([
            ...res.data.exams.map((e) => ({ ...e, type: "examen" })),
            ...res.data.ccs.map((e) => ({ ...e, type: "cc" })),
            ...res.data.rattrapages.map((e) => ({ ...e, type: "rattrapage" })),
        ]);
    };

    const fetchTeachers = async () => {
        const res = await api.get("/teachers");
        setTeachers(res.data.teachers || []);
    };

    const fetchModules = async () => {
        const res = await api.get("/modules");
        setModules(res.data.modules || []);
    };

    const fetchAcademicData = async () => {
        const [l, s, g, se] = await Promise.all([
            api.get("/levels"),
            api.get("/specialties"),
            api.get("/groups"),
            api.get("/semesters"),
        ]);
        setLevels(l.data.levels || []);
        setSpecialties(s.data.specialties || []);
        setGroups(g.data.groups || []);
        setSemesters(se.data.semesters || []);
    };

    /* ================= ROOMS ================= */
    const fetchAvailableRooms = async (exam, setter, excludeId = null) => {
        try {
            const res = await api.get("/salles/available", {
                params: {
                    date: exam.date,
                    start_time: exam.startTime,
                    end_time: exam.endTime,
                    exclude_exam_id: excludeId,
                },
            });
            setter(res.data.salles || []);
        } catch {
            const res = await api.get("/salles");
            setter(res.data.salles || []);
        }
    };

    useEffect(() => {
        if (showAddExamModal)
            fetchAvailableRooms(newExam, setAvailableRoomsNew);
    }, [newExam, showAddExamModal]);

    useEffect(() => {
        if (showEditExamModal && selectedExam)
            fetchAvailableRooms(
                editExam,
                setAvailableRoomsEdit,
                selectedExam.id
            );
    }, [editExam, showEditExamModal, selectedExam]);

    /* ================= CRUD ================= */
    const handleAddExam = async () => {
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
            semester: newExam.semester, // ✅ Add this line
        });
        setShowAddExamModal(false);
        setNewExam(emptyExam);
        fetchExams();
    };

    const handleUpdateExam = async () => {
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
            semester: editExam.semester, // ✅ Add this line
        });
        setShowEditExamModal(false);
        setSelectedExam(null);
        fetchExams();
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
            semester: exam.semester,
            date: exam.date,
            startTime: exam.start_time,
            endTime: exam.end_time,
        });
        setShowEditExamModal(true);
    };
    const handleDeleteExam = async () => {
        await api.delete(`/exams/${selectedExam.id}`);
        setShowDeleteConfirmModal(false);
        setSelectedExam(null);
        fetchExams();
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

            {/* ADD */}
            <Modal
                isOpen={showAddExamModal}
                onClose={() => setShowAddExamModal(false)}
                title="Ajouter"
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
                    onCancel={() => setShowAddExamModal(false)}
                    submitLabel="Enregistrer"
                />
            </Modal>

            {/* EDIT */}
            <Modal
                isOpen={showEditExamModal}
                onClose={() => setShowEditExamModal(false)}
                title="Modifier"
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

            {/* DELETE */}
            <Modal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                title="Supprimer"
            >
                <button onClick={handleDeleteExam}>Confirmer</button>
            </Modal>
        </div>
    );
};

/* ================= FORM ================= */
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
                    <option value="cc">CC</option>
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
                            {r.name}
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
                            group: "",
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
                            group: "",
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
                                g.level.name === exam.niveau &&
                                g.specialty.name === exam.specialite
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

/* ================= TABLE ================= */
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
