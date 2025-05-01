import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="container">
      <nav className="navbar">
        <Link to="/" className="logo">
          <span>🎵</span>
          <span className="logo-text">SoundBoard</span>
        </Link>
        
        {/* Center Navigation */}
        <div className="nav-center hidden md:flex">
          <Link 
            to="/" 
            className={`nav-btn ${isActive('/') ? 'nav-active' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </Link>
          
          {user && (
            <>
              <Link 
                to="/create-room" 
                className={`nav-btn ${isActive('/create-room') ? 'nav-active' : ''}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span>Create Room</span>
              </Link>
              <Link 
                to="/profile" 
                className={`nav-btn ${isActive('/profile') ? 'nav-active' : ''}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile</span>
              </Link>
            </>
          )}
        </div>
        
        {/* Right Actions */}
        <div className="nav-right hidden md:flex">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="avatar">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="username">{user.username || user.email}</span>
              </div>
              <button 
                onClick={logout} 
                className="btn-logout"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link 
                to="/login" 
                className="btn-auth signin"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn-auth signup"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="mobile-menu-toggle md:hidden">
          <button
            className="menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu md:hidden">
          <Link 
            to="/" 
            className={`mobile-menu-item ${isActive('/') ? 'mobile-menu-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
          
          {user ? (
            <>
              <Link 
                to="/create-room" 
                className={`mobile-menu-item ${isActive('/create-room') ? 'mobile-menu-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Create Room
              </Link>
              <Link 
                to="/profile" 
                className={`mobile-menu-item ${isActive('/profile') ? 'mobile-menu-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </Link>
              <button 
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }} 
                className="mobile-menu-item"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <div className="mobile-buttons">
              <Link 
                to="/login" 
                className="btn-auth signin"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn-auth signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
