import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // We'll create this CSS file next

const Sidebar = () => {
  const { isAdmin } = useAuth();
  
  // Redirect logic is handled in individual admin components
  
  return (
    <nav className="w-[80px] md:w-[220px] bg-[#1a1a1a] text-white fixed top-[60px] h-screen transition-all duration-300 z-[1000]">
      <div className="!p-5 text-center border-b border-[#34495e]">
        <h3 className=" text-white text-xl hidden md:block">Admin Menu</h3>
      </div>
      <ul className="list-none p-0 m-0">
        <li>
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => 
              `flex items-center !p-4 text-[#bdc3c7] no-underline transition-colors duration-300 border-l-4 border-transparent hover:bg-black hover:text-white ${isActive ? 'bg-[#34495e] text-white border-l-4 border-white font-bold' : ''}`
            }
          >
            <i className="fas fa-upload !mr-1 md:mr-2.5 text-lg w-5 text-center"></i>
            <span className="hidden md:inline">Asset Upload</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/upload-movie" 
            className={({ isActive }) => 
              `flex items-center !p-4 text-[#bdc3c7] no-underline transition-colors duration-300 border-l-4 border-transparent hover:bg-black hover:text-white ${isActive ? 'bg-[#34495e] text-white border-l-4 border-white font-bold' : ''}`
            }
          >
            <i className="fas fa-film !mr-1 md:mr-2.5 text-lg w-5 text-center"></i>
            <span className="hidden md:inline">Movie & DTO Upload</span>
          </NavLink>
        </li>
        {/* Add more admin links here as needed */}
      </ul>
    </nav>
  );
};

export default Sidebar;