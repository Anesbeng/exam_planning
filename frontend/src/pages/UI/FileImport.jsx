import React, { useState } from 'react';

const FileImport = ({ type, onImport }) => {
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    setIsImporting(true);
    
    // Simulate file processing
    setTimeout(() => {
      alert(`${type} importés avec succès depuis ${file.name}`);
      onImport(file);
      setIsImporting(false);
      setFile(null);
    }, 1500);
  };

  return (
    <div className="file-import">
      <h3>Import {type}</h3>
      <div className="import-form">
        <div className="file-input-group">
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="file-input"
          />
          {file ? (
            <div className="file-selected">
              📄 {file.name}
            </div>
          ) : (
            <div className="file-placeholder">
              📁 Choisir un fichier Excel
            </div>
          )}
        </div>
        
        <button 
          onClick={handleImport} 
          className="btn-primary"
          disabled={!file || isImporting}
        >
          {isImporting ? 'Importation...' : `Importer les ${type}`}
        </button>
        
        <div className="import-help">
          <p>Formats acceptés: .xlsx, .xls, .csv</p>
        </div>
      </div>
    </div>
  );
};

export default FileImport;