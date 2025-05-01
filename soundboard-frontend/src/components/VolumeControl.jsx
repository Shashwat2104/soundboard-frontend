import React from "react";

const VolumeControl = ({ volume, onChange }) => {
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={volume}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-32"
    />
  );
};

export default VolumeControl;
