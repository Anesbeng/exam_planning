import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import ExamCalendar from "./ExamCalendar";
import ConvocationModal from "./ConvocationModal";
import NotifyTeacherModal from "./NotifyTeacherModal";
import { ExamForm, Section } from "./ExamComponents";
import "../../styles/exam-Management.css";

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

    const [conflictError, setConflictError] = useState(null);
    const [availableTeachers, setAvailableTeachers] = useState([]);

    // Filter states
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterTeacher, setFilterTeacher] = useState("");
    const [filterRoom, setFilterRoom] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;

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

    /* ================= AUTO ASSIGN TEACHER ================= */
    const handleAutoAssignTeacher = useCallback(
        async (isEditMode) => {
            const exam = isEditMode ? editExam : newExam;

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
                const params = {
                    date: exam.date,
                    start_time: exam.startTime,
                    end_time: exam.endTime,
                    module: exam.module,
                };

                if (isEditMode && selectedExam) {
                    params.exclude_exam_id = selectedExam.id;
                }

                const res = await api.get("/exams/available-teachers", {
                    params,
                });

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
            if (
                !newExam.module ||
                !newExam.room ||
                !newExam.semester ||
                !newExam.teacher
            ) {
                alert("Veuillez remplir tous les champs obligatoires.");
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
            if (
                !editExam.module ||
                !editExam.room ||
                !editExam.semester ||
                !editExam.teacher
            ) {
                alert("Veuillez remplir tous les champs obligatoires.");
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
                                onSuccess={() =>
                                    console.log(
                                        "Notification sent successfully!"
                                    )
                                }
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

            {/* Modals */}
            <Modal
                isOpen={showAddExamModal}
                onClose={() => {
                    setShowAddExamModal(false);
                    setNewExam(emptyExam);
                    setConflictError(null);
                    setAvailableTeachers([]);
                }}
                title="➕ Ajouter un examen"
                size="large"
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
                    onAutoAssign={() => handleAutoAssignTeacher(false)}
                    submitLabel="Enregistrer"
                    conflictError={conflictError}
                    availableTeachers={availableTeachers}
                />
            </Modal>

            <Modal
                isOpen={showEditExamModal}
                onClose={() => {
                    setShowEditExamModal(false);
                    setSelectedExam(null);
                    setConflictError(null);
                    setAvailableTeachers([]);
                }}
                title="✏️ Modifier l'examen"
                size="large"
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
                    onAutoAssign={() => handleAutoAssignTeacher(true)}
                    submitLabel="Modifier"
                    conflictError={conflictError}
                    availableTeachers={availableTeachers}
                />
            </Modal>

            <Modal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                title="🗑️ Supprimer l'examen"
            >
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
                                <strong>Enseignant:</strong>{" "}
                                {selectedExam.teacher}
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
                            onClick={() => setShowDeleteConfirmModal(false)}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary delete-btn"
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

export default ExamManagement;
