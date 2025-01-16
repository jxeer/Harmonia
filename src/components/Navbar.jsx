import React from "react";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 h-16 shadow-md px-6">
      <div className="flex items-center">
        <img src="/images/harmonia-logo.png" alt="Logo" className="h-8" />
      </div>
      <div className="flex space-x-6">
        <a href="#home" className="text-gray-700 hover:text-blue-500">
          Home
        </a>
        <a href="#about" className="text-gray-700 hover:text-blue-500">
          About
        </a>
        <a href="#features" className="text-gray-700 hover:text-blue-500">
          Features
        </a>
        <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
          Log In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
