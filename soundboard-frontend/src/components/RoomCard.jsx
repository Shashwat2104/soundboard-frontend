import React from "react";
import { Link } from "react-router-dom";

const RoomCard = ({ room }) => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold">{room.title}</h2>
      <p>BPM: {room.bpm}</p>
      <p>Key: {room.keySignature}</p>
      <p>Privacy: {room.isPrivate ? "Private" : "Public"}</p>
      <Link
        to={`/room/${room.roomCode}`}
        className="mt-2 inline-block text-blue-600"
      >
        Join Room
      </Link>
    </div>
  );
};

export default RoomCard;
