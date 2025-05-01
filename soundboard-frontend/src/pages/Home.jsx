import React, { useEffect, useState } from "react";
import RoomList from "../components/RoomList";
import Loader from "../components/Loader";
import { getPublicRooms } from "../utils/api";
const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Public Jam Rooms</h1>
      {loading ? <Loader /> : <RoomList rooms={rooms} />}
    </div>
  );
};

export default Home;
