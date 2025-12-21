import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    { label: 'Utilisateurs', value: '150', path: '/users', color: '#667eea' },
    { label: 'Enseignants', value: '25', path: '/teachers', color: '#ed8936' },
    { label: 'Étudiants', value: '1,200', path: '/students', color: '#38a169' },
    { label: 'Modules', value: '45', path: '/modules', color: '#9f7aea' },
    { label: 'Salles', value: '30', path: '/rooms', color: '#f56565' },
    { label: 'Examens', value: '12', path: '/exams', color: '#4299e1' }
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Tableau de Bord Administrateur</h1>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Link to={stat.path} key={index} className="stat-card-link">
            <div className="stat-card" style={{ borderLeftColor: stat.color }}>
              <h3>{stat.label}</h3>
              <p className="stat-number">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="recent-actions">
        <h2>Actions Rapides</h2>
        <div className="quick-actions">
          <Link to="/exams" className="quick-action-btn">
            <span>📝</span>
            Planifier un Examen
          </Link>
          <Link to="/students" className="quick-action-btn">
            <span>🎓</span>
            Ajouter des Étudiants
          </Link>
          <Link to="/teachers" className="quick-action-btn">
            <span>👨‍🏫</span>
            Gérer les Enseignants
          </Link>
          <Link to="/modules" className="quick-action-btn">
            <span>📖</span>
            Créer un Module
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;