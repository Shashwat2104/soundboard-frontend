import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import TrackMixer from "../components/TrackMixer";
import AudioRecorder from "../components/AudioRecorder";
import LoopFeed from "../components/LoopFeed";
import Loader from "../components/Loader";
import { getRoomDetails, uploadTrack } from "../utils/api";
import { useLoopPolling } from "../hooks/useLoopPolling";
import { useAuth } from "../hooks/useAuth";
import LoopRecorder from "../components/LoopRecorder";

const RoomDetails = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  // Use our custom polling hook
  const {
    loops,
    loading: loopsLoading,
    error: loopsError,
  } = useLoopPolling(roomCode);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const roomData = await getRoomDetails(roomCode);
        setRoom(roomData);
        setTracks(roomData.tracks || []);
      } catch (err) {
        setError("Failed to load room details");
        toast.error("Failed to load room details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomCode]);

  // Handle loop click - add it to tracks if not already there
  const handleLoopClick = (loop) => {
    const loopId = loop._id || loop.id;
    const exists = tracks.some((track) => (track._id || track.id) === loopId);

    if (!exists) {
      setTracks((prev) => [...prev, loop]);
      toast.info(`Added "${loop.trackName || loop.name}" to mixer`);
    } else {
      toast.info("This loop is already in your mixer");
    }
  };

  const handleSaveTrack = async (trackData) => {
    if (!room) {
      setError("Cannot save track: Room data not loaded");
      toast.error("Cannot save track: Room data not loaded");
      return;
    }

    // Check if user is null or undefined
    if (!user) {
      setError("Cannot save track: User not logged in");
      toast.error("Please log in to save tracks");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", trackData.metadata?.trackName || trackData.name);
      
      // Use audioBlob instead of blob
      if (!trackData.audioBlob) {
        throw new Error("No audio data available");
      }
      formData.append("file", trackData.audioBlob);
      
      formData.append("roomId", room._id);
      formData.append("userId", user.id);
  
      const newTrack = await uploadTrack(roomCode, formData);
      setTracks([...tracks, newTrack]);
      toast.success("Track uploaded successfully!");
    } catch (err) {
      setError("Failed to upload track");
      toast.error(err.message || "Failed to upload track");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVolumeChange = (trackId, volume) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, volume } : track
      )
    );
  };

  const handleMuteTrack = (trackId) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    );
  };

  const handleSoloTrack = (trackId) => {
    // Logic for soloing a track will be implemented here
    console.log("Solo track", trackId);
  };

  const handleDeleteTrack = (trackId) => {
    setTracks(tracks.filter((track) => track.id !== trackId));
    // API call to delete track would be implemented here
  };

  if (loading && !room) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-error text-light p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-3">Error</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary mt-4 inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-6 text-center">
        <div className="bg-warning text-dark p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-3">Room Not Found</h2>
          <p>
            The room you're looking for doesn't exist or you don't have access.
          </p>
          <Link to="/" className="btn btn-primary mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="room-details fade-in">
      {/* Room header section */}
      <div className="bg-primary text-light mb-8 py-8 shadow-lg">
        <div className="container">
          <h1 className="text-3xl font-bold mb-4">{room.name}</h1>
          <div className="flex gap-6 text-md">
            <div className="flex items-center bg-primary-dark px-4 py-2 rounded-full">
              <span className="mr-2">🎵</span>
              <span>
                <strong>BPM:</strong> {room.bpm}
              </span>
            </div>
            <div className="flex items-center bg-primary-dark px-4 py-2 rounded-full">
              <span className="mr-2">🎹</span>
              <span>
                <strong>Key:</strong> {room.keySignature}
              </span>
            </div>
            <div className="flex items-center bg-primary-dark px-4 py-2 rounded-full">
              <span className="mr-2">👤</span>
              <span>
                <strong>Created by:</strong> {room.createdBy}
              </span>
            </div>
          </div>
          {room.description && (
            <p className="mt-4 max-w-2xl">{room.description}</p>
          )}
        </div>
      </div>

      <div className="container pb-10">
        <div
          className="grid"
          style={{ gridTemplateColumns: "2fr 1fr", gap: "2rem" }}
        >
          <div>
            <TrackMixer
              loops={tracks}
              onVolumeChange={handleVolumeChange}
              onMuteTrack={handleMuteTrack}
              onSoloTrack={handleSoloTrack}
              onDeleteTrack={handleDeleteTrack}
            />
          </div>

          <div>
            <div>
              <LoopRecorder onSave={handleSaveTrack} />

              <LoopFeed loops={loops} onLoopClick={handleLoopClick} />
            </div>

            <div className="card p-6 mt-6 bg-gray-100">
              <h3 className="font-bold mb-3">Room Information</h3>
              <p className="text-sm mb-2">
                Share this code with friends to invite them to your jam session:
              </p>
              <div className="bg-light p-3 rounded-md text-center font-bold text-primary border border-primary">
                {roomCode}
              </div>
              <button
                className="btn btn-outline w-full mt-3"
                onClick={() => navigator.clipboard.writeText(roomCode)}
              >
                Copy Room Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
