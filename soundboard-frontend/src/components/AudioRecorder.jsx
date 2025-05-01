import React, { useState, useRef, useEffect } from "react";

const AudioRecorder = ({ onSave }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loopName, setLoopName] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const audioRef = useRef();
  const timerRef = useRef();

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      // Clean up previous URL if exists
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => setChunks((prev) => [...prev, e.data]);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const newAudioURL = URL.createObjectURL(blob);
        setAudioURL(newAudioURL);
        audioRef.current.src = newAudioURL;
        onSave({ blob, name: loopName });
        setChunks([]);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  return (
    <div className="p-4 border rounded">
      <input
        type="text"
        placeholder="Loop Name"
        className="p-2 border mb-2 w-full"
        value={loopName}
        onChange={(e) => setLoopName(e.target.value)}
      />
      <button
        onClick={recording ? stopRecording : startRecording}
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={!loopName}
      >
        {recording ? `Stop (${30 - elapsedTime}s)` : "Record"}
      </button>
      <audio ref={audioRef} controls className="mt-4 w-full" />
    </div>
  );
};

export default AudioRecorder;
