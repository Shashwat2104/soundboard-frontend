// Create a function that returns a promise for mixing audio
export const mixAudio = async (audioBlobs, volumeLevels = {}) => {
  // Create URLs for cleanup later
  const urls = [];

  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const audioBuffers = await Promise.all(
      audioBlobs.map(async (blob, index) => {
        const url = URL.createObjectURL(blob);
        urls.push(url); // Store for cleanup

        // Convert blob to array buffer
        const arrayBuffer = await blob.arrayBuffer();
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return {
          buffer: audioBuffer,
          id: index,
          volume: volumeLevels[index]?.muted
            ? 0
            : volumeLevels[index]?.volume || 1.0,
          muted: volumeLevels[index]?.muted || false,
        };
      })
    );

    // Find the longest buffer duration
    const maxDuration = Math.max(
      ...audioBuffers.map((item) => item.buffer.duration)
    );

    // Create an offline context for rendering
    const offlineContext = new OfflineAudioContext(
      2, // stereo output
      audioContext.sampleRate * maxDuration,
      audioContext.sampleRate
    );

    // Create and connect sources
    audioBuffers.forEach((item) => {
      const source = offlineContext.createBufferSource();
      source.buffer = item.buffer;

      // Add volume control
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = item.muted ? 0 : item.volume;

      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      source.start(0);
    });

    // Render the audio
    const renderedBuffer = await offlineContext.startRendering();

    // Convert the rendered buffer to a blob
    const finalAudioData = exportWAV(renderedBuffer);
    const finalBlob = new Blob([finalAudioData], { type: "audio/wav" });

    return finalBlob;
  } catch (error) {
    console.error("Error mixing audio:", error);
    throw error;
  } finally {
    // Clean up all URLs
    urls.forEach((url) => URL.revokeObjectURL(url));
  }
};

// Helper function to convert AudioBuffer to WAV format
function exportWAV(audioBuffer) {
  const numOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Extract channels
  for (let i = 0; i < numOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  // Write WAV header
  setUint32(view, pos, 0x52494646); // "RIFF"
  pos += 4;
  setUint32(view, pos, 36 + length); // file length - 8
  pos += 4;
  setUint32(view, pos, 0x57415645); // "WAVE"
  pos += 4;
  setUint32(view, pos, 0x666d7420); // "fmt "
  pos += 4;
  setUint32(view, pos, 16); // format chunk length
  pos += 4;
  setUint16(view, pos, 1); // PCM format
  pos += 2;
  setUint16(view, pos, numOfChannels); // channels
  pos += 2;
  setUint32(view, pos, audioBuffer.sampleRate); // sample rate
  pos += 4;
  setUint32(view, pos, audioBuffer.sampleRate * 2 * numOfChannels); // byte rate
  pos += 4;
  setUint16(view, pos, numOfChannels * 2); // block align
  pos += 2;
  setUint16(view, pos, 16); // bits per sample
  pos += 2;
  setUint32(view, pos, 0x64617461); // "data"
  pos += 4;
  setUint32(view, pos, length); // data chunk length
  pos += 4;

  // Write interleaved audio data
  offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numOfChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return buffer;
}

// Helper functions for writing data to DataView
function setUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function setUint32(view, offset, value) {
  view.setUint32(offset, value, true);
}

// Audio mixer utility for combining multiple audio tracks

/**
 * Combines multiple audio tracks into a single audio file
 * @param {Array} audioElements - Array of audio elements or sources
 * @param {Object} volumeLevels - Object mapping track IDs to volume levels
 * @returns {Promise<Blob>} - Promise resolving to audio blob
 */
export const mixAudioTracks = async (audioElements, volumeLevels = {}) => {
  // Create audio context
  const offlineContext = new OfflineAudioContext({
    numberOfChannels: 2,
    length: 44100 * 60, // 60 seconds max at 44.1kHz
    sampleRate: 44100,
  });

  try {
    // First, ensure all audio elements are loaded
    await Promise.all(
      audioElements.map(element => {
        // If the audio is already loaded and has duration, no need to wait
        if (element.readyState >= 3 && element.duration > 0) {
          return Promise.resolve();
        }
        
        // Otherwise, wait for the audio to load
        return new Promise((resolve, reject) => {
          const loadHandler = () => {
            element.removeEventListener('loadeddata', loadHandler);
            element.removeEventListener('error', errorHandler);
            resolve();
          };
          
          const errorHandler = (err) => {
            element.removeEventListener('loadeddata', loadHandler);
            element.removeEventListener('error', errorHandler);
            reject(new Error(`Failed to load audio: ${err.message}`));
          };
          
          element.addEventListener('loadeddata', loadHandler);
          element.addEventListener('error', errorHandler);
          
          // If already loaded but event didn't fire
          if (element.readyState >= 3) {
            loadHandler();
          }
        });
      })
    );
    
    // Now process the loaded audio elements
    const audioBuffers = await Promise.all(
      audioElements.map(async (element, index) => {
        // Skip disabled tracks
        if (volumeLevels[index]?.muted || volumeLevels[index]?.volume === 0) {
          return null;
        }
        
        // Check if the audio has valid duration
        if (!element.duration || element.duration <= 0) {
          console.warn(`Audio element at index ${index} has no duration, skipping`);
          return null;
        }
        
        try {
          // Instead of using analyzer which doesn't capture the full audio,
          // fetch the audio data directly from the source
          const response = await fetch(element.src);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
          
          return {
            buffer: audioBuffer,
            id: index,
            volume: volumeLevels[index]?.muted ? 0 : (volumeLevels[index]?.volume || 1.0),
            muted: volumeLevels[index]?.muted || false
          };
        } catch (error) {
          console.error(`Error processing audio at index ${index}:`, error);
          return null;
        }
      })
    );

    // Filter out null buffers (disabled tracks or errors)
    const validBuffers = audioBuffers.filter(item => item !== null);
    
    if (validBuffers.length === 0) {
      throw new Error('No active audio tracks to mix');
    }

    // Find the longest buffer to determine output length
    const maxLength = Math.max(...validBuffers.map(item => item.buffer.length));

    // Create a new offline context with the correct length
    const finalContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: maxLength,
      sampleRate: 44100,
    });

    // Mix all tracks
    validBuffers.forEach(item => {
      const source = finalContext.createBufferSource();
      source.buffer = item.buffer;
      
      // Add volume control
      const gainNode = finalContext.createGain();
      gainNode.gain.value = item.muted ? 0 : item.volume;
      
      source.connect(gainNode);
      gainNode.connect(finalContext.destination);
      source.start(0);
    });

    // Render the final mix
    const renderedBuffer = await finalContext.startRendering();

    // Convert to WAV format
    const wavBlob = bufferToWav(renderedBuffer);
    return wavBlob;
  } catch (error) {
    console.error('Error mixing audio:', error);
    throw error;
  }
};

/**
 * Convert AudioBuffer to WAV format Blob
 * @param {AudioBuffer} buffer - Audio buffer to convert
 * @returns {Blob} - WAV file as blob
 */
function bufferToWav(buffer) {
  const numOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numOfChannels * 2;
  const sampleRate = buffer.sampleRate;
  const wavDataView = new DataView(new ArrayBuffer(44 + length));

  // RIFF identifier
  writeString(wavDataView, 0, 'RIFF');
  // File length
  wavDataView.setUint32(4, 36 + length, true);
  // RIFF type
  writeString(wavDataView, 8, 'WAVE');
  // Format chunk identifier
  writeString(wavDataView, 12, 'fmt ');
  // Format chunk length
  wavDataView.setUint32(16, 16, true);
  // Sample format (raw)
  wavDataView.setUint16(20, 1, true);
  // Channel count
  wavDataView.setUint16(22, numOfChannels, true);
  // Sample rate
  wavDataView.setUint32(24, sampleRate, true);
  // Byte rate (sample rate * block align)
  wavDataView.setUint32(28, sampleRate * 4, true);
  // Block align (channel count * bytes per sample)
  wavDataView.setUint16(32, numOfChannels * 2, true);
  // Bits per sample
  wavDataView.setUint16(34, 16, true);
  // Data chunk identifier
  writeString(wavDataView, 36, 'data');
  // Data chunk length
  wavDataView.setUint32(40, length, true);

  // Write the PCM samples
  const channels = [];
  for (let i = 0; i < numOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      // Convert float to int16
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      wavDataView.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([wavDataView], { type: 'audio/wav' });
}

/**
 * Write a string to a DataView at the specified offset
 */
function writeString(dataView, offset, string) {
  for (let i = 0; i < string.length; i++) {
    dataView.setUint8(offset + i, string.charCodeAt(i));
  }
}
