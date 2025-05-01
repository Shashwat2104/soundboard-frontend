import React, { useEffect, useState } from "react";
import UserProfileStats from "../components/UserProfileStats";
import { getUserStats } from "../utils/api";

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserStats(user.id);
        setStats(data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (!user) {
    return <p className="p-4">Please log in to view your profile.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {stats ? <UserProfileStats stats={stats} /> : <p>Loading stats...</p>}
    </div>
  );
};

export default Profile;
