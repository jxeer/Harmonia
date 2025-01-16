import React from "react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-50">
      <FeatureCard
        icon="📅"
        title="Appointment Booking"
        description="Book appointments easily with your healthcare provider."
      />
      <FeatureCard
        icon="📄"
        title="Medical Records Access"
        description="View your medical history and stay informed."
      />
      <FeatureCard
        icon="💪"
        title="Fitness Integration"
        description="Share your fitness data with your doctor for better care."
      />
    </section>
  );
};

export default FeaturesSection;
