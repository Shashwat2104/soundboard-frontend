import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createRoom } from "../utils/api";
import { toast } from "react-toastify";

const CreateRoom = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    bpm: 120,
    keySignature: "C",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to create a room");
      toast.error("You must be logged in to create a room");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const roomData = {
        ...formData,
        createdBy: user.id,
      };
      
      const newRoom = await createRoom(roomData);
      toast.success("Room created successfully!");
      navigate(`/room/${newRoom.roomCode}`);
    } catch (err) {
      const errorMsg = "Failed to create room: " + (err.message || "");
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const keyOptions = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  return (
    <div className="create-room-container">
      <div className="create-room-form">
        <h1>Create a Jam Room</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Room Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="My Awesome Jam Room"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-control"
              placeholder="Describe what kind of music you want to create..."
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bpm">BPM</label>
              <input
                type="number"
                id="bpm"
                name="bpm"
                value={formData.bpm}
                onChange={handleChange}
                min="60"
                max="200"
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="keySignature">Key</label>
              <select
                id="keySignature"
                name="keySignature"
                value={formData.keySignature}
                onChange={handleChange}
                className="form-control"
              >
                {keyOptions.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
            />
            <label htmlFor="isPrivate" className="checkbox-label">
              Make this room private
            </label>
          </div>
          <p className="checkbox-help">
            Private rooms require an invitation to join
          </p>
          
          <div className="create-room-actions">
            <button 
              type="submit" 
              disabled={loading}
              className="create-room-button"
            >
              {loading ? "Creating Room..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
