import React, { useRef, useEffect } from 'react';

const WaveformVisualizer = ({ level }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate bar properties
    const barCount = 30;
    const barWidth = width / barCount - 2;
    const maxBarHeight = height - 10;
    
    // Draw waveform bars
    ctx.fillStyle = level > 0.8 ? '#ff3b30' : '#007aff';
    
    for (let i = 0; i < barCount; i++) {
      // Generate a random height based on the level
      // Higher in the middle, lower at the edges for a waveform look
      const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
      const randomFactor = Math.random() * 0.3 + 0.7; // 0.7-1.0 random factor
      const barHeight = level * maxBarHeight * (1 - centerDistance * 0.5) * randomFactor;
      
      const x = i * (barWidth + 2) + 1;
      const y = (height - barHeight) / 2;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    }
    
    // Draw level indicator
    const indicatorWidth = 50;
    const indicatorHeight = 10;
    ctx.fillStyle = level > 0.8 ? '#ff3b30' : level > 0.5 ? '#ffcc00' : '#34c759';
    ctx.fillRect(width - indicatorWidth - 10, 10, indicatorWidth * level, indicatorHeight);
    ctx.strokeStyle = '#999';
    ctx.strokeRect(width - indicatorWidth - 10, 10, indicatorWidth, indicatorHeight);
    
  }, [level]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={100} 
      className="w-full rounded border"
    />
  );
};

export default WaveformVisualizer;