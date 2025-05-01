import React, { useState, useEffect, useRef } from "react";
import VolumeControl from "./VolumeControl";
import { mixAudioTracks } from "../utils/audioMixer";

const TrackMixer = ({ loops, onToggle, onVolumeChange }) => {
  const [activeLoops, setActiveLoops] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const audioRefs = useRef({});
  const blobUrls = useRef({});

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
              // Store previous volume when muting to restore when unmuting
              previousVolume: loop.enabled
                ? loop.volume
                : loop.previousVolume || 1.0,
              volume: loop.enabled ? 0 : loop.previousVolume || 1.0,
            }
          : loop
      )
    );
    onToggle(id);
  };

  const handleVolumeChange = (id, volume) => {
    setActiveLoops((prev) =>
      prev.map((loop) =>
        loop.id === id || loop._id === id ? { ...loop, volume } : loop
      )
    );
    onVolumeChange(id, volume);
  };

  // Handle audio source safely
  const getAudioSource = (loop) => {
    const id = loop.id || loop._id;

    // If it's a server URL
    if (loop.audioUrl && !loop.audioUrl.startsWith("blob:")) {
      return `http://localhost:5000${loop.audioUrl}`;
    }

    // If it's a blob URL, ensure we don't create duplicates
    if (loop.blob) {
      // Revoke old URL if it exists
      if (blobUrls.current[id]) {
        URL.revokeObjectURL(blobUrls.current[id]);
      }
      // Create new URL
      blobUrls.current[id] = URL.createObjectURL(loop.blob);
      return blobUrls.current[id];
    }

    // Return existing blob URL if we have it
    if (blobUrls.current[id]) {
      return blobUrls.current[id];
    }

    // Fallback to whatever URL we have
    return loop.audioUrl;
  };

  // Export mixdown function
  // Export mixdown function
  const handleExportMixdown = async () => {
    try {
      setIsExporting(true);
      
      // Get all audio elements that are currently active
      const audioElements = [];
      const volumeLevels = {};
      
      activeLoops.forEach((loop, index) => {
        const id = loop.id || loop._id;
        if (loop.enabled && audioRefs.current[id]) {
          audioElements.push(audioRefs.current[id]);
          volumeLevels[index] = {
            volume: loop.volume,
            muted: !loop.enabled
          };
        }
      });
      
      if (audioElements.length === 0) {
        alert('No active tracks to export. Please enable at least one track.');
        setIsExporting(false);
        return;
      }
      
      // Check if all audio elements are loaded
      const notLoadedAudio = audioElements.filter(el => el.readyState < 3 || !el.duration);
      if (notLoadedAudio.length > 0) {
        alert('Some audio tracks are still loading. Please wait a moment and try again.');
        setIsExporting(false);
        return;
      }
      
      // Mix the tracks
      const mixedAudio = await mixAudioTracks(audioElements, volumeLevels);
      
      // Create download link
      const downloadUrl = URL.createObjectURL(mixedAudio);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `mixdown-${new Date().toISOString().slice(0, 10)}.wav`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {activeLoops.length === 0 ? (
        <p>No loops available yet. Record your first loop!</p>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Track Mixer</h3>
            <button
              onClick={handleExportMixdown}
              disabled={isExporting}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isExporting ? "Exporting..." : "Export Mixdown"}
            </button>
          </div>
          
          {activeLoops.map((loop) => {
            const id = loop.id || loop._id;
            const audioSrc = getAudioSource(loop);
            
            return (
              <div key={id} className="flex items-center space-x-4 p-2 border rounded">
                <audio
                  ref={(el) => (audioRefs.current[id] = el)}
                  src={audioSrc}
                  loop
                  controls
                  className="w-full"
                />
                <div className="flex items-center space-x-2">
                  <VolumeControl
                    volume={loop.volume}
                    onChange={(vol) => handleVolumeChange(id, vol)}
                    disabled={!loop.enabled}
                  />
                  <button
                    onClick={() => handleToggle(id)}
                    className={`px-2 py-1 rounded ${loop.enabled ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                  >
                    {loop.enabled ? "Mute" : "Unmute"}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default TrackMixer;
