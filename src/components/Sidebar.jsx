import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css'; // Import the CSS file

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
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-upload"></i>
            <span>Asset Upload</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/upload-movie" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-film"></i>
            <span>Movie & DTO Upload</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/movies" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-list"></i>
            <span>Quản lý phim</span>
          </NavLink>
        </li>
        {/* Add more admin links here as needed */}
      </ul>
    </nav>
  );
};

export default Sidebar;
