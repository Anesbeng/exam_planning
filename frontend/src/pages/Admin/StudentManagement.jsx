import React, { useState, useEffect } from "react";
import Modal from "../UI/Modal";
import api from "../../api/axios";

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);

    const [newStudent, setNewStudent] = useState({
        name: "",
        email: "",
        matricule: "",
        password: "",
        niveau: "",
        specialite: "",
        groupe: "",
        annee_scolaire: new Date().getFullYear(),
    });

    // Fetch students from API
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get("/students");
            setStudents(response.data.students);
        } catch (error) {
            console.error("Error fetching students:", error);
            alert("Erreur lors du chargement des étudiants");
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async () => {
        // Validation côté client
        if (
            !newStudent.name ||
            !newStudent.email ||
            !newStudent.matricule ||
            !newStudent.password
        ) {
            alert(
                "Veuillez remplir tous les champs obligatoires (Nom, Email, Matricule, Mot de passe)"
            );
            return;
        }

        // Validation email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStudent.email)) {
            alert(
                "Veuillez entrer un email valide (ex: jean.dupont@edu.uabt.dz)"
            );
            return;
        }

        if (
            !newStudent.niveau ||
            !newStudent.specialite ||
            !newStudent.groupe
        ) {
            alert("Veuillez remplir le niveau, la spécialité et le groupe");
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

            // Afficher les erreurs de validation spécifiques
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
            name: student.name,
            email: student.email,
            matricule: student.matricule,
            password: "",
            niveau: student.niveau,
            specialite: student.specialite,
            groupe: student.groupe,
            annee_scolaire: student.annee_scolaire,
        });
        setShowEditModal(true);
    };

    const handleUpdateStudent = async () => {
        // Validation côté client
        if (!newStudent.name || !newStudent.email || !newStudent.matricule) {
            alert(
                "Veuillez remplir tous les champs obligatoires (Nom, Email, Matricule)"
            );
            return;
        }

        // Validation email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStudent.email)) {
            alert(
                "Veuillez entrer un email valide (ex: jean.dupont@edu.uabt.dz)"
            );
            return;
        }

        if (
            !newStudent.niveau ||
            !newStudent.specialite ||
            !newStudent.groupe
        ) {
            alert("Veuillez remplir le niveau, la spécialité et le groupe");
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

            // Afficher les erreurs de validation spécifiques
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
        if (file) {
            // Validate file type
            const validTypes = [
                "text/csv",
                "application/vnd.ms-excel",
                "text/plain",
            ];
            if (
                !validTypes.includes(file.type) &&
                !file.name.endsWith(".csv")
            ) {
                alert("Veuillez sélectionner un fichier CSV valide");
                e.target.value = "";
                return;
            }
            setImportFile(file);
        }
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
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            let message = response.data.message;

            if (response.data.errors && response.data.errors.length > 0) {
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
            "matricule;nom;email;role;password;specialite;niveau;annee_scolaire;groupe\n" +
            "ETU001;Jean Dupont;jean.dupont@edu.uabt.dz;student;password123;Informatique;L1;2024;G1\n" +
            "ETU002;Marie Martin;marie.martin@edu.uabt.dz;student;password123;Mathématiques;L2;2024;G2";

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
            name: "",
            email: "",
            matricule: "",
            password: "",
            niveau: "",
            specialite: "",
            groupe: "",
            annee_scolaire: new Date().getFullYear(),
        });
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingStudent(null);
        resetForm();
    };

    const handleCloseImportModal = () => {
        setShowImportModal(false);
        setImportFile(null);
    };

    return (
        <div className="student-management">
            <div className="page-header">
                <h1>Gestion des Étudiants</h1>
                <div className="header-actions">
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
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
                                        <td>
                                            <button
                                                className="btn-edit"
                                                onClick={() =>
                                                    handleEditClick(student)
                                                }
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() =>
                                                    handleDeleteStudent(
                                                        student.id
                                                    )
                                                }
                                            >
                                                Supprimer
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
                onClose={handleCloseAddModal}
                title="Ajouter un Étudiant"
                size="lg"
            >
                <div className="form">
                    <div className="form-row">
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
                                <option value="L1">Licence 1</option>
                                <option value="L2">Licence 2</option>
                                <option value="L3">Licence 3</option>
                                <option value="M1">Master 1</option>
                                <option value="M2">Master 2</option>
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
                                <option value="Informatique">
                                    Informatique
                                </option>
                                <option value="Mathématiques">
                                    Mathématiques
                                </option>
                                <option value="Physique">Physique</option>
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
                            onClick={handleCloseAddModal}
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
                onClose={handleCloseEditModal}
                title="Modifier un Étudiant"
                size="lg"
            >
                <div className="form">
                    <div className="form-row">
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
                                <option value="L1">Licence 1</option>
                                <option value="L2">Licence 2</option>
                                <option value="L3">Licence 3</option>
                                <option value="M1">Master 1</option>
                                <option value="M2">Master 2</option>
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
                                <option value="Informatique">
                                    Informatique
                                </option>
                                <option value="Mathématiques">
                                    Mathématiques
                                </option>
                                <option value="Physique">Physique</option>
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
                            onClick={handleCloseEditModal}
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
                onClose={handleCloseImportModal}
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
                        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
                            <li>matricule</li>
                            <li>nom</li>
                            <li>email</li>
                            <li>role (optionnel, par défaut: student)</li>
                            <li>password</li>
                            <li>specialite</li>
                            <li>niveau</li>
                            <li>annee_scolaire</li>
                            <li>groupe</li>
                        </ul>
                        <button
                            className="btn-secondary"
                            onClick={downloadTemplate}
                            style={{ marginTop: "15px" }}
                        >
                            📥 Télécharger le modèle CSV
                        </button>
                    </div>

                    <div className="form-group" style={{ marginTop: "20px" }}>
                        <label>Sélectionner un fichier CSV *</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={importing}
                        />
                        {importFile && (
                            <p style={{ marginTop: "10px", color: "#2563eb" }}>
                                Fichier sélectionné: {importFile.name}
                            </p>
                        )}
                    </div>

                    <div className="form-actions" style={{ marginTop: "20px" }}>
                        <button
                            className="btn-secondary"
                            onClick={handleCloseImportModal}
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
