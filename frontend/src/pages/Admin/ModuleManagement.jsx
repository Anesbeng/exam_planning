import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import "./ModuleManagement.css";

const ModuleManagement = () => {
    const [modules, setModules] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [teachers, setTeachers] = useState([]);

    const [newModule, setNewModule] = useState({
        code: "",
        name: "",
        semester: "",
        teacher_responsible: "",
    });

    const [editModule, setEditModule] = useState({
        code: "",
        name: "",
        semester: "",
        teacher_responsible: "",
    });

    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);

    /* ================= FETCH MODULES ================= */
    useEffect(() => {
        fetchModules();
        fetchTeachers();
    }, []);

    const fetchModules = async () => {
        try {
            const res = await api.get("/modules");
            setModules(res.data.modules);
        } catch (err) {
            console.error("Fetch modules error:", err);
            alert("Erreur lors du chargement des modules");
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await api.get("/modules/create");
            setTeachers(res.data.teachers || []);
        } catch (err) {
            console.error("Fetch teachers error:", err);
            try {
                const res = await api.get("/teachers");
                setTeachers(res.data.teachers || []);
            } catch (err2) {
                console.error("Fetch teachers fallback error:", err2);
                setTeachers([]);
            }
        }
    };

    /* ================= HELPER FUNCTION ================= */
    // Get teacher name by matricule for display
    const getTeacherName = (matricule) => {
        const teacher = teachers.find((t) => t.matricule === matricule);
        return teacher ? teacher.name : matricule;
    };

    /* ================= ADD MODULE ================= */
    const handleAddClick = () => {
        setShowAddModal(true);
    };

    const handleAddModule = async () => {
        if (
            !newModule.name ||
            !newModule.code ||
            !newModule.semester ||
            !newModule.teacher_responsible
        ) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            await api.post("/modules", {
                name: newModule.name,
                code: newModule.code,
                semester: newModule.semester,
                teacher_responsible: newModule.teacher_responsible, // Send matricule
            });

            setShowAddModal(false);
            resetNewForm();
            fetchModules();
            alert("Module créé avec succès!");
        } catch (err) {
            console.error("Create module error:", err);
            alert(
                err.response?.data?.message ||
                    "Erreur lors de la création du module"
            );
        }
    };

    /* ================= EDIT MODULE ================= */
    const handleEditClick = (module) => {
        setSelectedModule(module);
        setEditModule({
            code: module.code,
            name: module.name,
            semester: module.semester,
            teacher_responsible: module.teacher_responsible, // This is matricule
        });
        setShowEditModal(true);
    };

    const handleUpdateModule = async () => {
        if (
            !editModule.name ||
            !editModule.code ||
            !editModule.semester ||
            !editModule.teacher_responsible
        ) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            await api.put(`/modules/${selectedModule.id}`, {
                name: editModule.name,
                code: editModule.code,
                semester: editModule.semester,
                teacher_responsible: editModule.teacher_responsible, // Send matricule
            });

            setShowEditModal(false);
            setSelectedModule(null);
            fetchModules();
            alert("Module modifié avec succès!");
        } catch (err) {
            console.error("Update module error:", err);
            alert(
                err.response?.data?.message ||
                    "Erreur lors de la modification du module"
            );
        }
    };

    /* ================= DELETE MODULE ================= */
    const handleDeleteClick = (module) => {
        setSelectedModule(module);
        setShowDeleteModal(true);
    };

    const handleDeleteModule = async () => {
        try {
            await api.delete(`/modules/${selectedModule.id}`);
            setShowDeleteModal(false);
            setSelectedModule(null);
            fetchModules();
            alert("Module supprimé avec succès!");
        } catch (err) {
            console.error("Delete module error:", err);
            alert("Erreur lors de la suppression du module");
        }
    };

    /* ================= IMPORT MODULES ================= */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = [
                "text/csv",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ];
            if (
                !validTypes.includes(file.type) &&
                !file.name.match(/\.(csv|xlsx|xls)$/)
            ) {
                alert("Format de fichier invalide. Utilisez CSV, XLS ou XLSX");
                return;
            }
            setImportFile(file);
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            alert("Veuillez sélectionner un fichier");
            return;
        }

        setImporting(true);
        const formData = new FormData();
        formData.append("file", importFile);

        try {
            const res = await api.post("/modules/import", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowImportModal(false);
            setImportFile(null);
            fetchModules();

            let message = res.data.message;
            if (res.data.errors && res.data.errors.length > 0) {
                message += "\n\nErreurs:\n" + res.data.errors.join("\n");
            }
            alert(message);
        } catch (err) {
            console.error("Import error:", err);
            alert(
                "Erreur lors de l'import: " +
                    (err.response?.data?.error || err.message)
            );
        } finally {
            setImporting(false);
        }
    };

    /* ================= RESET FORMS ================= */
    const resetNewForm = () => {
        setNewModule({
            code: "",
            name: "",
            semester: "",
            teacher_responsible: "",
        });
    };

    return (
        <div className="module-management">
            <div className="page-header">
                <h1>Gestion des Modules</h1>
                <div className="header-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => setShowImportModal(true)}
                    >
                        📁 Importer
                    </button>
                    <button className="btn-primary" onClick={handleAddClick}>
                        + Ajouter Module
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Nom du Module</th>
                            <th>Semestre</th>
                            <th>Enseignant Responsable</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modules.length > 0 ? (
                            modules.map((module) => (
                                <tr key={module.id}>
                                    <td>{module.code}</td>
                                    <td>{module.name}</td>
                                    <td>{module.semester}</td>
                                    <td>
                                        {/* Display teacher name if available, otherwise matricule */}
                                        {module.teacher_name ||
                                            module.teacher_responsible}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() =>
                                                    handleEditClick(module)
                                                }
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() =>
                                                    handleDeleteClick(module)
                                                }
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
                                <td colSpan="5" className="no-data">
                                    Aucun module disponible
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= ADD MODULE MODAL ================= */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    resetNewForm();
                }}
                title="Ajouter un Module"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Code du Module *</label>
                            <input
                                type="text"
                                value={newModule.code}
                                onChange={(e) =>
                                    setNewModule({
                                        ...newModule,
                                        code: e.target.value,
                                    })
                                }
                                placeholder="MATH101"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom du Module *</label>
                            <input
                                type="text"
                                value={newModule.name}
                                onChange={(e) =>
                                    setNewModule({
                                        ...newModule,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Mathématiques Fondamentales"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Semestre *</label>
                            <select
                                value={newModule.semester}
                                onChange={(e) =>
                                    setNewModule({
                                        ...newModule,
                                        semester: e.target.value,
                                    })
                                }
                            >
                                <option value="">Sélectionner</option>
                                <option value="S1">Semestre 1</option>
                                <option value="S2">Semestre 2</option>
                                <option value="S3">Semestre 3</option>
                                <option value="S4">Semestre 4</option>
                                <option value="S5">Semestre 5</option>
                                <option value="S6">Semestre 6</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Enseignant Responsable *</label>
                            <select
                                value={newModule.teacher_responsible}
                                onChange={(e) =>
                                    setNewModule({
                                        ...newModule,
                                        teacher_responsible: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Sélectionner un enseignant
                                </option>
                                {teachers.map((teacher) => (
                                    <option
                                        key={teacher.id}
                                        value={teacher.matricule}
                                    >
                                        {teacher.name} ({teacher.matricule})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                resetNewForm();
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleAddModule}
                        >
                            Ajouter le Module
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ================= EDIT MODULE MODAL ================= */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedModule(null);
                }}
                title="Modifier le Module"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Code du Module *</label>
                            <input
                                type="text"
                                value={editModule.code}
                                onChange={(e) =>
                                    setEditModule({
                                        ...editModule,
                                        code: e.target.value,
                                    })
                                }
                                placeholder="MATH101"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom du Module *</label>
                            <input
                                type="text"
                                value={editModule.name}
                                onChange={(e) =>
                                    setEditModule({
                                        ...editModule,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Mathématiques Fondamentales"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Semestre *</label>
                            <select
                                value={editModule.semester}
                                onChange={(e) =>
                                    setEditModule({
                                        ...editModule,
                                        semester: e.target.value,
                                    })
                                }
                            >
                                <option value="">Sélectionner</option>
                                <option value="S1">Semestre 1</option>
                                <option value="S2">Semestre 2</option>
                                <option value="S3">Semestre 3</option>
                                <option value="S4">Semestre 4</option>
                                <option value="S5">Semestre 5</option>
                                <option value="S6">Semestre 6</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Enseignant Responsable *</label>
                            <select
                                value={editModule.teacher_responsible}
                                onChange={(e) =>
                                    setEditModule({
                                        ...editModule,
                                        teacher_responsible: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Sélectionner un enseignant
                                </option>
                                {teachers.map((teacher) => (
                                    <option
                                        key={teacher.id}
                                        value={teacher.matricule}
                                    >
                                        {teacher.name} ({teacher.matricule})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedModule(null);
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleUpdateModule}
                        >
                            Modifier
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ================= DELETE CONFIRMATION MODAL ================= */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedModule(null);
                }}
                title="Confirmer la suppression"
            >
                <div className="delete-confirmation">
                    <p>Êtes-vous sûr de vouloir supprimer ce module ?</p>
                    {selectedModule && (
                        <div className="exam-details">
                            <p>
                                <strong>Code:</strong> {selectedModule.code}
                            </p>
                            <p>
                                <strong>Nom:</strong> {selectedModule.name}
                            </p>
                            <p>
                                <strong>Semestre:</strong>{" "}
                                {selectedModule.semester}
                            </p>
                        </div>
                    )}
                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedModule(null);
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-danger"
                            onClick={handleDeleteModule}
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ================= IMPORT MODAL ================= */}
            <Modal
                isOpen={showImportModal}
                onClose={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                }}
                title="Importer des Modules"
            >
                <div className="import-form">
                    <div className="import-instructions">
                        <h3>Instructions d'import</h3>
                        <p>
                            Le fichier doit contenir les colonnes suivantes dans
                            cet ordre:
                        </p>
                        <ol>
                            <li>
                                <strong>Nom du module</strong>
                            </li>
                            <li>
                                <strong>Code du module</strong>
                            </li>
                            <li>
                                <strong>Semestre</strong> (S1, S2, etc.)
                            </li>
                            <li>
                                <strong>
                                    Matricule de l'enseignant responsable
                                </strong>
                            </li>
                        </ol>
                        <p>Formats acceptés: CSV, XLS, XLSX</p>
                    </div>

                    <div className="form-group">
                        <label>Sélectionner un fichier *</label>
                        <input
                            type="file"
                            accept=".csv,.xls,.xlsx"
                            onChange={handleFileChange}
                        />
                        {importFile && (
                            <p className="file-selected">
                                Fichier sélectionné: {importFile.name}
                            </p>
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
                            {importing ? "Import en cours..." : "Importer"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ModuleManagement;
