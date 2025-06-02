import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();
  
  // Redirect logic is handled in individual admin components
  
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>Admin Menu</h3>
      </div>
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <i className="fas fa-upload"></i> Asset Upload
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/upload-movie" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <i className="fas fa-film"></i> Movie & DTO Upload
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/movies" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <i className="fas fa-list"></i> Quản lý phim
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
