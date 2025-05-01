import React, { useState, useRef } from "react";

const AudioRecorder = ({ onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [trackName, setTrackName] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks on the stream to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSave = () => {
    if (audioBlob && trackName.trim()) {
      onSave({
        name: trackName.trim(),
        blob: audioBlob,
      });
      // Reset after saving
      setAudioBlob(null);
      setTrackName("");
    }
  };

  const handleDiscard = () => {
    setAudioBlob(null);
    setTrackName("");
  };

  return (
    <div className="recorder slide-in-up">
      <h3 className="mb-4">Record Audio</h3>
      
      {!audioBlob ? (
        <div className="text-center">
          <button 
            onClick={isRecording ? stopRecording : startRecording} 
            className={`record-btn mb-4 mx-auto ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? "■" : "●"}
          </button>
          <p className="text-sm text-gray-600">
            {isRecording ? "Recording in progress..." : "Click to start recording"}
          </p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mb-4" />
          
          <div className="form-group">
            <label htmlFor="trackName">Track Name</label>
            <input
              type="text"
              id="trackName"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="Enter a name for your track"
              className="mb-4"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={!trackName.trim()} 
              className="btn btn-primary flex-1"
            >
              Save Track
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

export default AudioRecorder;
