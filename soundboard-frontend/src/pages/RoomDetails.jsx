import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import AudioRecorder from "../components/AudioRecorder";
import TrackMixer from "../components/TrackMixer";
import { getRoomDetails, getRoomLoops, saveLoop, pollRoomLoops } from "../utils/api";
import { formatDistanceToNow } from 'date-fns';

const RoomDetails = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [loops, setLoops] = useState([]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomData = await getRoomDetails(roomCode);
        setRoom(roomData);
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    };

    fetchRoom();
  }, [roomCode]);

  // Handle new loops coming in from polling
  const handleNewLoops = useCallback((newLoops) => {
    setLoops(prevLoops => {
      // Create a map of existing loops by ID for quick lookup
      const loopMap = new Map(prevLoops.map(loop => [loop._id, loop]));
      
      // Add new loops to the map
      newLoops.forEach(loop => {
        loopMap.set(loop._id, loop);
      });
      
      // Convert map back to array and sort by timestamp
      return Array.from(loopMap.values())
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
  }, []);

  useEffect(() => {
    // Initial fetch of all loops
    const fetchLoops = async () => {
      try {
        const { loops: initialLoops } = await getRoomLoops(roomCode);
        setLoops(initialLoops || []);
      } catch (error) {
        console.error("Error fetching loops:", error);
      }
    };

    fetchLoops();
    
    // Set up polling for new loops
    const stopPolling = pollRoomLoops(roomCode, handleNewLoops, 5000);
    
    // Clean up polling on component unmount
    return () => stopPolling();
  }, [roomCode, handleNewLoops]);

  const handleSaveLoop = async ({ blob, name }) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob);
      formData.append("name", name);
      const newLoop = await saveLoop(roomCode, formData);
      handleNewLoops([newLoop]); // Add the new loop to the list
    } catch (error) {
      console.error("Error saving loop:", error);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="p-4">
      {room ? (
        <>
          <h2 className="text-2xl font-bold mb-4">{room.title}</h2>
          <p>BPM: {room.bpm}</p>
          <p>Key Signature: {room.keySignature}</p>
          <AudioRecorder onSave={handleSaveLoop} />
          
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-2">Tracks</h3>
            {loops.length > 0 ? (
              <div className="space-y-4">
                {loops.map(loop => (
                  <div key={loop._id} className="border p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{loop.trackName}</span>
                      <div className="text-sm text-gray-500">
                        <span>{loop.user?.name || 'Unknown'}</span>
                        <span className="ml-2">{formatTimestamp(loop.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No tracks recorded yet. Be the first!</p>
            )}
          </div>
          
          <TrackMixer
            loops={loops}
            onToggle={() => {}}
            onVolumeChange={() => {}}
          />
        </>
      ) : (
        <p>Loading room details...</p>
      )}
    </div>
  );
};

export default RoomDetails;
