import { useState, useEffect, useRef } from 'react';

// Mock data for testing
const MOCK_USERS = [
  { _id: 'user1', name: 'Alice' },
  { _id: 'user2', name: 'Bob' },
  { _id: 'user3', name: 'Charlie' },
];

const generateMockLoop = (index) => ({
  _id: `loop-${Date.now()}-${index}`,
  trackName: `Loop ${index}`,
  user: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
  timestamp: new Date().toISOString(),
  audioUrl: '/path/to/mock-audio.mp3'
});

export const useLoopPolling = (roomCode) => {
  const [loops, setLoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For mock implementation
  const mockCountRef = useRef(0);
  
  useEffect(() => {
    if (!roomCode) return;
    
    let isMounted = true;
    let timeoutId = null;
    
    // Mock polling function
    const mockPoll = () => {
      // Simulate loading
      setLoading(true);
      
      // 70% chance of getting new loops
      const shouldAddLoop = Math.random() < 0.7;
      
      setTimeout(() => {
        if (!isMounted) return;
        
        if (shouldAddLoop) {
          // Add 1-3 new loops
          const numNewLoops = Math.floor(Math.random() * 3) + 1;
          const newLoops = [];
          
          for (let i = 0; i < numNewLoops; i++) {
            mockCountRef.current += 1;
            newLoops.push(generateMockLoop(mockCountRef.current));
          }
          
          setLoops(prev => [...newLoops, ...prev]);
        }
        
        setLoading(false);
        
        // Schedule next poll
        timeoutId = setTimeout(mockPoll, 5000);
      }, 1000); // Simulate network delay
    };
    
    // Initial mock data
    setTimeout(() => {
      if (isMounted) {
        const initialLoops = [];
        for (let i = 0; i < 5; i++) {
          mockCountRef.current += 1;
          initialLoops.push(generateMockLoop(mockCountRef.current));
        }
        setLoops(initialLoops);
        setLoading(false);
        
        // Start polling
        timeoutId = setTimeout(mockPoll, 5000);
      }
    }, 1500);
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [roomCode]);
  
  return { loops, loading, error };
};