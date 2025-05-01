import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import VolumeControl from "./VolumeControl";
import { mixAudioTracks } from "../utils/audioMixer";
import { saveExportRecord } from "../utils/api";

const TrackMixer = ({
  loops,
  onToggle = () => {}, // Add default empty function
  onVolumeChange,
  onMuteTrack,
  onSoloTrack,
  onDeleteTrack,
}) => {
  const [activeLoops, setActiveLoops] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("wav");
  const audioRefs = useRef({});
  const blobUrls = useRef({});
  const [soloTrackIds, setSoloTrackIds] = useState([]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all blob URLs when component unmounts
      Object.values(blobUrls.current).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Update activeLoops when loops prop changes
  useEffect(() => {
    // Create a map of existing loops to preserve audio elements
    const existingLoopsMap = {};
    activeLoops.forEach((loop) => {
      existingLoopsMap[loop.id || loop._id] = loop;
    });

    setActiveLoops(
      loops.map((loop) => ({
        ...loop,
        enabled: existingLoopsMap[loop.id || loop._id]?.enabled ?? true,
        volume: existingLoopsMap[loop.id || loop._id]?.volume ?? 1.0,
      }))
    );
  }, [loops]);

  const handleToggle = (id) => {
    setActiveLoops((prev) =>
      prev.map((loop) =>
        loop.id === id || loop._id === id
          ? {
              ...loop,
              enabled: !loop.enabled,
              muted: !loop.enabled, // Sync muted state with enabled state
              previousVolume: loop.enabled
                ? loop.volume
                : loop.previousVolume || 1.0,
              volume: loop.enabled ? 0 : loop.previousVolume || 1.0,
            }
          : loop
      )
    );
    if (onToggle) {
      onToggle(id);
    }
  };

  // Handle audio source safely
  const getAudioSource = (loop) => {
    const id = loop.id || loop._id;

    // If it's a server URL
    if (loop.audioUrl && !loop.audioUrl.startsWith("blob:")) {
      return `http://localhost:5000${loop.audioUrl}`;
    }

    // If it's a blob URL, ensure we don't create duplicates
    if (loop.audioBlob) {
      // Revoke old URL if it exists
      if (blobUrls.current[id]) {
        URL.revokeObjectURL(blobUrls.current[id]);
      }
      // Create new URL
      blobUrls.current[id] = URL.createObjectURL(loop.audioBlob);
      return blobUrls.current[id];
    }

    // Return existing blob URL if we have it
    if (blobUrls.current[id]) {
      return blobUrls.current[id];
    }

    // Fallback to whatever URL we have
    return loop.audioUrl;
  };

  const handleExportMixdown = async () => {
    try {
      setIsExporting(true);

      // Get all audio elements that are currently active
      const audioElements = [];
      const volumeLevels = {};

      activeLoops.forEach((loop, index) => {
        const id = loop.id || loop._id;
        // Check both enabled and not muted
        if (loop.enabled && !loop.muted && audioRefs.current[id]) {
          audioElements.push(audioRefs.current[id]);
          volumeLevels[index] = {
            volume: loop.volume,
            muted: false,
          };
        }
      });

      if (audioElements.length === 0) {
        toast.warning(
          "No active tracks to export. Please enable at least one track."
        );
        setIsExporting(false);
        return;
      }

      // Check if all audio elements are loaded
      const notLoadedAudio = audioElements.filter(
        (el) => el.readyState < 3 || !el.duration
      );
      if (notLoadedAudio.length > 0) {
        toast.warning(
          "Some audio tracks are still loading. Please wait a moment and try again."
        );
        setIsExporting(false);
        return;
      }

      toast.info(`Preparing ${exportFormat.toUpperCase()} mixdown...`);

      // Mix the tracks with selected format
      const mixedAudio = await mixAudioTracks(
        audioElements,
        volumeLevels,
        exportFormat
      );

      // Create download link
      const downloadUrl = URL.createObjectURL(mixedAudio);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `mixdown-${new Date()
        .toISOString()
        .slice(0, 10)}.${exportFormat}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      }, 100);

      toast.success(
        `Mixdown exported successfully as ${exportFormat.toUpperCase()}!`
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSoloToggle = (trackId) => {
    let newSoloIds;
    if (soloTrackIds.includes(trackId)) {
      newSoloIds = soloTrackIds.filter((id) => id !== trackId);
    } else {
      newSoloIds = [...soloTrackIds, trackId];
    }
    setSoloTrackIds(newSoloIds);
    onSoloTrack(trackId);
  };

  const handleVolumeChange = (id, volume) => {
    setActiveLoops((prev) =>
      prev.map((loop) =>
        loop.id === id || loop._id === id ? { ...loop, volume } : loop
      )
    );
    onVolumeChange(id, volume);
  };
  
  return (
    <div className="mixer-container fade-in">
      <h3 className="mb-4">Track Mixer</h3>
      {loops.length === 0 ? (
        <div className="text-center text-gray-500 p-6">
          <p>No tracks added yet. Record or upload a track to get started.</p>
        </div>
      ) : (
        <div className="tracks-list">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button
                onClick={handleExportMixdown}
                disabled={isExporting}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-2 flex items-center"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  "Export Mixdown"
                )}
              </button>

              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-2 py-2 border rounded"
              >
                <option value="wav">WAV</option>
                <option value="mp3">MP3</option>
              </select>
            </div>
          </div>
          {activeLoops.map((loop) => {
            const id = loop.id || loop._id;
            const audioSrc = getAudioSource(loop);

            return (
              <div key={id} className="track hover-lift">
                <audio
                  ref={(el) => {
                    if (el) audioRefs.current[id] = el;
                  }}
                  src={audioSrc}
                  preload="auto"
                  style={{ display: "none" }}
                />
                <div className="flex-1">
                  <div className="track-title font-bold mb-1">{loop.name}</div>
                  <VolumeControl
                    volume={loop.volume}
                    onChange={(value) => handleVolumeChange(id, value)}
                  />
                </div>
                <div className="track-controls">
                  <button
                    className={`btn ${
                      loop.muted ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => handleToggle(id)}
                    title={loop.muted ? "Unmute" : "Mute"}
                  >
                    {loop.muted ? "M" : "M"}
                  </button>
                  <button
                    className={`btn ${
                      soloTrackIds.includes(id) ? "btn-accent" : "btn-outline"
                    }`}
                    onClick={() => handleSoloToggle(id)}
                    title="Solo"
                  >
                    S
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onDeleteTrack(id)}
                    title="Delete"
                  >
                    X
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackMixer;

// After handleToggle or handleSoloToggle function

