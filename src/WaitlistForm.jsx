import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./App.css";

function WaitlistForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submitted, setSubmitted] = useState(false);

  // Simulate sending data to a server
  const onSubmit = (data) => {
    console.log("Form Data:", data);
    setSubmitted(true);
    // Simulate an API call with setTimeout
    setTimeout(() => {
      alert("Thank you for joining the waitlist!");
    }, 1500);
  };

  return (
    <div className="App">
      <h1>Join the Harmonia Waitlist</h1>

      {submitted ? (
        <p className="success-message">
          ✅ You've successfully joined the waitlist!
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="waitlist-form">
          {/* Name Field */}
          <label htmlFor="name">Full Name:</label>
          <input
            {...register("name", { required: "Name is required." })}
            type="text"
            id="name"
          />
          {errors.name && <p className="error">{errors.name.message}</p>}

          {/* Email Field */}
          <label htmlFor="email">Email Address:</label>
          <input
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email address.",
              },
            })}
            type="email"
            id="email"
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          {/* Submit Button */}
          <button type="submit" className="cta-button">
            Join Now
          </button>
        </form>
      )}
    </div>
  );
}

export default WaitlistForm;
