import React, { useState, useRef, useEffect } from "react";
import { saveLoopToIndexedDB, getNextLoopIndex } from "../utils/indexedDBStorage";
import WaveformVisualizer from "./WaveformVisualizer";

const LoopRecorder = ({ onSave, maxDuration = 30 }) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [trackName, setTrackName] = useState("");
  const [remainingTime, setRemainingTime] = useState(maxDuration);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [error, setError] = useState(null);
  const [hasMicPermission, setHasMicPermission] = useState(null);
  const [orderIndex, setOrderIndex] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Initialize order index
  useEffect(() => {
    const initOrderIndex = async () => {
      try {
        const nextIndex = await getNextLoopIndex();
        setOrderIndex(nextIndex);
        setTrackName(`Loop #${nextIndex + 1}`);
      } catch (err) {
        console.error("Error getting next loop index:", err);
        setTrackName(`Loop #1`);
      }
    };
    
    initOrderIndex();
  }, []);
  
  // Check for microphone permission
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setHasMicPermission(result.state === 'granted');
        
        // Listen for permission changes
        result.onchange = () => {
          setHasMicPermission(result.state === 'granted');
        };
      } catch (err) {
        // Fallback for browsers that don't support permissions API
        setHasMicPermission(null);
      }
    };
    
    checkMicPermission();
  }, []);
  
  // Setup audio analyzer for visualization
  const setupAudioAnalyzer = (stream) => {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    // Create analyzer
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    // Connect stream to analyzer
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    // Start visualization loop
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateMeter = () => {
      if (!isRecording) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalizedLevel = average / 255; // Normalize to 0-1
      
      setRecordingLevel(normalizedLevel);
      animationFrameRef.current = requestAnimationFrame(updateMeter);
    };
    
    updateMeter();
  };
  
  // Start recording function
  const startRecording = async () => {
    try {
      setError(null);
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 2 // Stereo recording
        } 
      });
      
      streamRef.current = stream;
      
      // Setup audio analyzer
      setupAudioAnalyzer(stream);
      
      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];
      
      // Handle data available
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      // Handle recording stop
      mediaRecorderRef.current.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Convert to WAV format
        const wavBlob = await convertToWav(audioBlob);
        setAudioBlob(wavBlob);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRemainingTime(maxDuration);
      
      // Start countdown timer
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      
      if (error.name === 'NotAllowedError') {
        setError("Microphone access denied. Please allow microphone access and try again.");
        setHasMicPermission(false);
      } else if (error.name === 'NotFoundError') {
        setError("No microphone found. Please connect a microphone and try again.");
      } else {
        setError(`Recording error: ${error.message}`);
      }
    }
  };
  
  // Convert audio blob to WAV format
  const convertToWav = async (audioBlob) => {
    // In a real implementation, you would convert the audio to WAV format here
    // For simplicity, we're just returning the original blob
    // You would typically use a library like audio-recorder-polyfill or web-audio-recorder-js
    return audioBlob;
  };
  
  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Save recording function
  const handleSave = async () => {
    if (audioBlob && trackName.trim()) {
      try {
        // Create loop object
        const loop = {
          audioBlob,
          metadata: {
            trackName: trackName.trim(),
            orderIndex,
            duration: maxDuration - remainingTime,
            timestamp: Date.now()
          }
        };
        
        // Save to IndexedDB
        const loopId = await saveLoopToIndexedDB(loop);
        
        // Call onSave callback with loop data
        onSave({
          id: loopId,
          ...loop
        });
        
        // Reset state
        setAudioBlob(null);
        setTrackName(`Loop #${orderIndex + 2}`);
        setOrderIndex(orderIndex + 1);
      } catch (err) {
        console.error("Error saving loop:", err);
        setError("Failed to save loop. Please try again.");
      }
    }
  };
  
  // Discard recording function
  const handleDiscard = () => {
    setAudioBlob(null);
    setError(null);
  };
  
  // Mock recording for testing when no microphone is available
  const startMockRecording = () => {
    setIsRecording(true);
    setRemainingTime(maxDuration);
    
    // Simulate recording level changes
    const mockLevelInterval = setInterval(() => {
      setRecordingLevel(Math.random() * 0.8);
    }, 100);
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // Stop mock recording
          setIsRecording(false);
          clearInterval(mockLevelInterval);
          clearInterval(timerRef.current);
          
          // Create a mock audio blob
          const mockAudioBlob = new Blob([
            // Empty audio data for mock
            new Uint8Array(1000).buffer
          ], { type: "audio/wav" });
          
          setAudioBlob(mockAudioBlob);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  return (
    <div className="loop-recorder slide-in-up">
      <h3 className="mb-4">Record Loop</h3>
      
      {error && (
        <div className="error-message mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
          {!hasMicPermission && (
            <button 
              onClick={startMockRecording}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Use Mock Recording
            </button>
          )}
        </div>
      )}
      
      {!audioBlob ? (
        <div className="recording-interface">
          <div className="visualization-container mb-4">
            {isRecording ? (
              <WaveformVisualizer level={recordingLevel} />
            ) : (
              <div className="empty-visualizer"></div>
            )}
          </div>
          
          <div className="timer-display mb-4 text-center">
            <div className="text-2xl font-bold">
              {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500">
              {isRecording ? "Recording..." : "Max 30 seconds"}
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={isRecording ? stopRecording : startRecording} 
              className={`record-btn mb-4 mx-auto ${isRecording ? 'recording' : ''}`}
              disabled={hasMicPermission === false && !isRecording}
            >
              {isRecording ? "■" : "●"}
            </button>
            <p className="text-sm text-gray-600">
              {isRecording ? "Click to stop recording" : "Click to start recording"}
            </p>
          </div>
          
          <div className="form-group mt-4">
            <label htmlFor="trackName">Track Name</label>
            <input
              type="text"
              id="trackName"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="Enter a name for your loop"
              className="w-full p-2 border rounded"
              disabled={isRecording}
            />
          </div>
        </div>
      ) : (
        <div className="playback-interface">
          <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mb-4" />
          
          <div className="form-group mb-4">
            <label htmlFor="trackName">Track Name</label>
            <input
              type="text"
              id="trackName"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="Enter a name for your loop"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={!trackName.trim()} 
              className="btn btn-primary flex-1"
            >
              Save Loop
            </button>
            <button 
              onClick={handleDiscard} 
              className="btn btn-outline flex-1"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoopRecorder;