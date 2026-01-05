import React, { useState, useEffect } from "react";
import Modal from "../UI/Modal";
import api from "../../api/axios";
import "../../styles/user-management.css";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [role, setRole] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);

    const [newUser, setNewUser] = useState({
        matricule: "",
        name: "",
        email: "",
        password: "",
        role: "student",
        specialite: "",
        niveau: "",
        annee_scolaire: "",
        groupe: "",
    });

    useEffect(() => {
        fetchUsers();
    }, [role, search, page]);

    const fetchUsers = async () => {
        const res = await api.get("/users", { params: { role, search, page } });
        setUsers(res.data.data);
        setPagination(res.data);
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert("Nom, Email et Mot de passe sont obligatoires");
            return;
        }

        try {
            await api.post("/users", newUser);
            alert("Utilisateur ajouté avec succès");
            setShowAddModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Erreur lors de l'ajout");
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setNewUser({
            matricule: user.matricule || "",
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            specialite: user.specialite || "",
            niveau: user.niveau || "",
            annee_scolaire: user.annee_scolaire || "",
            groupe: user.groupe || "",
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        try {
            const updateData = { ...newUser };
            if (!updateData.password) delete updateData.password;

            await api.put(`/users/${editingUser.id}`, updateData);
            alert("Utilisateur modifié avec succès");
            setShowEditModal(false);
            setEditingUser(null);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                    "Erreur lors de la modification"
            );
        }
    };

    const handleDeleteUser = async (id) => {
        if (
            !window.confirm(
                "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            )
        )
            return;
        await api.delete(`/users/${id}`);
        fetchUsers();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
        if (!importFile) return alert("Sélectionnez un fichier CSV");

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
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Erreur lors de l'import");
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        // Fixed: Added annee_scolaire column to match backend expectations (9 columns total)
        const csvContent =
            "matricule;nom;email;role;password;specialite;niveau;annee_scolaire;groupe\n" +
            "USR001;John Doe;john.doe@example.com;student;password123;Informatique;L1;2024-2025;G1\n" +
            "USR002;Jane Smith;jane.smith@example.com;teacher;password123;Mathématiques;M1;2024-2025;G2";

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "template_users.csv";
        link.click();
    };

    const resetForm = () => {
        setNewUser({
            matricule: "",
            name: "",
            email: "",
            password: "",
            role: "student",
            specialite: "",
            niveau: "",
            annee_scolaire: "",
            groupe: "",
        });
    };

    return (
        <div className="user-management">
            <h1>Gestion des Utilisateurs</h1>

            <div className="header-actions">
                <button
                    onClick={() => setShowImportModal(true)}
                    className="btn-secondary"
                >
                    📁 Importer
                </button>
            </div>

            <div className="filters">
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="">Tous les rôles</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                </select>

                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Matricule</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.matricule || "-"}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    <button
                                        onClick={() => handleEditClick(u)}
                                        className="edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="delete"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center" }}>
                                Aucun utilisateur trouvé
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <button
                    disabled={!pagination.prev_page_url}
                    onClick={() => setPage(page - 1)}
                >
                    ⬅
                </button>
                <span>Page {pagination.current_page || 1}</span>
                <button
                    disabled={!pagination.next_page_url}
                    onClick={() => setPage(page + 1)}
                >
                    ➡
                </button>
            </div>

            {/* Add User Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    resetForm();
                }}
                title="Ajouter un utilisateur"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom *</label>
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Matricule</label>
                            <input
                                type="text"
                                value={newUser.matricule}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        matricule: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Mot de passe *</label>
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Rôle</label>
                            <select
                                value={newUser.role}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        role: e.target.value,
                                    })
                                }
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Spécialité</label>
                            <input
                                type="text"
                                value={newUser.specialite}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        specialite: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Niveau</label>
                            <input
                                type="text"
                                value={newUser.niveau}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        niveau: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Année Scolaire</label>
                            <input
                                type="text"
                                value={newUser.annee_scolaire}
                                placeholder="ex: 2024-2025"
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        annee_scolaire: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Groupe</label>
                            <input
                                type="text"
                                value={newUser.groupe}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        groupe: e.target.value,
                                    })
                                }
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
                        <button className="btn-primary" onClick={handleAddUser}>
                            Ajouter
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    resetForm();
                }}
                title="Modifier un utilisateur"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom *</label>
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Matricule</label>
                            <input
                                type="text"
                                value={newUser.matricule}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        matricule: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                Mot de passe (laisser vide pour ne pas changer)
                            </label>
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Rôle</label>
                            <select
                                value={newUser.role}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        role: e.target.value,
                                    })
                                }
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Spécialité</label>
                            <input
                                type="text"
                                value={newUser.specialite}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        specialite: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Niveau</label>
                            <input
                                type="text"
                                value={newUser.niveau}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        niveau: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Année Scolaire</label>
                            <input
                                type="text"
                                value={newUser.annee_scolaire}
                                placeholder="ex: 2024-2025"
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        annee_scolaire: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Groupe</label>
                            <input
                                type="text"
                                value={newUser.groupe}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        groupe: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingUser(null);
                                resetForm();
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleUpdateUser}
                        >
                            Modifier
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
                title="Importer des utilisateurs"
            >
                <div className="import-container">
                    <p>
                        <strong>
                            Format CSV attendu (séparateur: point-virgule):
                        </strong>
                    </p>
                    <p style={{ fontSize: "0.9em", color: "#666" }}>
                        matricule;nom;email;role;password;specialite;niveau;annee_scolaire;groupe
                    </p>
                    <button
                        className="btn-secondary"
                        onClick={downloadTemplate}
                    >
                        📥 Télécharger le modèle CSV
                    </button>

                    <div className="form-group" style={{ marginTop: "20px" }}>
                        <label>Sélectionner un fichier CSV *</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={importing}
                        />
                        {importFile && (
                            <p style={{ color: "#2563eb", marginTop: "8px" }}>
                                ✓ Fichier sélectionné: {importFile.name}
                            </p>
                        )}
                    </div>

                    <div className="form-actions" style={{ marginTop: "20px" }}>
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

export default UserManagement;
