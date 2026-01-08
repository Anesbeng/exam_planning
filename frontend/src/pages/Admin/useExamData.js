import { useState, useCallback } from "react";
import api from "../../api/axios";

/**
 * Custom hook for managing exam-related API calls
 */
export const useExamData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /* ================= FETCH OPERATIONS ================= */
    const fetchExams = useCallback(async () => {
        try {
            const res = await api.get("/exams");
            if (res.data.success) {
                return [
                    ...res.data.exams.map((e) => ({ ...e, type: "examen" })),
                    ...res.data.ccs.map((e) => ({ ...e, type: "cc" })),
                    ...res.data.rattrapages.map((e) => ({
                        ...e,
                        type: "rattrapage",
                    })),
                ];
            }
            return [];
        } catch (err) {
            console.error("Fetch exams error:", err);
            throw err;
        }
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            const res = await api.get("/teachers");
            return res.data.teachers || res.data.data || [];
        } catch (err) {
            console.error("Fetch teachers error:", err);
            return [];
        }
    }, []);

    const fetchModules = useCallback(async () => {
        try {
            const res = await api.get("/modules");
            return res.data.modules || res.data.data || [];
        } catch (err) {
            console.error("Fetch modules error:", err);
            return [];
        }
    }, []);

    const fetchAcademicData = useCallback(async () => {
        try {
            const [levelsRes, specialtiesRes, groupsRes, semestersRes] =
                await Promise.all([
                    api.get("/levels"),
                    api.get("/specialties"),
                    api.get("/groups"),
                    api.get("/semesters"),
                ]);

            return {
                levels: levelsRes.data.levels || levelsRes.data.data || [],
                specialties:
                    specialtiesRes.data.specialties ||
                    specialtiesRes.data.data ||
                    [],
                groups: groupsRes.data.groups || groupsRes.data.data || [],
                semesters:
                    semestersRes.data.semesters || semestersRes.data.data || [],
            };
        } catch (err) {
            console.error("Fetch academic data error:", err);
            return {
                levels: [],
                specialties: [],
                groups: [],
                semesters: [],
            };
        }
    }, []);

    const fetchAllRooms = useCallback(async () => {
        try {
            const res = await api.get("/salles");
            return res.data.salles || res.data.data || [];
        } catch (err) {
            console.error("Fetch all rooms error:", err);
            return [];
        }
    }, []);

    const fetchAvailableRooms = useCallback(
        async (date, startTime, endTime, excludeExamId = null) => {
            if (!date || !startTime || !endTime) {
                return null;
            }

            try {
                const params = {
                    date,
                    start_time: startTime,
                    end_time: endTime,
                };

                if (excludeExamId) {
                    params.exclude_exam_id = excludeExamId;
                }

                const res = await api.get("/salles/available", { params });
                return res.data.salles || res.data.data || [];
            } catch (err) {
                console.error("Fetch available rooms error:", err);
                return null;
            }
        },
        []
    );

    const fetchAvailableTeachers = useCallback(
        async (date, startTime, endTime, module, excludeExamId = null) => {
            try {
                const params = {
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    module,
                };

                if (excludeExamId) {
                    params.exclude_exam_id = excludeExamId;
                }

                const res = await api.get("/exams/available-teachers", {
                    params,
                });

                if (res.data.success && res.data.available_teachers) {
                    return res.data.available_teachers;
                }
                return [];
            } catch (err) {
                console.error("Fetch available teachers error:", err);
                throw err;
            }
        },
        []
    );

    /* ================= CREATE/UPDATE/DELETE OPERATIONS ================= */
    const createExam = useCallback(async (examData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post("/exams", {
                type: examData.type,
                module: examData.module,
                teacher: examData.teacher,
                room: examData.room,
                specialite: examData.specialite,
                niveau: examData.niveau,
                group: examData.group,
                date: examData.date,
                start_time: examData.startTime,
                end_time: examData.endTime,
                semester: examData.semester,
            });

            return response.data;
        } catch (err) {
            console.error("Create exam error:", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de la création de l'examen";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateExam = useCallback(async (examId, examData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.put(`/exams/${examId}`, {
                type: examData.type,
                module: examData.module,
                teacher: examData.teacher,
                room: examData.room,
                specialite: examData.specialite,
                niveau: examData.niveau,
                group: examData.group,
                date: examData.date,
                start_time: examData.startTime,
                end_time: examData.endTime,
                semester: examData.semester,
            });

            return response.data;
        } catch (err) {
            console.error("Update exam error:", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de la modification de l'examen";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteExam = useCallback(async (examId) => {
        try {
            setLoading(true);
            setError(null);

            await api.delete(`/exams/${examId}`);
            localStorage.setItem("examUpdate", Date.now().toString());

            return true;
        } catch (err) {
            console.error("Delete exam error:", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de la suppression de l'examen";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const notifyTeacher = useCallback(async (examId) => {
        try {
            const response = await api.post(`/exams/${examId}/notify`);
            return response.data;
        } catch (err) {
            console.error("Notify teacher error:", err);
            const message =
                err?.response?.data?.message ||
                "Erreur lors de l'envoi de la notification";
            throw new Error(message);
        }
    }, []);

    return {
        loading,
        error,
        fetchExams,
        fetchTeachers,
        fetchModules,
        fetchAcademicData,
        fetchAllRooms,
        fetchAvailableRooms,
        fetchAvailableTeachers,
        createExam,
        updateExam,
        deleteExam,
        notifyTeacher,
    };
};

export default useExamData;
