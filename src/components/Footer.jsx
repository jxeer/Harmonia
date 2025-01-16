import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-6 mt-auto">
      <p className="text-sm md:text-base">
        © 2025 Harmonia Health. All Rights Reserved.
      </p>
      <p>
        Follow us:{" "}
        <a href="#social-links" className="text-orange-400 hover:underline">
          Social Links
        </a>
      </p>
    </footer>
  );
};

export default Footer;
