import { useEffect, useState } from "react";
import { getRoomDetails } from "../utils/api";
import { useParams } from "react-router-dom";

export const useRoom = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getRoomDetails(roomCode);
        setRoom(data);
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomCode]);

  return { room, loading };
};
