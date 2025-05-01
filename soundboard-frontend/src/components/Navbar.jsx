import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link to="/" className="font-bold text-lg">
        🎵 SoundBoard
      </Link>
      <div className="flex gap-4">
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/create-room">Create Room</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
