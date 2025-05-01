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
// Update your existing mixAudioTracks function
export const mixAudioTracks = async (audioElements, volumeLevels = {}, format = 'wav') => {
  try {
    // Convert HTML audio elements to blobs
    const audioBlobs = await Promise.all(
      audioElements.map(async (audio) => {
        // If we already have a blob, use it
        if (audio.blob) return audio.blob;
        
        // Otherwise fetch the audio file
        const response = await fetch(audio.src);
        return await response.blob();
      })
    );
    
    // Mix the audio
    const mixedBuffer = await mixAudio(audioBlobs, volumeLevels);
    
    // Return in requested format
    if (format.toLowerCase() === 'mp3') {
      try {
        // Try MP3 conversion
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await mixedBuffer.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return convertToMP3(audioBuffer);
      } catch (error) {
        console.warn('MP3 conversion failed, falling back to WAV:', error);
        return mixedBuffer; // Return WAV as fallback
      }
    }
    
    // Default to WAV
    return mixedBuffer;
  } catch (error) {
    console.error('Error in mixAudioTracks:', error);
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

// Replace the import at line 246
// import lamejs from 'lamejs';

// With a dynamic import or conditional check
function convertToMP3(audioBuffer, bitRate = 128) {
  // Check if lamejs is available
  if (typeof window.lamejs === 'undefined') {
    console.warn('lamejs library not found. Falling back to WAV format.');
    return bufferToWav(audioBuffer);
  }
  
  const channels = [];
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  
  // Extract channels
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  // Create MP3 encoder
  const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, bitRate);
  const mp3Data = [];
  
  // Process in chunks to avoid memory issues
  const sampleBlockSize = 1152;
  const samples = new Int16Array(sampleBlockSize * numChannels);
  
  for (let i = 0; i < channels[0].length; i += sampleBlockSize) {
    // Convert float32 to int16
    for (let j = 0; j < sampleBlockSize; j++) {
      if (i + j < channels[0].length) {
        // Handle mono or stereo
        if (numChannels === 1) {
          const val = Math.max(-1, Math.min(1, channels[0][i + j]));
          samples[j] = val < 0 ? val * 0x8000 : val * 0x7FFF;
        } else {
          const left = Math.max(-1, Math.min(1, channels[0][i + j]));
          const right = Math.max(-1, Math.min(1, channels[1][i + j]));
          samples[j * 2] = left < 0 ? left * 0x8000 : left * 0x7FFF;
          samples[j * 2 + 1] = right < 0 ? right * 0x8000 : right * 0x7FFF;
        }
      }
    }
    
    // Encode
    let mp3buf;
    if (numChannels === 1) {
      mp3buf = mp3encoder.encodeBuffer(samples);
    } else {
      // For stereo, we need to separate left and right channels
      const left = new Int16Array(sampleBlockSize);
      const right = new Int16Array(sampleBlockSize);
      
      for (let j = 0; j < sampleBlockSize; j++) {
        if (j < samples.length / 2) {
          left[j] = samples[j * 2];
          right[j] = samples[j * 2 + 1];
        }
      }
      
      mp3buf = mp3encoder.encodeBuffer(left, right);
    }
    
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }
  
  // Finalize
  const end = mp3encoder.flush();
  if (end.length > 0) {
    mp3Data.push(end);
  }
  
  // Combine chunks
  const blob = new Blob(mp3Data, { type: 'audio/mp3' });
  return blob;
}

// Mock implementation for testing
export const mockMixAudioTracks = async (audioElements, volumeLevels = {}, format = 'wav') => {
  return new Promise((resolve) => {
    console.log(`Mixing ${audioElements.length} tracks with format: ${format}`);
    console.log('Volume levels:', volumeLevels);
    
    // Simulate processing time
    setTimeout(() => {
      // Create a dummy blob
      const dummyContent = new Uint8Array([0, 1, 2, 3, 4, 5]);
      const blob = new Blob([dummyContent], { type: format === 'mp3' ? 'audio/mp3' : 'audio/wav' });
      resolve(blob);
    }, 2000); // 2 second delay to simulate processing
  });
};
