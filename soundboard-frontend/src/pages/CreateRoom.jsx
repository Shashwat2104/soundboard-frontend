import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJamRoom } from "../utils/api";
import { useAuth } from "../hooks/useAuth";

const CreateRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();  // Only declare navigate once

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState(120);
  const [keySignature, setKeySignature] = useState("C");
  const [isPrivate, setIsPrivate] = useState(false);

  // Remove duplicate navigate declaration

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const room = await createJamRoom({
        title,
        bpm: Number(bpm),
        keySignature,
        isPrivate
      });
      navigate(`/room/${room.roomCode}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create Jam Room</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Room Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">BPM</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            className="w-full p-2 border rounded"
            min="20"
            max="300"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Key Signature</label>
          <select
            value={keySignature}
            onChange={(e) => setKeySignature(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db"].map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            Private Room
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Room
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;
