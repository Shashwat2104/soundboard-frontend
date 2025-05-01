import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUserRooms, getUserStats } from "../utils/api";
import RoomList from "../components/RoomList";
import UserProfileStats from "../components/UserProfileStats";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

const Profile = () => {
  const { user } = useAuth();
  const [userRooms, setUserRooms] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("rooms");
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setStatsLoading(true);
        
        // Fetch rooms
        const rooms = await getUserRooms(user.id);
        setUserRooms(rooms);
        setLoading(false);
        
        // Fetch stats
        const stats = await getUserStats(user.id);
        setUserStats(stats);
        setStatsLoading(false);
      } catch (err) {
        setError("Failed to load user data");
        toast.error("Failed to load user data");
        console.error(err);
        setLoading(false);
        setStatsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Please Sign In</h2>
          </div>
          <div className="auth-card-body">
            <p>You need to be logged in to view your profile</p>
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">Sign In</Link>
              <Link to="/register" className="btn btn-outline">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile">
      {/* Profile Header with Banner & Avatar */}
      <div className="profile-header-container">
        <div className="profile-banner">
          <div className="profile-avatar-wrapper">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.username} className="profile-avatar" />
            ) : (
              <div className="profile-avatar">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-info-section">
          <div className="profile-user-details">
            <div>
              <h2 className="profile-username">{user.username}</h2>
              <p className="profile-join-date">{user.email}</p>
            </div>
            <button className="profile-edit-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards - Replace the existing stats section */}
      <UserProfileStats stats={userStats} loading={statsLoading} />
      
      {/* Tabs Section */}
      <div className="profile-tabs">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "rooms" ? "active" : ""}`}
            onClick={() => setActiveTab("rooms")}
          >
            My Rooms
          </button>
          <button
            className={`tab ${activeTab === "tracks" ? "active" : ""}`}
            onClick={() => setActiveTab("tracks")}
          >
            My Tracks
          </button>
          <button
            className={`tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>
        
        {activeTab === "rooms" && (
          <div className="tab-content slide-in-up">
            <div className="profile-section-title">
              <h2>Your Rooms</h2>
              <Link to="/create-room" className="profile-create-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Room
              </Link>
            </div>
            
            {loading ? (
              <div className="loader-container">
                <Loader />
              </div>
            ) : error ? (
              <div className="error-message">
                {error}
              </div>
            ) : userRooms.length === 0 ? (
              <div className="empty-rooms">
                <h3>You haven't created any rooms yet</h3>
                <p>Create your first jam room and start collaborating with musicians!</p>
                <Link to="/create-room" className="btn btn-primary">
                  Create Your First Room
                </Link>
              </div>
            ) : (
              <div className="profile-rooms-grid">
                <RoomList rooms={userRooms} />
              </div>
            )}
          </div>
        )}
        
        {activeTab === "tracks" && (
          <div className="tab-content slide-in-up">
            <h2 className="profile-section-title">Your Tracks</h2>
            <div className="empty-rooms">
              <h3>Track management coming soon</h3>
              <p>
                We're working on a dedicated track management section for all your recordings.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === "settings" && (
          <div className="tab-content slide-in-up">
            <h2 className="profile-section-title">Account Settings</h2>
            <div className="form-container">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={user.username || ""}
                  placeholder="Your username"
                  readOnly
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={user.email || ""}
                  placeholder="Your email"
                  readOnly
                />
              </div>
              
              <div className="form-actions">
                <button className="btn btn-primary">
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
