import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import "../../styles/RoomManagement.css";

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [newRoom, setNewRoom] = useState({
        name: "",
        capacity: "",
        location: "",
    });

    const [editRoom, setEditRoom] = useState({
        name: "",
        capacity: "",
        location: "",
    });

    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);

    /* ================= FETCH ROOMS ================= */
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get("/salles");
            setRooms(res.data.salles);
        } catch (err) {
            console.error("Fetch rooms error:", err);
            alert("Erreur lors du chargement des salles");
        }
    };

    /* ================= ADD ROOM ================= */
    const handleAddRoom = async () => {
        if (!newRoom.name || !newRoom.capacity || !newRoom.location) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            await api.post("/salles", {
                name: newRoom.name,
                capacity: newRoom.capacity,
                location: newRoom.location,
            });

            setShowAddModal(false);
            resetNewForm();
            fetchRooms();
            alert("Salle créée avec succès!");
        } catch (err) {
            console.error("Create room error:", err);
            alert("Erreur lors de la création de la salle");
        }
    };

    /* ================= EDIT ROOM ================= */
    const handleEditClick = (room) => {
        setSelectedRoom(room);
        setEditRoom({
            name: room.name,
            capacity: room.capacity,
            location: room.location,
        });
        setShowEditModal(true);
    };

    const handleUpdateRoom = async () => {
        if (!editRoom.name || !editRoom.capacity || !editRoom.location) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            await api.put(`/salles/${selectedRoom.id}`, {
                name: editRoom.name,
                capacity: editRoom.capacity,
                location: editRoom.location,
            });

            setShowEditModal(false);
            setSelectedRoom(null);
            fetchRooms();
            alert("Salle modifiée avec succès!");
        } catch (err) {
            console.error("Update room error:", err);
            alert("Erreur lors de la modification de la salle");
        }
    };

    /* ================= DELETE ROOM ================= */
    const handleDeleteClick = (room) => {
        setSelectedRoom(room);
        setShowDeleteModal(true);
    };

    const handleDeleteRoom = async () => {
        try {
            await api.delete(`/salles/${selectedRoom.id}`);
            setShowDeleteModal(false);
            setSelectedRoom(null);
            fetchRooms();
            alert("Salle supprimée avec succès!");
        } catch (err) {
            console.error("Delete room error:", err);
            alert("Erreur lors de la suppression de la salle");
        }
    };

    /* ================= IMPORT ROOMS ================= */
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
            const res = await api.post("/salles/import", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowImportModal(false);
            setImportFile(null);
            fetchRooms();

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
        setNewRoom({
            name: "",
            capacity: "",
            location: "",
        });
    };

    return (
        <div className="room-management">
            <div className="page-header">
                <h1>Gestion des Salles</h1>
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
                        + Ajouter Salle
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Capacité</th>
                            <th>Localisation</th>
                            <th>actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length > 0 ? (
                            rooms.map((room) => (
                                <tr key={room.id}>
                                    <td>{room.name}</td>
                                    <td>{room.capacity}</td>
                                    <td>{room.location}</td>

                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() =>
                                                    handleEditClick(room)
                                                }
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() =>
                                                    handleDeleteClick(room)
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
                                <td colSpan="6" className="no-data">
                                    Aucune salle disponible
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= ADD ROOM MODAL ================= */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    resetNewForm();
                }}
                title="Ajouter une Salle"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom de la salle *</label>
                            <input
                                type="text"
                                value={newRoom.name}
                                onChange={(e) =>
                                    setNewRoom({
                                        ...newRoom,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="A101"
                            />
                        </div>
                        <div className="form-group">
                            <label>Capacité *</label>
                            <input
                                type="number"
                                value={newRoom.capacity}
                                onChange={(e) =>
                                    setNewRoom({
                                        ...newRoom,
                                        capacity: e.target.value,
                                    })
                                }
                                placeholder="50"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Localisation *</label>
                            <input
                                type="text"
                                value={newRoom.location}
                                onChange={(e) =>
                                    setNewRoom({
                                        ...newRoom,
                                        location: e.target.value,
                                    })
                                }
                                placeholder="Bâtiment A"
                            />
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
                        <button className="btn-primary" onClick={handleAddRoom}>
                            Ajouter la Salle
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ================= EDIT ROOM MODAL ================= */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedRoom(null);
                }}
                title="Modifier la Salle"
            >
                <div className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom de la salle *</label>
                            <input
                                type="text"
                                value={editRoom.name}
                                onChange={(e) =>
                                    setEditRoom({
                                        ...editRoom,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="A101"
                            />
                        </div>
                        <div className="form-group">
                            <label>Capacité *</label>
                            <input
                                type="number"
                                value={editRoom.capacity}
                                onChange={(e) =>
                                    setEditRoom({
                                        ...editRoom,
                                        capacity: e.target.value,
                                    })
                                }
                                placeholder="50"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Localisation *</label>
                        <input
                            type="text"
                            value={editRoom.location}
                            onChange={(e) =>
                                setEditRoom({
                                    ...editRoom,
                                    location: e.target.value,
                                })
                            }
                            placeholder="Bâtiment A"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedRoom(null);
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleUpdateRoom}
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
                    setSelectedRoom(null);
                }}
                title="Confirmer la suppression"
            >
                <div className="delete-confirmation">
                    <p>Êtes-vous sûr de vouloir supprimer cette salle ?</p>
                    {selectedRoom && (
                        <div className="exam-details">
                            <p>
                                <strong>Nom:</strong> {selectedRoom.name}
                            </p>
                            <p>
                                <strong>Capacité:</strong>{" "}
                                {selectedRoom.capacity}
                            </p>
                            <p>
                                <strong>Localisation:</strong>{" "}
                                {selectedRoom.location}
                            </p>
                        </div>
                    )}
                    <div className="form-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedRoom(null);
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn-danger"
                            onClick={handleDeleteRoom}
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
                title="Importer des Salles"
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
                                <strong>Nom de la salle</strong>
                            </li>
                            <li>
                                <strong>Capacité</strong>
                            </li>
                            <li>
                                <strong>Localisation</strong>
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

export default RoomManagement;
