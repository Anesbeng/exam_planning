import React, { useState, useEffect } from "react";
import Modal from "../UI/Modal";
import api from "../../api/axios";

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Teacher to edit
    const [editTeacher, setEditTeacher] = useState(null);

    // Search
    const [search, setSearch] = useState("");

    // Import state
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);

    // Form state
    const [newTeacher, setNewTeacher] = useState({
        matricule: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        specialite: "",
        niveau: "",
        annee_scolaire: "",
        groupe: "",
        status: "Actif",
    });

    // Fetch teachers
    const fetchTeachers = async () => {
        try {
            const res = await api.get("/teachers", { params: { search } });
            setTeachers(res.data.teachers || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, [search]);

    // Reset form
    const resetForm = () => {
        setNewTeacher({
            matricule: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            specialite: "",
            niveau: "",
            annee_scolaire: "",
            groupe: "",
            status: "Actif",
        });
    };

    // Add teacher
    const handleAddTeacher = async () => {
        try {
            const res = await api.post("/teachers", {
                ...newTeacher,
                name: newTeacher.lastName,
            });
            setTeachers([...teachers, res.data.teacher]);
            setShowAddModal(false);
            resetForm();
        } catch (err) {
            console.error(err);
        }
    };

    // Edit teacher
    const handleEditTeacher = (teacher) => {
        setEditTeacher(teacher);
        setNewTeacher({
            matricule: teacher.matricule,
            firstName: teacher.firstName || "",
            lastName: teacher.name || "",
            email: teacher.email,
            password: "",
            specialite: teacher.specialite || "",
            niveau: teacher.niveau || "",
            annee_scolaire: teacher.annee_scolaire || "",
            groupe: teacher.groupe || "",
            status: teacher.status || "Actif",
        });
        setShowEditModal(true);
    };

    const handleUpdateTeacher = async () => {
        try {
            const payload = {
                ...newTeacher,
                name: newTeacher.lastName,
                password: newTeacher.password || undefined,
            };
            const res = await api.put(`/teachers/${editTeacher.id}`, payload);
            setTeachers(
                teachers.map((t) =>
                    t.id === editTeacher.id ? res.data.teacher : t
                )
            );
            setShowEditModal(false);
            resetForm();
        } catch (err) {
            console.error(err);
        }
    };

    // Delete teacher
    const handleDeleteTeacher = async (id) => {
        if (!window.confirm("Voulez-vous supprimer cet enseignant ?")) return;
        try {
            await api.delete(`/teachers/${id}`);
            setTeachers(teachers.filter((t) => t.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    // Import CSV
    const handleImport = async () => {
        if (!importFile) return;
        setImporting(true);
        try {
            // Simulate import
            alert(`Enseignants importés depuis ${importFile.name}`);
            setShowImportModal(false);
            setImportFile(null);
        } catch (err) {
            console.error(err);
        } finally {
            setImporting(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="teacher-management">
            <div className="page-header">
                <h1>Gestion des Enseignants</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Recherche..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className="btn-secondary"
                        onClick={() => setShowImportModal(true)}
                    >
                        📁 Importer
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Ajouter Enseignant
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Matricule</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Spécialité</th>
                            <th>Niveau</th>
                            <th>Groupe</th>
                            <th>Année Scolaire</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher) => (
                            <tr key={teacher.id}>
                                <td>{teacher.id}</td>
                                <td>{teacher.matricule}</td>
                                <td>{teacher.name}</td>
                                <td>{teacher.firstName}</td>
                                <td>{teacher.email}</td>
                                <td>{teacher.specialite}</td>
                                <td>{teacher.niveau}</td>
                                <td>{teacher.groupe}</td>
                                <td>{teacher.annee_scolaire}</td>
                                <td>
                                    <span
                                        className={`status ${
                                            teacher.status === "Actif"
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {teacher.status}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() =>
                                            handleEditTeacher(teacher)
                                        }
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() =>
                                            handleDeleteTeacher(teacher.id)
                                        }
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal || showEditModal}
                onClose={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                }}
                title={
                    showAddModal
                        ? "Ajouter un Enseignant"
                        : "Modifier Enseignant"
                }
            >
                <TeacherForm
                    newTeacher={newTeacher}
                    setNewTeacher={setNewTeacher}
                    onSubmit={
                        showAddModal ? handleAddTeacher : handleUpdateTeacher
                    }
                    onCancel={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        resetForm();
                    }}
                    isAdd={showAddModal}
                />
            </Modal>

            {/* Import Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                }}
                title="Importer des Enseignants"
            >
                <div className="import-container">
                    <div className="form-group">
                        <label>Sélectionner un fichier CSV *</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setImportFile(e.target.files[0])}
                            disabled={importing}
                        />
                        {importFile && (
                            <p>Fichier sélectionné: {importFile.name}</p>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowImportModal(false);
                                setImportFile(null);
                            }}
                            disabled={importing}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleImport}
                            disabled={!importFile || importing}
                        >
                            {importing ? "Importation..." : "Importer"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Teacher Form
const TeacherForm = ({
    newTeacher,
    setNewTeacher,
    onSubmit,
    onCancel,
    isAdd,
}) => (
    <div className="form">
        <div className="form-row">
            <div className="form-group">
                <label>Matricule *</label>
                <input
                    type="text"
                    value={newTeacher.matricule}
                    onChange={(e) =>
                        setNewTeacher({
                            ...newTeacher,
                            matricule: e.target.value,
                        })
                    }
                />
            </div>
            <div className="form-group">
                <label>Prénom *</label>
                <input
                    type="text"
                    value={newTeacher.firstName}
                    onChange={(e) =>
                        setNewTeacher({
                            ...newTeacher,
                            firstName: e.target.value,
                        })
                    }
                />
            </div>
            <div className="form-group">
                <label>Nom *</label>
                <input
                    type="text"
                    value={newTeacher.lastName}
                    onChange={(e) =>
                        setNewTeacher({
                            ...newTeacher,
                            lastName: e.target.value,
                        })
                    }
                />
            </div>
        </div>

        <div className="form-group">
            <label>Email *</label>
            <input
                type="email"
                value={newTeacher.email}
                onChange={(e) =>
                    setNewTeacher({ ...newTeacher, email: e.target.value })
                }
            />
        </div>

        <div className="form-group">
            <label>Password {isAdd ? "*" : "(laisser vide si inchangé)"}</label>
            <input
                type="password"
                value={newTeacher.password}
                onChange={(e) =>
                    setNewTeacher({ ...newTeacher, password: e.target.value })
                }
            />
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Spécialité</label>
                <input
                    type="text"
                    value={newTeacher.specialite}
                    onChange={(e) =>
                        setNewTeacher({
                            ...newTeacher,
                            specialite: e.target.value,
                        })
                    }
                />
            </div>
            <div className="form-group">
                <label>Niveau</label>
                <input
                    type="text"
                    value={newTeacher.niveau}
                    onChange={(e) =>
                        setNewTeacher({ ...newTeacher, niveau: e.target.value })
                    }
                />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Groupe</label>
                <input
                    type="text"
                    value={newTeacher.groupe}
                    onChange={(e) =>
                        setNewTeacher({ ...newTeacher, groupe: e.target.value })
                    }
                />
            </div>
            <div className="form-group">
                <label>Année Scolaire</label>
                <input
                    type="text"
                    value={newTeacher.annee_scolaire}
                    onChange={(e) =>
                        setNewTeacher({
                            ...newTeacher,
                            annee_scolaire: e.target.value,
                        })
                    }
                />
            </div>
        </div>

        <div className="form-group">
            <label>Statut</label>
            <select
                value={newTeacher.status}
                onChange={(e) =>
                    setNewTeacher({ ...newTeacher, status: e.target.value })
                }
            >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
            </select>
        </div>

        <div className="form-actions">
            <button className="btn-secondary" onClick={onCancel}>
                Annuler
            </button>
            <button className="btn-primary" onClick={onSubmit}>
                Enregistrer
            </button>
        </div>
    </div>
);

export default TeacherManagement;
