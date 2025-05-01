// IndexedDB configuration
const DB_NAME = 'SoundBoardDB';
const DB_VERSION = 1;
const LOOPS_STORE = 'loops';

// Open database connection
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(`Database error: ${event.target.error}`);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store for loops if it doesn't exist
      if (!db.objectStoreNames.contains(LOOPS_STORE)) {
        const store = db.createObjectStore(LOOPS_STORE, { keyPath: 'id', autoIncrement: true });
        
        // Create indexes
        store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
        store.createIndex('orderIndex', 'metadata.orderIndex', { unique: false });
        store.createIndex('trackName', 'metadata.trackName', { unique: false });
      }
    };
  });
};

// Save loop to IndexedDB
export const saveLoopToIndexedDB = async (loop) => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([LOOPS_STORE], 'readwrite');
      const store = transaction.objectStore(LOOPS_STORE);
      
      // Add loop to store
      const request = store.add(loop);
      
      request.onsuccess = (event) => {
        // Return the generated ID
        resolve(`loop-${event.target.result}`);
      };
      
      request.onerror = (event) => {
        reject(`Error saving loop: ${event.target.error}`);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    throw error;
  }
};

// Get loop by ID
export const getLoopFromIndexedDB = async (id) => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([LOOPS_STORE], 'readonly');
      const store = transaction.objectStore(LOOPS_STORE);
      
      // Get numeric ID from string ID (e.g., 'loop-123' -> 123)
      const numericId = parseInt(id.replace('loop-', ''));
      
      const request = store.get(numericId);
      
      request.onsuccess = (event) => {
        const loop = event.target.result;
        if (loop) {
          resolve({
            id: `loop-${numericId}`,
            ...loop
          });
        } else {
          reject(`Loop with ID ${id} not found`);
        }
      };
      
      request.onerror = (event) => {
        reject(`Error getting loop: ${event.target.error}`);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    throw error;
  }
};

// Get all loops
export const getAllLoopsFromIndexedDB = async () => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([LOOPS_STORE], 'readonly');
      const store = transaction.objectStore(LOOPS_STORE);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const loops = event.target.result.map(loop => ({
          id: `loop-${loop.id}`,
          ...loop
        }));
        resolve(loops);
      };
      
      request.onerror = (event) => {
        reject(`Error getting loops: ${event.target.error}`);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    throw error;
  }
};

// Delete loop by ID
export const deleteLoopFromIndexedDB = async (id) => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([LOOPS_STORE], 'readwrite');
      const store = transaction.objectStore(LOOPS_STORE);
      
      // Get numeric ID from string ID
      const numericId = parseInt(id.replace('loop-', ''));
      
      const request = store.delete(numericId);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        reject(`Error deleting loop: ${event.target.error}`);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    throw error;
  }
};

// Get the next order index
export const getNextLoopIndex = async () => {
  try {
    const loops = await getAllLoopsFromIndexedDB();
    
    if (loops.length === 0) {
      return 0;
    }
    
    // Find the highest order index
    const highestIndex = loops.reduce((max, loop) => {
      const orderIndex = loop.metadata?.orderIndex || 0;
      return orderIndex > max ? orderIndex : max;
    }, 0);
    
    return highestIndex + 1;
  } catch (error) {
    console.error('Error getting next loop index:', error);
    return 0;
  }
};