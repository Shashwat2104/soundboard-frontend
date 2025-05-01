import React from "react";

const UserProfileStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4 text-center p-4 bg-gray-100 rounded">
      <div>
        <p className="text-lg font-bold">{stats.totalRoomsHosted}</p>
        <p>Rooms Hosted</p>
      </div>
      <div>
        <p className="text-lg font-bold">{stats.totalLoops}</p>
        <p>Loops Recorded</p>
      </div>
      <div>
        <p className="text-lg font-bold">{stats.totalMixdowns}</p>
        <p>Mixdowns</p>
      </div>
      <div>
        <p className="text-lg font-bold">{stats.averageLoopsPerSession}</p>
        <p>Avg Loops/Session</p>
      </div>
    </div>
  );
};

export default UserProfileStats;
