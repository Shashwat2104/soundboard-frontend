const API_URL = "https://soundboard-backend-ajwe.onrender.com/";

export const apiCall = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  });

  try {
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Something went wrong");
    }
    return result;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      // Handle HTML response
      throw new Error(`API returned invalid JSON for ${endpoint}`);
    }
    throw error;
  }
};

export const loginUser = (credentials) =>
  apiCall("auth/login", "POST", credentials);
export const registerUser = (userData) =>
  apiCall("auth/register", "POST", userData);
export const createRoom = (roomData) => apiCall("rooms", "POST", roomData);
export const createJamRoom = (roomData) =>
  apiCall("rooms/jam", "POST", roomData);
export const getRooms = () => apiCall("rooms");
export const getPublicRooms = () => apiCall("rooms/public");
export const getRoomDetails = (roomCode) => apiCall(`rooms/${roomCode}`);
export const getRoomLoops = (roomCode, since = null) => {
  const params = since ? `?since=${new Date(since).toISOString()}` : "";
  return apiCall(`rooms/${roomCode}/loops${params}`);
};
export const pollRoomLoops = (roomCode, callback, interval = 5000) => {
  let lastUpdated = new Date().toISOString();

  const poll = async () => {
    try {
      const { loops, timestamp } = await getRoomLoops(roomCode, lastUpdated);
      if (loops && loops.length > 0) {
        callback(loops);
        lastUpdated = timestamp || new Date().toISOString();
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  };

  const intervalId = setInterval(poll, interval);
  return () => clearInterval(intervalId);
};

export const saveLoop = (roomCode, formData) => {
  // For FormData, we need a different approach than JSON
  const token = localStorage.getItem("token");
  return fetch(`${API_URL}/rooms/${roomCode}/loops`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((err) => {
        throw new Error(err.message || "Something went wrong");
      });
    }
    return response.json();
  });
};
export const getUserData = () => apiCall("user/me");
export const getUserStats = (userId) => apiCall(`users/${userId}/stats`);
