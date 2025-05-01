import React from "react";
import RoomCard from "./RoomCard";

const RoomList = ({ rooms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
};

export default RoomList;
