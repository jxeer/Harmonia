import React from "react";

const HeroSection = () => {
  return (
    <section className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center bg-gradient-to-r from-[#d4e6f1] via-[#f3e9dc] to-[#eae7dc] p-8 rounded-lg shadow-lg">
      <div className="text-center lg:text-left lg:w-1/2">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Harmonia Health App
        </h1>
        <p className="text-gray-700 mb-6">
          Using technology to enhance quality healthcare and wellness support.
        </p>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 shadow">
          Join Our Waitlist Now
        </button>
      </div>
      <div className="mt-8 lg:mt-0 lg:w-1/2 flex justify-center">
        <img
          src="/images/doctor.png"
          alt="Doctor"
          className="rounded-full w-80 h-80 object-cover shadow-md"
        />
      </div>
    </section>
  );
};

export default HeroSection;
