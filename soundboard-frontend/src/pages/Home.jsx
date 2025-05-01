import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RoomList from "../components/RoomList";
import Loader from "../components/Loader";
import { getPublicRooms } from "../utils/api";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getPublicRooms();
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to SoundBoard</h1>
            <p className="hero-description">
              Collaborate on music in real-time with friends and musicians around the world.
              Create, mix, and share your sounds together.
            </p>
            
            <div className="hero-buttons">
              {user ? (
                <Link to="/create-room" className="btn btn-primary hero-btn">
                  Create a Jam Room
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary hero-btn">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-glass hero-btn">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card hover-lift">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="42" height="42" stroke="url(#pink-gradient)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary-color)" />
                    <stop offset="100%" stopColor="var(--secondary-color)" />
                  </linearGradient>
                </defs>
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <h3>Create Together</h3>
            <p>
              Record and upload tracks in real-time, collaborating with musicians anywhere.
            </p>
          </div>
          
          <div className="feature-card hover-lift">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="42" height="42" stroke="url(#pink-gradient-2)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="pink-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary-color)" />
                    <stop offset="100%" stopColor="var(--secondary-color)" />
                  </linearGradient>
                </defs>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
                <line x1="3" y1="15" x2="9" y2="15"></line>
                <line x1="15" y1="9" x2="15" y2="21"></line>
                <line x1="15" y1="15" x2="21" y2="15"></line>
              </svg>
            </div>
            <h3>Mix & Master</h3>
            <p>
              Adjust volume, mute, and solo tracks to create the perfect mix.
            </p>
          </div>
          
          <div className="feature-card hover-lift">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="42" height="42" stroke="url(#pink-gradient-3)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="pink-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary-color)" />
                    <stop offset="100%" stopColor="var(--secondary-color)" />
                  </linearGradient>
                </defs>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </div>
            <h3>Share Your Sound</h3>
            <p>
              Export your finished projects and share them with the world.
            </p>
          </div>
        </div>
      </div>
      
      {/* Public Rooms Section */}
      <div className="container rooms-section">
        <div className="section-header">
          <h2 className="section-title">Public Jam Rooms</h2>
          {user && (
            <Link to="/create-room" className="btn btn-primary">
              Create New Room
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="loader-container">
            <Loader />
          </div>
        ) : rooms.length === 0 ? (
          <div className="empty-rooms">
            <p>No public rooms available right now</p>
            {user ? (
              <Link to="/create-room" className="btn btn-primary">
                Create the First Room
              </Link>
            ) : (
              <p>
                <Link to="/login" className="link-highlight">Sign in</Link> to create a room
              </p>
            )}
          </div>
        ) : (
          <RoomList rooms={rooms} />
        )}
      </div>
    </div>
  );
};

export default Home;
