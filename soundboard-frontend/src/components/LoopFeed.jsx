import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const LoopFeed = ({ loops, onLoopClick }) => {
  // State to track which loops have been newly added for animation
  const [newLoopIds, setNewLoopIds] = useState([]);
  
  // Track displayed loop IDs to avoid duplicates
  const [displayedLoopIds, setDisplayedLoopIds] = useState(new Set());
  
  // Filtered loops to display (removing duplicates)
  const [displayedLoops, setDisplayedLoops] = useState([]);

  // Update displayed loops when new loops come in
  useEffect(() => {
    if (!loops || loops.length === 0) return;
    
    // Filter out loops we've already displayed
    const newLoops = loops.filter(loop => !displayedLoopIds.has(loop._id || loop.id));
    if (newLoops.length === 0) return;
    
    // Add new loops to the displayed set
    const updatedIds = new Set(displayedLoopIds);
    const newIds = [];
    
    newLoops.forEach(loop => {
      const loopId = loop._id || loop.id;
      updatedIds.add(loopId);
      newIds.push(loopId);
    });
    
    // Update displayed loops
    setDisplayedLoops(prev => [...newLoops, ...prev]);
    setDisplayedLoopIds(updatedIds);
    
    // Mark these loops as new for animation
    setNewLoopIds(newIds);
    
    // Remove the 'new' status after animation completes
    const timer = setTimeout(() => {
      setNewLoopIds([]);
    }, 2000); // Match this with your CSS animation duration
    
    return () => clearTimeout(timer);
  }, [loops]);

  // Update relative timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update relative timestamps
      setDisplayedLoops([...displayedLoops]);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [displayedLoops]);

  if (!displayedLoops.length) {
    return (
      <div className="empty-feed">
        <p>No loops have been recorded yet. Be the first to add one!</p>
      </div>
    );
  }

  return (
    <div className="loop-feed">
      <h3 className="mb-4">Recent Recordings</h3>
      <div className="loop-list">
        {displayedLoops.map(loop => {
          const loopId = loop._id || loop.id;
          const isNew = newLoopIds.includes(loopId);
          const timestamp = new Date(loop.timestamp || loop.createdAt);
          const userName = loop.user?.name || 'Anonymous';
          
          return (
            <div 
              key={loopId} 
              className={`loop-item ${isNew ? 'loop-item-new' : ''}`}
              onClick={() => onLoopClick(loop)}
            >
              <div className="loop-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="loop-content">
                <div className="loop-header">
                  <span className="loop-user">{userName}</span>
                  <span className="loop-time">{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
                </div>
                <div className="loop-name">{loop.trackName || loop.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoopFeed;