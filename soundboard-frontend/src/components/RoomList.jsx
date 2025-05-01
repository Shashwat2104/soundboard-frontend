import React from 'react';
import { Link } from 'react-router-dom';

const RoomList = ({ rooms }) => {
  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <div key={room.id} className="room-card">
          <div className="room-info">
            {room.bpm && (
              <span className="room-bpm">{room.bpm} BPM</span>
            )}
            <span className={`room-visibility ${room.isPublic ? 'public' : 'private'}`}>
              {room.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
          <h3 className="room-title">{room.name}</h3>
          {room.description && (
            <p className="room-description">{room.description}</p>
          )}
          <div className="room-users">
            <span className="user-count">
              <span className="user-count-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              {room.userCount || 0}
            </span>
          </div>
          <div className="join-room">
            <Link to={`/room/${room.id}`} className="join-room-btn">
              Join Room
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
