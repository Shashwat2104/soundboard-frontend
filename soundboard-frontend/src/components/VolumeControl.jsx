import React from "react";

const VolumeControl = ({ volume = 1, onChange, disabled = false }) => {
  const handleChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    onChange(newVolume);
  };

  return (
    <div className="volume-control">
      <span className="text-sm">🔈</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleChange}
        disabled={disabled}
        className="slider"
      />
      <span className="text-sm">{Math.round(volume * 100)}%</span>
    </div>
  );
};

export default VolumeControl;
