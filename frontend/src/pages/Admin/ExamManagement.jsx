import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import "./exam-Management.css";
import ExamCalendar from "./ExamCalendar";
import ConvocationModal from "./ConvocationModal";
import NotifyTeacherModal from "./NotifyTeacherModal";

const ExamManagement = () => {
    // Modal states
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

    // Loading states
    const [loading, setLoading] = useState(false);
    const [autoAssignLoading, setAutoAssignLoading] = useState(false);
    const [conflictError, setConflictError] = useState(null);
    const [availableTeachers, setAvailableTeachers] = useState([]);

    // Filter states
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterTeacher, setFilterTeacher] = useState("");
    const [filterRoom, setFilterRoom] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const emptyExam = useMemo(() => ({
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
    }), []);

    const [newExam, setNewExam] = useState(emptyExam);
    const [editExam, setEditExam] = useState(emptyExam);

    /* ================= INITIAL FETCH ================= */
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const fetchExams = async () => {
        try {
            const res = await api.get("/exams");
            if (res.data.success) {
                const allExams = [
                    ...res.data.exams.map((e) => ({ ...e, type: "examen" })),
                    ...res.data.ccs.map((e) => ({ ...e, type: "cc" })),
                    ...res.data.rattrapages.map((e) => ({ ...e, type: "rattrapage" })),
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
            const [levelsRes, specialtiesRes, groupsRes, semestersRes] = await Promise.all([
                api.get("/levels"),
                api.get("/specialties"),
                api.get("/groups"),
                api.get("/semesters"),
            ]);

            setLevels(levelsRes.data.levels || levelsRes.data.data || []);
            setSpecialties(specialtiesRes.data.specialties || specialtiesRes.data.data || []);
            setGroups(groupsRes.data.groups || groupsRes.data.data || []);
            setSemesters(semestersRes.data.semesters || semestersRes.data.data || []);
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
    useEffect(() => {
        if (newExam.date && newExam.startTime && newExam.endTime) {
            fetchAvailableRoomsForNew();
        } else {
            setAvailableRoomsNew(allRooms);
        }
    }, [newExam.date, newExam.startTime, newExam.endTime, allRooms]);

    useEffect(() => {
        if (selectedExam && editExam.date && editExam.startTime && editExam.endTime) {
            fetchAvailableRoomsForEdit();
        } else if (selectedExam) {
            setAvailableRoomsEdit(allRooms);
        }
    }, [editExam.date, editExam.startTime, editExam.endTime, selectedExam, allRooms]);

    const fetchAvailableRoomsForNew = async () => {
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
    };

    useEffect(() => {
        if (newExam.date && newExam.startTime && newExam.endTime) {
            fetchAvailableRoomsForNew();
        }
        if (showAddExamModal) {
            fetchTeachers();
            fetchModules();
        }
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
            setAvailableRoomsEdit(res.data.salles || res.data.data || []);
        } catch (err) {
            console.error("Fetch available rooms (edit) error:", err);
            setAvailableRoomsEdit(allRooms);
        }
    };

    /* ================= AUTO ASSIGN TEACHER ================= */
    const handleAutoAssignTeacher = async (isEdit = false) => {
        const examData = isEdit ? editExam : newExam;
        
        if (!examData.date || !examData.startTime || !examData.endTime) {
            alert("⚠️ Veuillez d'abord sélectionner la date et l'heure de l'examen.");
            return;
        }

        setAutoAssignLoading(true);
        setConflictError(null);

        if (showEditExamModal) {
            fetchTeachers();
            fetchModules();
        }
    }, [
        editExam.date,
        editExam.startTime,
        editExam.endTime,
        selectedExam,
        showEditExamModal,
    ]);

    /* ================= CRUD ================= */
    const checkTimeOverlap = (start1, end1, start2, end2) => {
        return start1 < end2 && start2 < end1;
    };

    const handleAddExam = async () => {
        try {
            const payload = {
                date: examData.date,
                start_time: examData.startTime,
                end_time: examData.endTime,
            };

            if (isEdit && examData.teacher) {
                payload.exclude_teacher = examData.teacher;
            }

            const response = await api.post("/exams/auto-assign", payload);
            
            if (response.data.success && response.data.teacher) {
                if (isEdit) {
                    setEditExam(prev => ({ ...prev, teacher: response.data.teacher }));
                } else {
                    setNewExam(prev => ({ ...prev, teacher: response.data.teacher }));
                }
                
                alert(`✅ Enseignant affecté: ${response.data.teacher}`);
            } else {
                alert(response.data.message || "❌ Aucun enseignant disponible");
            }
        } catch (err) {
            console.error("Auto assign error:", err);
            const errorMessage = err.response?.data?.message || "❌ Erreur lors de l'affectation automatique";
            alert(errorMessage);
        } finally {
            setAutoAssignLoading(false);
        }
    };

    /* ================= GET AVAILABLE TEACHERS ================= */
    const fetchAvailableTeachersForSlot = async (examData, isEdit = false) => {
        try {
            const params = {
                date: examData.date,
                start_time: examData.startTime,
                end_time: examData.endTime,
            };

            if (isEdit && examData.teacher) {
                params.exclude_teacher = examData.teacher;
            }

            const response = await api.get("/exams/available-teachers", { params });
            
            if (response.data.success) {
                setAvailableTeachers(response.data.available_teachers || []);
            if (!availableRoomsNew.some(r => r.name === newExam.room)) {
                alert("Erreur : La salle sélectionnée n'est pas disponible pour cette date et heure.");
                return;
            }
            if (!newExam.semester) {
                alert("Veuillez sélectionner un semestre.");
                return;
            }
        } catch (err) {
            console.error("Fetch available teachers error:", err);
            setAvailableTeachers([]);
        }
    };

    // Fetch available teachers when time changes
    useEffect(() => {
        if (newExam.date && newExam.startTime && newExam.endTime) {
            const timer = setTimeout(() => {
                fetchAvailableTeachersForSlot(newExam, false);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setAvailableTeachers([]);
        }
    }, [newExam.date, newExam.startTime, newExam.endTime]);

    useEffect(() => {
        if (selectedExam && editExam.date && editExam.startTime && editExam.endTime) {
            const timer = setTimeout(() => {
                fetchAvailableTeachersForSlot(editExam, true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [editExam.date, editExam.startTime, editExam.endTime, selectedExam]);

    /* ================= CRUD OPERATIONS ================= */
    const validateExam = (examData) => {
        const errors = [];
        
        if (!examData.module) errors.push("Module");
        if (!examData.teacher) errors.push("Enseignant");
        if (!examData.room) errors.push("Salle");
        if (!examData.semester) errors.push("Semestre");
        if (!examData.date) errors.push("Date");
        if (!examData.startTime) errors.push("Heure de début");
        if (!examData.endTime) errors.push("Heure de fin");
        
        if (errors.length > 0) {
            alert("⚠️ Champs obligatoires manquants : " + errors.join(", "));
            return false;
        }
        
        if (examData.startTime >= examData.endTime) {
            alert("⚠️ L'heure de fin doit être après l'heure de début");
            return false;
        }
        
        return true;
    };

    const handleAddExam = async () => {
        if (!validateExam(newExam)) return;

        try {
            setLoading(true);
            setConflictError(null);

            const selectedModule = modules.find(m => m.name === newExam.module);
            if (selectedModule && selectedModule.teacher_name === newExam.teacher) {
                alert("Erreur : Le responsable du module ne peut pas être le surveillant.");
                return;
            }

            const teacherExamsOnDate = exams.filter(
                e => e.teacher === newExam.teacher && e.date === newExam.date
            );

            const hasConflict = teacherExamsOnDate.some(e => 
                checkTimeOverlap(
                    newExam.startTime,
                    newExam.endTime,
                    e.start_time || e.startTime,
                    e.end_time || e.endTime
                )
            );

            if (hasConflict) {
                alert("Erreur : L'enseignant a déjà un examen prévu à cette heure. Veuillez choisir une autre heure ou un autre enseignant.");
                return;
            }

            // Backend automatically creates notification
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
                await fetchExams();
            }
        } catch (err) {
            console.error("Add exam error:", err);
            const errorMessage = err.response?.data?.message || "❌ Erreur lors de l'ajout de l'examen";
            setConflictError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
            console.log("✅ Exam created successfully:", response.data);

            setShowAddExamModal(false);
            setNewExam(emptyExam);
            fetchExams();

            // Notify other tabs (teachers) that exams changed
            localStorage.setItem("examUpdate", Date.now().toString());
            alert("Examen ajouté avec succès!");
        } catch (err) {
            console.error("❌ Create error:", err);
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
        if (!validateExam(editExam)) return;

        try {
            setLoading(true);
            setConflictError(null);

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
            if (!availableRoomsEdit.some(r => r.name === editExam.room)) {
                alert("Erreur : La salle sélectionnée n'est pas disponible pour cette date et heure.");
                return;
            }
            if (!editExam.semester) {
                alert("Veuillez sélectionner un semestre.");
                return;
            }

            const selectedModule = modules.find(m => m.name === editExam.module);
            if (selectedModule && selectedModule.teacher_name === editExam.teacher) {
                alert("Erreur : Le responsable du module ne peut pas être le surveillant.");
                return;
            }

            const teacherExamsOnDate = exams.filter(
                e => 
                    e.teacher === editExam.teacher && 
                    e.date === editExam.date && 
                    e.id !== selectedExam.id
            );

            const hasConflict = teacherExamsOnDate.some(e => 
                checkTimeOverlap(
                    editExam.startTime,
                    editExam.endTime,
                    e.start_time || e.startTime,
                    e.end_time || e.endTime
                )
            );

            if (hasConflict) {
                alert("Erreur : L'enseignant a déjà un examen prévu à cette heure. Veuillez choisir une autre heure ou un autre enseignant.");
                return;
            }

            // Backend automatically creates notification
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
                await fetchExams();
            }
        } catch (err) {
            console.error("Update error:", err);
            const errorMessage = err.response?.data?.message || "❌ Erreur lors de la modification";
            setConflictError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
            console.log("✅ Exam updated successfully:", response.data);

            setShowEditExamModal(false);
            setSelectedExam(null);
            fetchExams();

            localStorage.setItem("examUpdate", Date.now().toString());
            alert("Examen modifié avec succès!");
        } catch (err) {
            console.error("❌ Update error:", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de la modification de l'examen";
            alert(message);
        }
    };

    const handleDeleteExam = async () => {
        try {
            // Backend automatically creates notification before deletion
            const response = await api.delete(`/exams/${selectedExam.id}`);
            
            console.log("✅ Exam deleted successfully:", response.data);

            setShowDeleteConfirmModal(false);
            setSelectedExam(null);
            fetchExams();

            localStorage.setItem("examUpdate", Date.now().toString());
            alert("Examen supprimé avec succès!");
        } catch (err) {
            console.error("❌ Delete error:", err);
            alert("Erreur lors de la suppression de l'examen");
        }
    };

    /* ================= FILTER & PAGINATION ================= */
    const filteredExams = useMemo(() => {
        return exams.filter((e) => {
            const matchesSearch =
                (e.module?.toLowerCase() || '').includes(search.toLowerCase()) ||
                (e.teacher?.toLowerCase() || '').includes(search.toLowerCase());

            const matchesType = filterType ? e.type === filterType : true;
            const matchesTeacher = filterTeacher ? e.teacher === filterTeacher : true;
            const matchesRoom = filterRoom ? e.room === filterRoom : true;

            return matchesSearch && matchesType && matchesTeacher && matchesRoom;
        });
    }, [exams, search, filterType, filterTeacher, filterRoom]);

    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

    const paginatedExams = useMemo(() => {
        return filteredExams.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredExams, currentPage, itemsPerPage]);

    const examTypes = useMemo(() => ({
        examen: paginatedExams.filter((e) => e.type === "examen"),
        cc: paginatedExams.filter((e) => e.type === "cc"),
        rattrapage: paginatedExams.filter((e) => e.type === "rattrapage"),
    }), [paginatedExams]);

    return (
        <div className="exam-management">
            {(loading || autoAssignLoading) && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                    <div style={{ marginTop: '10px', color: '#3b82f6' }}>
                        {autoAssignLoading ? "Recherche d'enseignant disponible..." : "Chargement..."}
                    </div>
                </div>
            )}

            <div className="exam-header">
                <h1>📚 Planning des Examens</h1>
                <button 
                    className="add-exam-btn"
                    onClick={() => setShowAddExamModal(true)}
                    disabled={loading}
                >
                    <span>+</span> Ajouter un examen
                </button>
            </div>

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
                            disabled={loading}
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
                            disabled={loading}
                        >
                            <option value="">Tous les types</option>
                            <option value="examen">Examen</option>
                            <option value="cc">Contrôle Continu</option>
                            <option value="rattrapage">Rattrapage</option>
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
                            disabled={loading}
                        >
                            <option value="">Tous les enseignants</option>
                            {teachers.map(t => (
                                <option key={t.id || t._id} value={t.name}>
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
                            disabled={loading}
                        >
                            <option value="">Toutes les salles</option>
                            {allRooms.map(r => (
                                <option key={r.id || r._id} value={r.name}>
                                    {r.name} {r.capacity ? `(${r.capacity} places)` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <Section
                title={`📝 Examens (${filteredExams.filter(e => e.type === "examen").length})`}
                data={examTypes.examen}
                onEdit={handleEditClick}
                onDelete={(e) => {
                    setSelectedExam(e);
                    setShowDeleteConfirmModal(true);
                }}
                loading={loading}
            />
            
                onConvocation={(exam) => setSelectedExamForConvocation(exam)}
                onNotify={(exam) => setSelectedExamForNotification(exam)} // ← ADD THIS LINE
            />

            <Section
                title={`✏️ Contrôles Continus (${filteredExams.filter(e => e.type === "cc").length})`}
                data={examTypes.cc}
                onEdit={handleEditClick}
                onDelete={(e) => {
                    setSelectedExam(e);
                    setShowDeleteConfirmModal(true);
                }}
                loading={loading}
            />
            
                onNotify={(exam) => setSelectedExamForNotification(exam)} // ← ADD THIS LINE
            />

            <Section
                title={`🔄 Rattrapages (${filteredExams.filter(e => e.type === "rattrapage").length})`}
                data={examTypes.rattrapage}
                onEdit={handleEditClick}
                onDelete={(e) => {
                    setSelectedExam(e);
                    setShowDeleteConfirmModal(true);
                }}
                loading={loading}
                onNotify={(exam) => setSelectedExamForNotification(exam)} // ← ADD THIS LINE
            />
            {selectedExamForConvocation && (
                <ConvocationModal
                    exam={selectedExamForConvocation}
                    onClose={() => setSelectedExamForConvocation(null)}
                />
            )}
            {selectedExamForNotification && (
                <NotifyTeacherModal
                    exam={selectedExamForNotification}
                    onClose={() => setSelectedExamForNotification(null)}
                    onSuccess={() => {
                        console.log("Notification sent successfully!");
                    }}
                />
            )}

            {filteredExams.length > 0 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loading}
                    >
                        ◀ Précédent
                    </button>
                    
                    <span className="pagination-info">
                        Page {currentPage} sur {totalPages} • {filteredExams.length} examens
                    </span>
                    
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0 || loading}
                    >
                        Suivant ▶
                    </button>
                </div>
            )}

            <ExamCalendar exams={exams} />

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
                loading={loading}
                autoAssignLoading={autoAssignLoading}
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
                loading={loading}
                autoAssignLoading={autoAssignLoading}
                conflictError={conflictError}
                availableTeachers={availableTeachers}
            />

            <DeleteConfirmModal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                selectedExam={selectedExam}
                onConfirm={handleDeleteExam}
                loading={loading}
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
    loading,
    autoAssignLoading,
    conflictError,
    availableTeachers
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
            loading={loading}
            autoAssignLoading={autoAssignLoading}
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
    loading,
    autoAssignLoading,
    conflictError,
    availableTeachers
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
            loading={loading}
            autoAssignLoading={autoAssignLoading}
            conflictError={conflictError}
            mode="edit"
            availableTeachers={availableTeachers}
        />
    </Modal>
);

const DeleteConfirmModal = ({ isOpen, onClose, selectedExam, onConfirm, loading }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="🗑️ Supprimer l'examen"
    >
        <div className="delete-confirm-modal">
            <p>Êtes-vous sûr de vouloir supprimer cet examen ?</p>
            <p><strong>Cette action est irréversible.</strong></p>
            
            {selectedExam && (
                <div className="exam-details">
                    <p><strong>Module:</strong> {selectedExam.module}</p>
                    <p><strong>Enseignant:</strong> {selectedExam.teacher}</p>
                    <p><strong>Date:</strong> {selectedExam.date}</p>
                    <p><strong>Salle:</strong> {selectedExam.room}</p>
                </div>
            )}
            
            <div className="form-actions">
                <button
                    className="btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                >
                    Annuler
                </button>
                <button
                    className="btn-primary delete-btn"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? 'Suppression...' : 'Confirmer la suppression'}
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
    loading,
    autoAssignLoading,
    conflictError,
    mode,
    availableTeachers = []
}) => {
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            if (typeof g === 'object') {
                return (!exam.niveau || g.level?.name === exam.niveau) && 
                       (!exam.specialite || g.specialty?.name === exam.specialite);
            }
            return true;
        });
    }, [groups, exam.niveau, exam.specialite]);

    const canAutoAssign = exam.date && exam.startTime && exam.endTime;

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
                        onChange={(e) => setExam({ ...exam, type: e.target.value })}
                        disabled={loading}
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
                        onChange={(e) => setExam({ ...exam, module: e.target.value })}
                        disabled={loading}
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <select
                            value={exam.teacher}
                            onChange={(e) => setExam({ ...exam, teacher: e.target.value })}
                            disabled={loading}
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
                            disabled={loading || autoAssignLoading || !canAutoAssign}
                            style={{ minWidth: '160px' }}
                        >
                            {autoAssignLoading ? (
                                <span>Recherche...</span>
                            ) : (
                                <>
                                    <span>⚡</span> Affectation auto
                                </>
                            )}
                        </button>
                    </div>
                    
                    {availableTeachers.length > 0 && (
                        <div style={{ 
                            marginTop: '8px', 
                            padding: '8px', 
                            background: '#f0f9ff', 
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                        }}>
                            <strong>Enseignants disponibles ({availableTeachers.length}) :</strong>
                            <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {availableTeachers.slice(0, 5).map(teacher => (
                                    <span key={teacher.id} style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {teacher.name}
                                    </span>
                                ))}
                                {availableTeachers.length > 5 && (
                                    <span style={{ color: '#6b7280' }}>
                                        +{availableTeachers.length - 5} autres
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <small style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                        {canAutoAssign ? 
                            "Cliquez sur 'Affectation auto' pour trouver un enseignant disponible" : 
                            "Sélectionnez d'abord la date et l'heure pour activer l'affectation automatique"}
                    </small>
                </div>

                <div className="form-group">
                    <label>Salle *</label>
                    <select
                        value={exam.room}
                        onChange={(e) => setExam({ ...exam, room: e.target.value })}
                        disabled={loading}
                        required
                    >
                        <option value="">Sélectionner une salle</option>
                        {rooms.map((r) => (
                            <option key={r.id || r._id} value={r.name}>
                                {r.name} {r.capacity ? `(${r.capacity} places)` : ''}
                            </option>
                        ))}
                    </select>
                    <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        {rooms.length} salle(s) disponible(s) pour ce créneau
                    </small>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Spécialité</label>
                    <select
                        value={exam.specialite}
                        onChange={(e) => setExam({ ...exam, specialite: e.target.value })}
                        disabled={loading}
                    >
                        <option value="">Sélectionner une spécialité</option>
                        {specialties.map((s, index) => (
                            <option key={index} value={typeof s === 'object' ? s.name : s}>
                                {typeof s === 'object' ? s.name : s}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Niveau</label>
                    <select
                        value={exam.niveau}
                        onChange={(e) => setExam({ ...exam, niveau: e.target.value })}
                        disabled={loading}
                    >
                        <option value="">Sélectionner un niveau</option>
                        {levels.map((l, index) => (
                            <option key={index} value={typeof l === 'object' ? l.name : l}>
                                {typeof l === 'object' ? l.name : l}
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
                        onChange={(e) => setExam({ ...exam, group: e.target.value })}
                        disabled={loading}
                    >
                        <option value="">Sélectionner un groupe</option>
                        {filteredGroups.map((g, index) => (
                            <option key={index} value={typeof g === 'object' ? g.name : g}>
                                {typeof g === 'object' ? g.name : g}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Semestre *</label>
                    <select
                        value={exam.semester}
                        onChange={(e) => setExam({ ...exam, semester: e.target.value })}
                        disabled={loading}
                        required
                    >
                        <option value="">Sélectionner un semestre</option>
                        {semesters.map((s, index) => (
                            <option key={index} value={typeof s === 'object' ? s.name : s}>
                                {typeof s === 'object' ? s.name : s}
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
                        onChange={(e) => setExam({ ...exam, date: e.target.value })}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Heure début *</label>
                    <input
                        type="time"
                        value={exam.startTime}
                        onChange={(e) => setExam({ ...exam, startTime: e.target.value })}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Heure fin *</label>
                    <input
                        type="time"
                        value={exam.endTime}
                        onChange={(e) => setExam({ ...exam, endTime: e.target.value })}
                        disabled={loading}
                        required
                    />
                </div>
            </div>

            <div className="form-actions">
                <button 
                    className="btn-secondary" 
                    onClick={onCancel}
                    disabled={loading}
                    type="button"
                >
                    Annuler
                </button>
                <button 
                    className="btn-primary" 
                    onClick={onSubmit}
                    disabled={loading}
                    type="button"
                >
                    {loading ? 'Traitement...' : submitLabel}
                </button>
            </div>
        </div>
    );
};

/* ================= TABLE COMPONENT ================= */
const Section = ({
    title,
    data,
    onEdit,
    onDelete,
    loading , 
    onConvocation,
    onNotify,

}) => (
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
                            <div className="empty-icon">📭</div>
                            <p>Aucun examen trouvé</p>
                        </td>
                    </tr>
                ) : (
                    data.map((e) => (
                        <tr key={e.id}>
                            <td>
                                <span className={`type-badge badge-${e.type}`}>
                                    {e.type === 'examen' ? 'EX' : e.type === 'cc' ? 'CC' : 'RAT'}
                                </span>
                            </td>
                            <td><strong>{e.module}</strong></td>
                            <td>{e.teacher}</td>
                            <td>
                                <span className="room-badge">
                                    {e.room}
                                </span>
                            </td>
                            <td>{e.specialite}</td>
                            <td>{e.niveau}</td>
                            <td>{e.group}</td>
                            <td>{e.semester}</td>
                            <td>{e.date ? new Date(e.date).toLocaleDateString('fr-FR') : 'N/A'}</td>
                            <td>
                                <span className="time-slot">
                                    {e.start_time || e.startTime} - {e.end_time || e.endTime}
                                </span>
                            </td>
                            <td className="actions">
                                <button
                                    className="btn-icon btn-edit"
                                    onClick={() => onEdit(e)}
                                    disabled={loading}
                                    title="Modifier"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    onClick={() => onDelete(e)}
                                    disabled={loading}
                                    title="Supprimer"
                                >
                                    🗑️
                                </button>
                                {/* ← ADD THIS BUTTON */}
                                <button
                                    className="btn-notify"
                                    onClick={() => onNotify(e)}
                                    title="Notifier l'enseignant"
                                >
                                    📧 Notifier
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