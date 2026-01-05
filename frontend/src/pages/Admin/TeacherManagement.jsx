import React, { useState, useEffect } from "react";
import Modal from "../UI/Modal";
import api from "../../api/axios";
import "../../styles/teacher-management.css";

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const [editingTeacher, setEditingTeacher] = useState(null);

    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);

    const [specialties, setSpecialties] = useState([]); // State for specialties
    const [academicYears, setAcademicYears] = useState([]); // NEW: State for academic years

    const [form, setForm] = useState({
        matricule: "",
        name: "",
        email: "",
        password: "",
        specialite: "",
        annee_scolaire: "",
    });

    /* ================= FETCH ================= */
    useEffect(() => {
        fetchTeachers();
    }, [search]);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await api.get("/specialties");
                setSpecialties(res.data.specialties);
            } catch (error) {
                console.error("Erreur de chargement des spécialités", error);
            }
        };
        fetchSpecialties();
    }, []);

    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                const res = await api.get("/academic-years");
                setAcademicYears(res.data.academic_years);
            } catch (error) {
                console.error(
                    "Erreur de chargement des années universitaires",
                    error
                );
            }
        };
        fetchAcademicYears();
    }, []); // NEW: Fetch academic years on component mount

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/teachers", { params: { search } });
            setTeachers(res.data.teachers);
        } catch (error) {
            console.error(error);
            alert("Erreur de chargement des enseignants");
        } finally {
            setLoading(false);
        }
    };

    /* ================= FORM ================= */
    const resetForm = () => {
        setForm({
            matricule: "",
            name: "",
            email: "",
            password: "",
            specialite: "",
            annee_scolaire: "",
        });
    };

    /* ================= ADD ================= */
    const handleAdd = async () => {
        try {
            await api.post("/teachers", {
                ...form,
                role: "teacher", // ✅ REQUIRED
            });

            alert("Enseignant ajouté");
            setShowAddModal(false);
            resetForm();
            fetchTeachers();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                    "Erreur lors de l'ajout de l'enseignant"
            );
        }
    };

    /* ================= EDIT ================= */
    const handleEditClick = (teacher) => {
        setEditingTeacher(teacher);
        setForm({
            matricule: teacher.matricule || "",
            name: teacher.name || "",
            email: teacher.email || "",
            password: "",
            specialite: teacher.specialite || "",
            annee_scolaire: teacher.annee_scolaire || "",
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        try {
            const data = { ...form };
            if (!data.password) delete data.password;

            await api.put(`/teachers/${editingTeacher.id}`, data);

            alert("Enseignant modifié");
            setShowEditModal(false);
            setEditingTeacher(null);
            resetForm();
            fetchTeachers();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                    "Erreur lors de la modification"
            );
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cet enseignant ?")) return;

        try {
            await api.delete(`/teachers/${id}`);
            fetchTeachers();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression");
        }
    };

    /* ================= CSV IMPORT ================= */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            alert("Veuillez sélectionner un fichier CSV");
            e.target.value = "";
            return;
        }

        setImportFile(file);
    };

    const handleImport = async () => {
        if (!importFile) {
            alert("Veuillez sélectionner un fichier CSV");
            return;
        }

        try {
            setImporting(true);
            const formData = new FormData();
            formData.append("file", importFile);

            const res = await api.post("/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert(res.data.message || "Import réussi");
            setShowImportModal(false);
            setImportFile(null);
            fetchTeachers();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message || "Erreur lors de l'importation"
            );
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const csv =
            "matricule;name;email;password;specialite;annee_scolaire\n" +
            "ENS001;Ahmed Ali;ahmed@edu.dz;password123;Informatique;2024-2025\n";

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "template_enseignants.csv";
        link.click();
    };

    /* ================= RENDER ================= */
    return (
        <div className="student-management">
            <div className="page-header">
                <h1>Gestion des Enseignants</h1>
                <div className="header-actions">
                    <input
                        placeholder="Recherche..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button onClick={() => setShowImportModal(true)}>
                        📁 Import CSV
                    </button>
                    <button onClick={() => setShowAddModal(true)}>
                        + Ajouter
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading">Chargement...</div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Matricule</th>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Spécialité</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t) => (
                            <tr key={t.id}>
                                <td>{t.matricule}</td>
                                <td>{t.name}</td>
                                <td>{t.email}</td>
                                <td>{t.specialite}</td>
                                <td>
                                    <button onClick={() => handleEditClick(t)}>
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDelete(t.id)}>
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* ADD MODAL */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    resetForm();
                }}
                title="Ajouter un Enseignant"
                size="lg"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Matricule *</label>
                            <input
                                value={form.matricule}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        matricule: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom *</label>
                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Mot de passe *</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Spécialité *</label>
                            <select
                                value={form.specialite}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        specialite: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Sélectionner une spécialité
                                </option>
                                {specialties.map((s) => (
                                    <option key={s.id} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Année Scolaire</label>
                            <select
                                value={form.annee_scolaire}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        annee_scolaire: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Sélectionner une année scolaire
                                </option>
                                {academicYears.map((y) => (
                                    <option key={y.id} value={y.name}>
                                        {y.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => setShowAddModal(false)}
                        >
                            Annuler
                        </button>
                        <button className="btn-primary" onClick={handleAdd}>
                            Ajouter
                        </button>
                    </div>
                </div>
            </Modal>

            {/* EDIT MODAL */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modifier un Enseignant"
                size="lg"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Matricule *</label>
                            <input
                                value={form.matricule}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        matricule: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom *</label>
                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                value={form.email}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Spécialité *</label>
                            <select
                                value={form.specialite}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        specialite: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Sélectionner une spécialité
                                </option>
                                {specialties.map((s) => (
                                    <option key={s.id} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Année Scolaire</label>
                            <select
                                value={form.annee_scolaire}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        annee_scolaire: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Sélectionner une année scolaire
                                </option>
                                {academicYears.map((y) => (
                                    <option key={y.id} value={y.name}>
                                        {y.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => setShowEditModal(false)}
                        >
                            Annuler
                        </button>
                        <button className="btn-primary" onClick={handleUpdate}>
                            Modifier
                        </button>
                    </div>
                </div>
            </Modal>

            {/* IMPORT MODAL */}
            <Modal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                title="Importer CSV"
            >
                <button onClick={downloadTemplate}>
                    📥 Télécharger modèle
                </button>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                <button
                    disabled={!importFile || importing}
                    onClick={handleImport}
                >
                    {importing ? "Import..." : "Importer"}
                </button>
            </Modal>
        </div>
    );
};

export default TeacherManagement;
