import React from "react";

const UserProfileStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="stats-container">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stats-card loading">
            <div className="stats-loading-placeholder"></div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      value: stats?.totalRoomsHosted || 0,
      label: "Rooms Hosted",
      icon: "🎵"
    },
    {
      value: stats?.totalLoops || 0,
      label: "Loops Recorded",
      icon: "🔄"
    },
    {
      value: stats?.totalMixdowns || 0,
      label: "Mixdowns",
      icon: "💿"
    },
    {
      value: stats?.averageLoopsPerSession || 0,
      label: "Avg Loops/Session",
      icon: "📊"
    }
  ];

  return (
    <div className="profile-stats">
      {statItems.map((item, index) => (
        <div key={index} className="stats-card">
          <div className="stats-icon">{item.icon}</div>
          <h3>{item.value}</h3>
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default UserProfileStats;
