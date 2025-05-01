import React from "react";
import { Link } from "react-router-dom";

const RoomCard = ({ room }) => {
  return (
    <Link to={`/room/${room.roomCode}`} className="room-card hover-lift">
      <div className="bg-primary-color bg-opacity-10 p-4 border-b border-primary-color border-opacity-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary-dark p-1 px-3 rounded-full text-sm font-medium">
              {room.keySignature}
            </div>
            <div className="text-gray-300">
              {room.bpm} BPM
            </div>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs ${room.isPrivate ? 'bg-primary-color' : 'bg-success'} bg-opacity-80 text-white`}>
            {room.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
      </div>
      
      <div className="card-body p-5">
        <h2 className="room-title mb-3 text-light">{room.name}</h2>
        
        {room.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{room.description}</p>
        )}
        
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="room-info flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{room.createdBy}</span>
            </div>
            
            <div className="flex items-center gap-1 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{room.members || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center text-primary-light font-medium bg-primary-color bg-opacity-10 px-3 py-1 rounded-full hover-glow">
            Join Room
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
