import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">NIS WEAR</h1>
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-blue-500 h-24 w-24"></div>
    </div>
  );
};

export default Loader;
