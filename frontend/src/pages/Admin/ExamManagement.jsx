import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import ExamCalendar from "./ExamCalendar";
import "../../styles/exam-Management.css";
import ConvocationModal from "./ConvocationModal";
import NotifyTeacherModal from "./NotifyTeacherModal";

const ExamManagement = () => {
    const [showAddExamModal, setShowAddExamModal] = useState(false);
    const [showEditExamModal, setShowEditExamModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    // Data states
    const [exams, setExams] = useState([]);

    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedExamForConvocation, setSelectedExamForConvocation] =
        useState(null);
    const [selectedExamForNotification, setSelectedExamForNotification] =
        useState(null);

    const [availableRoomsNew, setAvailableRoomsNew] = useState([]);
    const [availableRoomsEdit, setAvailableRoomsEdit] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [modules, setModules] = useState([]);
    const [levels, setLevels] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [groups, setGroups] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [allRooms, setAllRooms] = useState([]);

    // Error states only
    const [conflictError, setConflictError] = useState(null);
    const [availableTeachers, setAvailableTeachers] = useState([]);

    // Filter states
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterTeacher, setFilterTeacher] = useState("");
    const [filterRoom, setFilterRoom] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;

    // View toggle state
    const [viewMode, setViewMode] = useState("table");

    const emptyExam = useMemo(
        () => ({
            type: "examen",
            module: "",
            teacher: "",
            room: "",
            specialite: "",
            niveau: "",
            group: "",
            semester: "",
            date: "",
            startTime: "",
            endTime: "",
        }),
        []
    );

    const [newExam, setNewExam] = useState(emptyExam);
    const [editExam, setEditExam] = useState(emptyExam);

    /* ================= INITIAL FETCH ================= */
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            await Promise.all([
                fetchExams(),
                fetchTeachers(),
                fetchModules(),
                fetchAcademicData(),
                fetchAllRooms(),
            ]);
        } catch (err) {
            console.error("Initial fetch error:", err);
            alert("Erreur lors du chargement des données");
        }
    };

    const fetchExams = async () => {
        try {
            const res = await api.get("/exams");
            if (res.data.success) {
                const allExams = [
                    ...res.data.exams.map((e) => ({ ...e, type: "examen" })),
                    ...res.data.ccs.map((e) => ({ ...e, type: "cc" })),
                    ...res.data.rattrapages.map((e) => ({
                        ...e,
                        type: "rattrapage",
                    })),
                ];
                setExams(allExams);
            }
        } catch (err) {
            console.error("Fetch exams error:", err);
            throw err;
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await api.get("/teachers");
            setTeachers(res.data.teachers || res.data.data || []);
        } catch (err) {
            console.error("Fetch teachers error:", err);
            setTeachers([]);
        }
    };

    const fetchModules = async () => {
        try {
            const res = await api.get("/modules");
            setModules(res.data.modules || res.data.data || []);
        } catch (err) {
            console.error("Fetch modules error:", err);
            setModules([]);
        }
    };

    const fetchAcademicData = async () => {
        try {
            const [levelsRes, specialtiesRes, groupsRes, semestersRes] =
                await Promise.all([
                    api.get("/levels"),
                    api.get("/specialties"),
                    api.get("/groups"),
                    api.get("/semesters"),
                ]);

            setLevels(levelsRes.data.levels || levelsRes.data.data || []);
            setSpecialties(
                specialtiesRes.data.specialties ||
                    specialtiesRes.data.data ||
                    []
            );
            setGroups(groupsRes.data.groups || groupsRes.data.data || []);
            setSemesters(
                semestersRes.data.semesters || semestersRes.data.data || []
            );
        } catch (err) {
            console.error("Fetch academic data error:", err);
            setLevels([]);
            setSpecialties([]);
            setGroups([]);
            setSemesters([]);
        }
    };

    const fetchAllRooms = async () => {
        try {
            const res = await api.get("/salles");
            const rooms = res.data.salles || res.data.data || [];
            setAllRooms(rooms);
            return rooms;
        } catch (err) {
            console.error("Fetch all rooms error:", err);
            setAllRooms([]);
            return [];
        }
    };

    /* ================= ROOM AVAILABILITY ================= */
    const fetchAvailableRoomsForNew = useCallback(async () => {
        if (!newExam.date || !newExam.startTime || !newExam.endTime) {
            setAvailableRoomsNew(allRooms);
            return;
        }

        try {
            const res = await api.get("/salles/available", {
                params: {
                    date: newExam.date,
                    start_time: newExam.startTime,
                    end_time: newExam.endTime,
                },
            });
            setAvailableRoomsNew(res.data.salles || res.data.data || []);
        } catch (err) {
            console.error("Fetch available rooms (new) error:", err);
            setAvailableRoomsNew(allRooms);
        }
    }, [newExam.date, newExam.startTime, newExam.endTime, allRooms]);

    const fetchAvailableRoomsForEdit = useCallback(async () => {
        if (
            !selectedExam ||
            !editExam.date ||
            !editExam.startTime ||
            !editExam.endTime
        ) {
            setAvailableRoomsEdit(allRooms);
            return;
        }

        try {
            const res = await api.get("/salles/available", {
                params: {
                    date: editExam.date,
                    start_time: editExam.startTime,
                    end_time: editExam.endTime,
                    exclude_exam_id: selectedExam.id,
                },
            });
            setAvailableRoomsEdit(res.data.salles || res.data.data || []);
        } catch (err) {
            console.error("Fetch available rooms (edit) error:", err);
            setAvailableRoomsEdit(allRooms);
        }
    }, [
        editExam.date,
        editExam.startTime,
        editExam.endTime,
        selectedExam,
        allRooms,
    ]);

    useEffect(() => {
        fetchAvailableRoomsForNew();
    }, [fetchAvailableRoomsForNew]);

    useEffect(() => {
        fetchAvailableRoomsForEdit();
    }, [fetchAvailableRoomsForEdit]);

    /* ================= AUTO ASSIGN TEACHER - FIXED ================= */
    const handleAutoAssignTeacher = useCallback(
        async (isEditMode) => {
            const exam = isEditMode ? editExam : newExam;

            // FIXED: Check for module selection
            if (!exam.module) {
                alert("⚠️ Veuillez d'abord sélectionner un module");
                return;
            }

            if (!exam.date || !exam.startTime || !exam.endTime) {
                alert(
                    "⚠️ Veuillez d'abord sélectionner la date et l'heure de l'examen"
                );
                return;
            }

            setConflictError(null);

            try {
                // FIXED: Include module in params
                const params = {
                    date: exam.date,
                    start_time: exam.startTime,
                    end_time: exam.endTime,
                    module: exam.module, // ADDED: Send module name
                };

                if (isEditMode && selectedExam) {
                    params.exclude_exam_id = selectedExam.id;
                }

                console.log(
                    "🔍 Fetching available teachers with params:",
                    params
                );

                const res = await api.get("/exams/available-teachers", {
                    params,
                });

                console.log("✅ Available teachers response:", res.data);

                if (res.data.success && res.data.available_teachers) {
                    const available = res.data.available_teachers;
                    setAvailableTeachers(available);

                    if (available.length > 0) {
                        const teacher = available[0];
                        if (isEditMode) {
                            setEditExam({ ...editExam, teacher: teacher.name });
                        } else {
                            setNewExam({ ...newExam, teacher: teacher.name });
                        }
                        alert(
                            `✅ Enseignant disponible trouvé : ${
                                teacher.name
                            }\n${
                                available.length - 1
                            } autre(s) enseignant(s) disponible(s).`
                        );
                    } else {
                        alert(
                            "❌ Aucun enseignant disponible pour ce créneau.\n\nTous les enseignants sont soit occupés, soit responsables de ce module."
                        );
                    }
                }
            } catch (err) {
                console.error("❌ Auto-assign error:", err);
                console.error("Error details:", err.response?.data);
                const message =
                    err?.response?.data?.message ||
                    "Erreur lors de la recherche d'enseignant disponible";
                alert(`❌ ${message}`);
                setConflictError(message);
            }
        },
        [newExam, editExam, selectedExam]
    );

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
            if (!newExam.teacher) {
                alert("Veuillez sélectionner un enseignant.");
                return;
            }

            const response = await api.post("/exams", {
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

            console.log("✅ Exam created successfully:", response.data);

            if (response.data.success) {
                alert("✅ Examen ajouté avec succès!");
                setShowAddExamModal(false);
                setNewExam(emptyExam);
                setAvailableTeachers([]);
                setConflictError(null);
                await fetchExams();
            }
        } catch (err) {
            console.error("Create error", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de la création de l'examen";
            alert(message);
            setConflictError(message);
        }
    };

    const handleEditClick = (exam) => {
        setSelectedExam(exam);
        setEditExam({
            type: exam.type,
            module: exam.module,
            teacher: exam.teacher,
            room: exam.room,
            specialite: exam.specialite || "",
            niveau: exam.niveau || "",
            group: exam.group || "",
            semester: exam.semester || "",
            date: exam.date,
            startTime: exam.start_time || exam.startTime,
            endTime: exam.end_time || exam.endTime,
        });
        setShowEditExamModal(true);
        setConflictError(null);
        setAvailableTeachers([]);
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
            if (!editExam.teacher) {
                alert("Veuillez sélectionner un enseignant.");
                return;
            }

            const response = await api.put(`/exams/${selectedExam.id}`, {
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

            console.log("✅ Exam updated successfully:", response.data);

            if (response.data.success) {
                alert("✅ Examen modifié avec succès!");
                setShowEditExamModal(false);
                setSelectedExam(null);
                setAvailableTeachers([]);
                setConflictError(null);
                await fetchExams();
            }
        } catch (err) {
            console.error("Update error", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de la modification de l'examen";
            alert(message);
            setConflictError(message);
        }
    };

    const handleDeleteExam = async () => {
        try {
            await api.delete(`/exams/${selectedExam.id}`);

            alert("Examen supprimé avec succès!");
            setShowDeleteConfirmModal(false);
            setSelectedExam(null);

            localStorage.setItem("examUpdate", Date.now().toString());
            await fetchExams();
        } catch (err) {
            console.error("Delete error", err);
            alert("Erreur lors de la suppression de l'examen");
        }
    };

    const handleNotify = async (exam) => {
        try {
            const response = await api.post(`/exams/${exam.id}/notify`);

            if (response.data.success) {
                alert(`📧 Notification envoyée à ${exam.teacher} avec succès!`);
            }
        } catch (err) {
            console.error("Notify error", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de l'envoi de la notification";
            alert(message);
        }
    };

    /* ================= FILTER & PAGINATION ================= */
    const filteredExams = useMemo(() => {
        return exams.filter((e) => {
            const matchesSearch =
                (e.module?.toLowerCase() || "").includes(
                    search.toLowerCase()
                ) ||
                (e.teacher?.toLowerCase() || "").includes(search.toLowerCase());

            const matchesType = filterType ? e.type === filterType : true;
            const matchesTeacher = filterTeacher
                ? e.teacher === filterTeacher
                : true;
            const matchesRoom = filterRoom ? e.room === filterRoom : true;

            return (
                matchesSearch && matchesType && matchesTeacher && matchesRoom
            );
        });
    }, [exams, search, filterType, filterTeacher, filterRoom]);

    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

    const paginatedExams = useMemo(() => {
        return filteredExams.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredExams, currentPage, itemsPerPage]);

    const examTypes = useMemo(
        () => ({
            examen: paginatedExams.filter((e) => e.type === "examen"),
            cc: paginatedExams.filter((e) => e.type === "cc"),
            rattrapage: paginatedExams.filter((e) => e.type === "rattrapage"),
        }),
        [paginatedExams]
    );

    return (
        <div className="exam-management">
            <div className="exam-header">
                <h1>📚 Planning des Examens</h1>
                <div style={{ display: "flex", gap: "10px" }}>
                    <div className="view-toggle">
                        <button
                            className={`view-toggle-btn ${
                                viewMode === "table" ? "active" : ""
                            }`}
                            onClick={() => setViewMode("table")}
                            title="Vue tableau"
                        >
                            📋 Tableau
                        </button>
                        <button
                            className={`view-toggle-btn ${
                                viewMode === "calendar" ? "active" : ""
                            }`}
                            onClick={() => setViewMode("calendar")}
                            title="Vue calendrier"
                        >
                            📅 Calendrier
                        </button>
                    </div>

                    <button
                        className="add-exam-btn"
                        onClick={() => setShowAddExamModal(true)}
                    >
                        <span>+</span> Ajouter un examen
                    </button>
                </div>
            </div>

            {viewMode === "calendar" ? (
                <ExamCalendar exams={filteredExams} />
            ) : (
                <>
                    <div className="filters-section">
                        <div className="filters">
                            <div className="filter-group">
                                <label>🔍 Recherche</label>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Module ou enseignant..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            <div className="filter-group">
                                <label>📋 Type</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">Tous les types</option>
                                    <option value="examen">Examen</option>
                                    <option value="cc">Contrôle Continu</option>
                                    <option value="rattrapage">
                                        Rattrapage
                                    </option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>👨‍🏫 Enseignant</label>
                                <select
                                    value={filterTeacher}
                                    onChange={(e) => {
                                        setFilterTeacher(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">
                                        Tous les enseignants
                                    </option>
                                    {teachers.map((t) => (
                                        <option
                                            key={t.id || t._id}
                                            value={t.name}
                                        >
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>🏫 Salle</label>
                                <select
                                    value={filterRoom}
                                    onChange={(e) => {
                                        setFilterRoom(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">Toutes les salles</option>
                                    {allRooms.map((r) => (
                                        <option
                                            key={r.id || r._id}
                                            value={r.name}
                                        >
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="exam-sections">
                        <Section
                            title={`📝 Examens (${
                                filteredExams.filter((e) => e.type === "examen")
                                    .length
                            })`}
                            data={examTypes.examen}
                            onEdit={handleEditClick}
                            onDelete={(e) => {
                                setSelectedExam(e);
                                setShowDeleteConfirmModal(true);
                            }}
                            onNotify={(exam) =>
                                setSelectedExamForNotification(exam)
                            }
                        />

                        <Section
                            title={`✏️ Contrôles Continus (${
                                filteredExams.filter((e) => e.type === "cc")
                                    .length
                            })`}
                            data={examTypes.cc}
                            onEdit={handleEditClick}
                            onDelete={(e) => {
                                setSelectedExam(e);
                                setShowDeleteConfirmModal(true);
                            }}
                            onNotify={(exam) =>
                                setSelectedExamForNotification(exam)
                            }
                        />

                        <Section
                            title={`🔄 Rattrapages (${
                                filteredExams.filter(
                                    (e) => e.type === "rattrapage"
                                ).length
                            })`}
                            data={examTypes.rattrapage}
                            onEdit={handleEditClick}
                            onDelete={(e) => {
                                setSelectedExam(e);
                                setShowDeleteConfirmModal(true);
                            }}
                            onNotify={(exam) =>
                                setSelectedExamForNotification(exam)
                            }
                        />

                        {selectedExamForConvocation && (
                            <ConvocationModal
                                exam={selectedExamForConvocation}
                                onClose={() =>
                                    setSelectedExamForConvocation(null)
                                }
                            />
                        )}
                        {selectedExamForNotification && (
                            <NotifyTeacherModal
                                exam={selectedExamForNotification}
                                onClose={() =>
                                    setSelectedExamForNotification(null)
                                }
                                onSuccess={() => {
                                    console.log(
                                        "Notification sent successfully!"
                                    );
                                }}
                            />
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn-secondary"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                ◀ Précédent
                            </button>
                            <span>
                                Page {currentPage} sur {totalPages}
                            </span>
                            <button
                                className="btn-secondary"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Suivant ▶
                            </button>
                        </div>
                    )}
                </>
            )}

            <AddExamModal
                isOpen={showAddExamModal}
                onClose={() => {
                    setShowAddExamModal(false);
                    setNewExam(emptyExam);
                    setConflictError(null);
                    setAvailableTeachers([]);
                }}
                newExam={newExam}
                setNewExam={setNewExam}
                availableRooms={availableRoomsNew}
                teachers={teachers}
                modules={modules}
                levels={levels}
                specialties={specialties}
                groups={groups}
                semesters={semesters}
                onSubmit={handleAddExam}
                onAutoAssign={() => handleAutoAssignTeacher(false)}
                conflictError={conflictError}
                availableTeachers={availableTeachers}
            />

            <EditExamModal
                isOpen={showEditExamModal}
                onClose={() => {
                    setShowEditExamModal(false);
                    setSelectedExam(null);
                    setConflictError(null);
                    setAvailableTeachers([]);
                }}
                editExam={editExam}
                setEditExam={setEditExam}
                availableRooms={availableRoomsEdit}
                teachers={teachers}
                modules={modules}
                levels={levels}
                specialties={specialties}
                groups={groups}
                semesters={semesters}
                onSubmit={handleUpdateExam}
                onAutoAssign={() => handleAutoAssignTeacher(true)}
                conflictError={conflictError}
                availableTeachers={availableTeachers}
            />

            <DeleteConfirmModal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                selectedExam={selectedExam}
                onConfirm={handleDeleteExam}
            />
        </div>
    );
};

/* ================= MODAL COMPONENTS ================= */
const AddExamModal = ({
    isOpen,
    onClose,
    newExam,
    setNewExam,
    availableRooms,
    teachers,
    modules,
    levels,
    specialties,
    groups,
    semesters,
    onSubmit,
    onAutoAssign,
    conflictError,
    availableTeachers,
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="➕ Ajouter un examen"
        size="large"
    >
        <ExamForm
            exam={newExam}
            setExam={setNewExam}
            rooms={availableRooms}
            teachers={teachers}
            modules={modules}
            levels={levels}
            specialties={specialties}
            groups={groups}
            semesters={semesters}
            onSubmit={onSubmit}
            onCancel={onClose}
            onAutoAssign={onAutoAssign}
            submitLabel="Enregistrer"
            conflictError={conflictError}
            mode="add"
            availableTeachers={availableTeachers}
        />
    </Modal>
);

const EditExamModal = ({
    isOpen,
    onClose,
    editExam,
    setEditExam,
    availableRooms,
    teachers,
    modules,
    levels,
    specialties,
    groups,
    semesters,
    onSubmit,
    onAutoAssign,
    conflictError,
    availableTeachers,
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="✏️ Modifier l'examen"
        size="large"
    >
        <ExamForm
            exam={editExam}
            setExam={setEditExam}
            rooms={availableRooms}
            teachers={teachers}
            modules={modules}
            levels={levels}
            specialties={specialties}
            groups={groups}
            semesters={semesters}
            onSubmit={onSubmit}
            onCancel={onClose}
            onAutoAssign={onAutoAssign}
            submitLabel="Modifier"
            conflictError={conflictError}
            mode="edit"
            availableTeachers={availableTeachers}
        />
    </Modal>
);

const DeleteConfirmModal = ({ isOpen, onClose, selectedExam, onConfirm }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="🗑️ Supprimer l'examen">
        <div className="delete-confirm-modal">
            <p>Êtes-vous sûr de vouloir supprimer cet examen ?</p>
            <p>
                <strong>Cette action est irréversible.</strong>
            </p>

            {selectedExam && (
                <div className="exam-details">
                    <p>
                        <strong>Module:</strong> {selectedExam.module}
                    </p>
                    <p>
                        <strong>Enseignant:</strong> {selectedExam.teacher}
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
                <button className="btn-secondary" onClick={onClose}>
                    Annuler
                </button>
                <button className="btn-primary delete-btn" onClick={onConfirm}>
                    Confirmer la suppression
                </button>
            </div>
        </div>
    </Modal>
);

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
    onAutoAssign,
    submitLabel,
    conflictError,
    availableTeachers = [],
}) => {
    const filteredGroups = useMemo(() => {
        return groups.filter((g) => {
            if (typeof g === "object") {
                return (
                    (!exam.niveau || g.level?.name === exam.niveau) &&
                    (!exam.specialite || g.specialty?.name === exam.specialite)
                );
            }
            return true;
        });
    }, [groups, exam.niveau, exam.specialite]);

    // FIXED: Check both module and time for auto-assign
    const canAutoAssign =
        exam.module && exam.date && exam.startTime && exam.endTime;

    return (
        <div className="add-exam-form">
            {conflictError && (
                <div className="conflict-alert">
                    <strong>⚠️ Conflit détecté :</strong> {conflictError}
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label>Type d'examen</label>
                    <select
                        value={exam.type}
                        onChange={(e) =>
                            setExam({ ...exam, type: e.target.value })
                        }
                    >
                        <option value="examen">Examen</option>
                        <option value="cc">Contrôle Continu</option>
                        <option value="rattrapage">Rattrapage</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Module *</label>
                    <select
                        value={exam.module}
                        onChange={(e) =>
                            setExam({ ...exam, module: e.target.value })
                        }
                        required
                    >
                        <option value="">Sélectionner un module</option>
                        {modules.map((m) => (
                            <option key={m.id || m._id} value={m.name}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Enseignant *</label>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-end",
                        }}
                    >
                        <select
                            value={exam.teacher}
                            onChange={(e) =>
                                setExam({ ...exam, teacher: e.target.value })
                            }
                            required
                            style={{ flex: 1 }}
                        >
                            <option value="">Sélectionner un enseignant</option>
                            {teachers.map((t) => (
                                <option key={t.id || t._id} value={t.name}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            className="auto-assign-btn"
                            onClick={onAutoAssign}
                            disabled={!canAutoAssign}
                            style={{ minWidth: "160px" }}
                        >
                            <span>⚡</span> Affectation auto
                        </button>
                    </div>

                    {availableTeachers.length > 0 && (
                        <div
                            style={{
                                marginTop: "8px",
                                padding: "8px",
                                background: "#f0f9ff",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                            }}
                        >
                            <strong>
                                Enseignants disponibles (
                                {availableTeachers.length}) :
                            </strong>
                            <div
                                style={{
                                    marginTop: "4px",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                }}
                            >
                                {availableTeachers
                                    .slice(0, 5)
                                    .map((teacher) => (
                                        <span
                                            key={teacher.id}
                                            style={{
                                                background: "#3b82f6",
                                                color: "white",
                                                padding: "2px 8px",
                                                borderRadius: "12px",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            {teacher.name}
                                        </span>
                                    ))}
                                {availableTeachers.length > 5 && (
                                    <span style={{ color: "#6b7280" }}>
                                        +{availableTeachers.length - 5} autres
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <small
                        style={{
                            color: "#6b7280",
                            fontSize: "0.8rem",
                            display: "block",
                            marginTop: "4px",
                        }}
                    >
                        {!exam.module
                            ? "⚠️ Sélectionnez d'abord un module"
                            : !canAutoAssign
                            ? "Sélectionnez la date et l'heure pour activer l'affectation automatique"
                            : "✅ Cliquez sur 'Affectation auto' pour trouver un enseignant disponible"}
                    </small>
                </div>

                <div className="form-group">
                    <label>Salle *</label>
                    <select
                        value={exam.room}
                        onChange={(e) =>
                            setExam({ ...exam, room: e.target.value })
                        }
                        required
                    >
                        <option value="">Sélectionner une salle</option>
                        {rooms.map((r) => (
                            <option key={r.id || r._id} value={r.name}>
                                {r.name}{" "}
                                {r.capacity ? `(${r.capacity} places)` : ""}
                            </option>
                        ))}
                    </select>
                    <small style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                        {rooms.length} salle(s) disponible(s) pour ce créneau
                    </small>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Spécialité</label>
                    <select
                        value={exam.specialite}
                        onChange={(e) =>
                            setExam({ ...exam, specialite: e.target.value })
                        }
                    >
                        <option value="">Sélectionner une spécialité</option>
                        {specialties.map((s, index) => (
                            <option
                                key={index}
                                value={typeof s === "object" ? s.name : s}
                            >
                                {typeof s === "object" ? s.name : s}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Niveau</label>
                    <select
                        value={exam.niveau}
                        onChange={(e) =>
                            setExam({ ...exam, niveau: e.target.value })
                        }
                    >
                        <option value="">Sélectionner un niveau</option>
                        {levels.map((l, index) => (
                            <option
                                key={index}
                                value={typeof l === "object" ? l.name : l}
                            >
                                {typeof l === "object" ? l.name : l}
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
                        <option value="">Sélectionner un groupe</option>
                        {filteredGroups.map((g, index) => (
                            <option
                                key={index}
                                value={typeof g === "object" ? g.name : g}
                            >
                                {typeof g === "object" ? g.name : g}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Semestre *</label>
                    <select
                        value={exam.semester}
                        onChange={(e) =>
                            setExam({ ...exam, semester: e.target.value })
                        }
                        required
                    >
                        <option value="">Sélectionner un semestre</option>
                        {semesters.map((s, index) => (
                            <option
                                key={index}
                                value={typeof s === "object" ? s.name : s}
                            >
                                {typeof s === "object" ? s.name : s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Date *</label>
                    <input
                        type="date"
                        value={exam.date}
                        onChange={(e) =>
                            setExam({ ...exam, date: e.target.value })
                        }
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Heure début *</label>
                    <input
                        type="time"
                        value={exam.startTime}
                        onChange={(e) =>
                            setExam({ ...exam, startTime: e.target.value })
                        }
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Heure fin *</label>
                    <input
                        type="time"
                        value={exam.endTime}
                        onChange={(e) =>
                            setExam({ ...exam, endTime: e.target.value })
                        }
                        required
                    />
                </div>
            </div>

            <div className="form-actions">
                <button
                    className="btn-secondary"
                    onClick={onCancel}
                    type="button"
                >
                    Annuler
                </button>
                <button
                    className="btn-primary"
                    onClick={onSubmit}
                    type="button"
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};

/* ================= TABLE COMPONENT ================= */
const Section = ({ title, data, onEdit, onDelete, onNotify }) => (
    <div className="exam-section">
        <h2>{title}</h2>

        <table className="exam-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Module</th>
                    <th>Enseignant</th>
                    <th>Salle</th>
                    <th>Spécialité</th>
                    <th>Niveau</th>
                    <th>Groupe</th>
                    <th>Semestre</th>
                    <th>Date</th>
                    <th>Heures</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan="11" className="empty">
                            <div className="empty-icon">🔭</div>
                            <p>Aucun examen trouvé</p>
                        </td>
                    </tr>
                ) : (
                    data.map((e) => (
                        <tr key={e.id}>
                            <td>
                                <span className={`type-badge badge-${e.type}`}>
                                    {e.type === "examen"
                                        ? "EX"
                                        : e.type === "cc"
                                        ? "CC"
                                        : "RAT"}
                                </span>
                            </td>
                            <td>
                                <strong>{e.module}</strong>
                            </td>
                            <td>{e.teacher}</td>
                            <td>
                                <span className="room-badge">{e.room}</span>
                            </td>
                            <td>{e.specialite}</td>
                            <td>{e.niveau}</td>
                            <td>{e.group}</td>
                            <td>{e.semester}</td>
                            <td>
                                {e.date
                                    ? new Date(e.date).toLocaleDateString(
                                          "fr-FR"
                                      )
                                    : "N/A"}
                            </td>
                            <td>
                                <span className="time-slot">
                                    {e.start_time || e.startTime} -{" "}
                                    {e.end_time || e.endTime}
                                </span>
                            </td>
                            <td className="actions">
                                <button
                                    className="btn-icon btn-edit"
                                    onClick={() => onEdit(e)}
                                    title="Modifier"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    onClick={() => onDelete(e)}
                                    title="Supprimer"
                                >
                                    🗑️
                                </button>
                                <button
                                    className="btn-icon btn-notify"
                                    onClick={() => onNotify(e)}
                                    title="Notifier l'enseignant"
                                >
                                    📧
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
