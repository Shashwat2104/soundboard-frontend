import React from "react";

const Loader = () => {
  return (
    <div className="text-center py-10">
      <div className="loader border-t-4 border-blue-500 w-10 h-10 rounded-full animate-spin mx-auto"></div>
      <p className="mt-4">Loading...</p>
    </div>
  );
};

export default Loader;
