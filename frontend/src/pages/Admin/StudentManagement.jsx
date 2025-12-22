import React, { useState, useEffect } from "react";
import Modal from "../UI/Modal";
import api from "../../api/axios";
import "./student-management.css";

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);

    const [newStudent, setNewStudent] = useState({
        matricule: "",
        name: "",
        email: "",
        password: "",
        specialite: "",
        niveau: "",
        groupe: "",
        annee_scolaire: new Date().getFullYear().toString(),
    });

    // Fetch students from API
    useEffect(() => {
        fetchStudents();
    }, [search]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get("/students", {
                params: { search },
            });
            setStudents(response.data.students);
        } catch (error) {
            console.error("Error fetching students:", error);
            alert("Erreur lors du chargement des étudiants");
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async () => {
        // Validation
        const requiredFields = [
            "name",
            "email",
            "matricule",
            "password",
            "specialite",
            "niveau",
            "groupe",
        ];
        const missingFields = requiredFields.filter(
            (field) => !newStudent[field]
        );

        if (missingFields.length > 0) {
            alert(`Champs obligatoires manquants: ${missingFields.join(", ")}`);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStudent.email)) {
            alert("Veuillez entrer un email valide");
            return;
        }

        try {
            await api.post("/students", newStudent);
            alert("Étudiant ajouté avec succès");
            setShowAddModal(false);
            resetForm();
            fetchStudents();
        } catch (error) {
            console.error("Error adding student:", error);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                let errorMessage = "Erreurs de validation:\n\n";

                Object.keys(errors).forEach((key) => {
                    errorMessage += `${key}: ${errors[key].join(", ")}\n`;
                });

                alert(errorMessage);
            } else {
                alert(
                    error.response?.data?.message ||
                        "Erreur lors de l'ajout de l'étudiant"
                );
            }
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setNewStudent({
            matricule: student.matricule || "",
            name: student.name,
            email: student.email,
            password: "",
            specialite: student.specialite || "",
            niveau: student.niveau || "",
            groupe: student.groupe || "",
            annee_scolaire:
                student.annee_scolaire || new Date().getFullYear().toString(),
        });
        setShowEditModal(true);
    };

    const handleUpdateStudent = async () => {
        // Validation
        const requiredFields = [
            "name",
            "email",
            "matricule",
            "specialite",
            "niveau",
            "groupe",
        ];
        const missingFields = requiredFields.filter(
            (field) => !newStudent[field]
        );

        if (missingFields.length > 0) {
            alert(`Champs obligatoires manquants: ${missingFields.join(", ")}`);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStudent.email)) {
            alert("Veuillez entrer un email valide");
            return;
        }

        try {
            const updateData = { ...newStudent };
            if (!updateData.password) {
                delete updateData.password;
            }

            await api.put(`/students/${editingStudent.id}`, updateData);
            alert("Étudiant modifié avec succès");
            setShowEditModal(false);
            setEditingStudent(null);
            resetForm();
            fetchStudents();
        } catch (error) {
            console.error("Error updating student:", error);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                let errorMessage = "Erreurs de validation:\n\n";

                Object.keys(errors).forEach((key) => {
                    errorMessage += `${key}: ${errors[key].join(", ")}\n`;
                });

                alert(errorMessage);
            } else {
                alert(
                    error.response?.data?.message ||
                        "Erreur lors de la modification de l'étudiant"
                );
            }
        }
    };

    const handleDeleteStudent = async (id) => {
        if (
            !window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")
        ) {
            return;
        }

        try {
            await api.delete(`/students/${id}`);
            alert("Étudiant supprimé avec succès");
            fetchStudents();
        } catch (error) {
            console.error("Error deleting student:", error);
            alert("Erreur lors de la suppression de l'étudiant");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "text/plain",
        ];
        if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
            alert("Veuillez sélectionner un fichier CSV valide");
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

            const response = await api.post("/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            let message = response.data.message;
            if (response.data.errors?.length > 0) {
                message += "\n\nErreurs:\n" + response.data.errors.join("\n");
            }

            alert(message);
            setShowImportModal(false);
            setImportFile(null);
            fetchStudents();
        } catch (error) {
            console.error("Error importing students:", error);
            alert(
                error.response?.data?.message ||
                    "Erreur lors de l'importation des étudiants"
            );
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent =
            "matricule;nom;email;password;specialite;niveau;annee_scolaire;groupe\n" +
            "ETU001;Jean Dupont;jean.dupont@edu.uabt.dz;password123;Informatique;L1;2024;G1\n" +
            "ETU002;Marie Martin;marie.martin@edu.uabt.dz;password123;Mathématiques;L2;2024;G2";

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "template_etudiants.csv";
        link.click();
    };

    const resetForm = () => {
        setNewStudent({
            matricule: "",
            name: "",
            email: "",
            password: "",
            specialite: "",
            niveau: "",
            groupe: "",
            annee_scolaire: new Date().getFullYear().toString(),
        });
    };

    // Options for selects
    const niveauOptions = ["L1", "L2", "L3", "M1", "M2"];
    const specialiteOptions = [
        "Informatique",
        "Mathématiques",
        "Physique",
        "Chimie",
        "Biologie",
    ];

    return (
        <div className="student-management">
            <div className="page-header">
                <h1>Gestion des Étudiants</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, matricule..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <button
                        className="btn-secondary"
                        onClick={() => setShowImportModal(true)}
                    >
                        📁 Importer CSV
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Ajouter Étudiant
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading">Chargement...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Matricule</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Niveau</th>
                                <th>Spécialité</th>
                                <th>Groupe</th>
                                <th>Année Scolaire</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        style={{ textAlign: "center" }}
                                    >
                                        Aucun étudiant trouvé
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.matricule}</td>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.niveau}</td>
                                        <td>{student.specialite}</td>
                                        <td>{student.groupe}</td>
                                        <td>{student.annee_scolaire}</td>
                                        <td className="actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() =>
                                                    handleEditClick(student)
                                                }
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() =>
                                                    handleDeleteStudent(
                                                        student.id
                                                    )
                                                }
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Student Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    resetForm();
                }}
                title="Ajouter un Étudiant"
                size="lg"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Matricule *</label>
                            <input
                                type="text"
                                value={newStudent.matricule}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        matricule: e.target.value,
                                    })
                                }
                                placeholder="ETU001"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom *</label>
                            <input
                                type="text"
                                value={newStudent.name}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Jean Dupont"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                value={newStudent.email}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="jean.dupont@edu.uabt.dz"
                            />
                        </div>
                        <div className="form-group">
                            <label>Mot de passe *</label>
                            <input
                                type="password"
                                value={newStudent.password}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        password: e.target.value,
                                    })
                                }
                                placeholder="******"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Niveau *</label>
                            <select
                                value={newStudent.niveau}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        niveau: e.target.value,
                                    })
                                }
                            >
                                <option value="">Sélectionner</option>
                                {niveauOptions.map((niveau) => (
                                    <option key={niveau} value={niveau}>
                                        {niveau}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Spécialité *</label>
                            <select
                                value={newStudent.specialite}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        specialite: e.target.value,
                                    })
                                }
                            >
                                <option value="">Sélectionner</option>
                                {specialiteOptions.map((spec) => (
                                    <option key={spec} value={spec}>
                                        {spec}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Groupe *</label>
                            <input
                                type="text"
                                value={newStudent.groupe}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        groupe: e.target.value,
                                    })
                                }
                                placeholder="G1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Année Scolaire</label>
                            <input
                                type="number"
                                value={newStudent.annee_scolaire}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        annee_scolaire: e.target.value,
                                    })
                                }
                                placeholder="2024"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                resetForm();
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleAddStudent}
                        >
                            Ajouter l'Étudiant
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Student Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                    resetForm();
                }}
                title="Modifier un Étudiant"
                size="lg"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Matricule *</label>
                            <input
                                type="text"
                                value={newStudent.matricule}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        matricule: e.target.value,
                                    })
                                }
                                placeholder="ETU001"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom *</label>
                            <input
                                type="text"
                                value={newStudent.name}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Jean Dupont"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                value={newStudent.email}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="jean.dupont@edu.uabt.dz"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                Mot de passe (laisser vide pour ne pas changer)
                            </label>
                            <input
                                type="password"
                                value={newStudent.password}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        password: e.target.value,
                                    })
                                }
                                placeholder="******"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Niveau *</label>
                            <select
                                value={newStudent.niveau}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        niveau: e.target.value,
                                    })
                                }
                            >
                                <option value="">Sélectionner</option>
                                {niveauOptions.map((niveau) => (
                                    <option key={niveau} value={niveau}>
                                        {niveau}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Spécialité *</label>
                            <select
                                value={newStudent.specialite}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        specialite: e.target.value,
                                    })
                                }
                            >
                                <option value="">Sélectionner</option>
                                {specialiteOptions.map((spec) => (
                                    <option key={spec} value={spec}>
                                        {spec}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Groupe *</label>
                            <input
                                type="text"
                                value={newStudent.groupe}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        groupe: e.target.value,
                                    })
                                }
                                placeholder="G1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Année Scolaire</label>
                            <input
                                type="number"
                                value={newStudent.annee_scolaire}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        annee_scolaire: e.target.value,
                                    })
                                }
                                placeholder="2024"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingStudent(null);
                                resetForm();
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleUpdateStudent}
                        >
                            Modifier l'Étudiant
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Import Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                }}
                title="Importer des Étudiants"
            >
                <div className="import-container">
                    <div className="import-info">
                        <p>
                            <strong>Format du fichier CSV:</strong>
                        </p>
                        <p>
                            Le fichier doit contenir les colonnes suivantes
                            séparées par des points-virgules (;):
                        </p>
                        <ul>
                            <li>matricule (obligatoire)</li>
                            <li>nom (obligatoire)</li>
                            <li>email (obligatoire)</li>
                            <li>password (obligatoire)</li>
                            <li>specialite (obligatoire)</li>
                            <li>niveau (obligatoire)</li>
                            <li>annee_scolaire</li>
                            <li>groupe (obligatoire)</li>
                        </ul>
                        <button
                            className="btn-secondary"
                            onClick={downloadTemplate}
                        >
                            📥 Télécharger le modèle CSV
                        </button>
                    </div>

                    <div className="form-group">
                        <label>Sélectionner un fichier CSV *</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={importing}
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
                            {importing ? "Importation..." : "Importer"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentManagement;
