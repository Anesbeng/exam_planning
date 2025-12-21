import React, { useState } from 'react';
import Modal from '../UI/Modal';
import FileImport from '../UI/FileImport';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: 'A101',
      capacity: 50,
      location: 'Bâtiment A',
      type: 'Amphithéâtre',
      equipment: 'Projecteur, Tableau'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    location: '',
    type: 'Salle de classe',
    equipment: ''
  });

  const handleAddRoom = () => {
    const room = {
      id: rooms.length + 1,
      ...newRoom
    };
    setRooms([...rooms, room]);
    setShowAddModal(false);
    resetForm();
  };

  const handleImport = (file) => {
    alert(`Salles importées depuis ${file.name}`);
    setShowImportModal(false);
  };

  const resetForm = () => {
    setNewRoom({
      name: '',
      capacity: '',
      location: '',
      type: 'Salle de classe',
      equipment: ''
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
              <th>Type</th>
              <th>Équipement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>{room.capacity}</td>
                <td>{room.location}</td>
                <td>{room.type}</td>
                <td>{room.equipment}</td>
                <td>
                  <button className="btn-edit">Modifier</button>
                  <button className="btn-delete">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Room Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          resetForm();
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
                onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                placeholder="A101"
              />
            </div>
            <div className="form-group">
              <label>Capacité *</label>
              <input 
                type="number" 
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
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
                onChange={(e) => setNewRoom({...newRoom, location: e.target.value})}
                placeholder="Bâtiment A"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select 
                value={newRoom.type}
                onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
              >
                <option value="Salle de classe">Salle de classe</option>
                <option value="Amphithéâtre">Amphithéâtre</option>
                <option value="Laboratoire">Laboratoire</option>
                <option value="Salle informatique">Salle informatique</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Équipement</label>
            <input 
              type="text" 
              value={newRoom.equipment}
              onChange={(e) => setNewRoom({...newRoom, equipment: e.target.value})}
              placeholder="Projecteur, Tableau"
            />
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
              onClick={handleAddRoom}
            >
              Ajouter la Salle
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Importer des Salles"
      >
        <FileImport type="salles" onImport={handleImport} />
      </Modal>
    </div>
  );
};

export default RoomManagement;