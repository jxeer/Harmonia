import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WaitlistForm from "./WaitlistForm.jsx";
import "./App.css";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Hamburger Menu */}
        <div className="hamburger-menu" onClick={toggleSidebar}>
          ☰
        </div>

        {/* Top Navbar */}
        <nav className="top-navbar">
          <img
            src="/images/harmonia-logo.png"
            alt="Harmonia Logo"
            className="nav-logo"
          />
          <div className="top-nav-links">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/features">Features</a>
            <a href="/waitlist" className="cta-button">
              Log In
            </a>
          </div>
        </nav>

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarVisible ? "visible" : ""}`}>
          <nav className="sidebar-nav">
            <a href="/">Dashboard</a>
            <a href="/appointments">Appointments</a>
            <a href="/records">Medical Records</a>
            <a href="/waitlist">Waitlist</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <section className="hero">
                    <div className="hero-content">
                      <h1>Harmonia Health App</h1>
                      <p>
                        Using technology to enhance quality healthcare and
                        wellness support.
                      </p>
                      <a href="/waitlist" className="cta-button">
                        Join Our Waitlist Now
                      </a>
                    </div>
                    <div className="hero-image">
                      <img
                        src="/images/doctor.png"
                        style={{
                          width: "500px",
                          height: "500px",
                          borderRadius: "50%",
                        }}
                        alt="Doctor"
                      />
                    </div>
                  </section>

                  <section className="features">
                    <div className="feature-card">
                      <h3>📅 Appointment Booking</h3>
                      <p>
                        Book appointments easily with your healthcare provider.
                      </p>
                    </div>
                    <div className="feature-card">
                      <h3>📖 Medical Records Access</h3>
                      <p>View your medical history and stay informed.</p>
                    </div>
                    <div className="feature-card">
                      <h3>🏃 Fitness Integration</h3>
                      <p>
                        Share your fitness data with your doctor for better
                        care.
                      </p>
                    </div>
                  </section>
                </>
              }
            />
            <Route path="/waitlist" element={<WaitlistForm />} />
          </Routes>
          <footer className="footer">
            © 2025 Harmonia Health. All Rights Reserved.
          </footer>
        </main>
      </div>
    </Router>
  );
}

export default App;
