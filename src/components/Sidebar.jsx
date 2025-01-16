import React from "react";

const Sidebar = () => {
  return (
    <aside className="fixed top-16 left-0 h-full w-64 bg-[#eae7dc] shadow-md p-6">
      <ul className="space-y-4">
        <li>
          <a href="#dashboard" className="text-gray-700 hover:text-blue-500">
            Dashboard
          </a>
        </li>
        <li>
          <a href="#appointments" className="text-gray-700 hover:text-blue-500">
            Appointments
          </a>
        </li>
        <li>
          <a
            href="#medical-records"
            className="text-gray-700 hover:text-blue-500"
          >
            Medical Records
          </a>
        </li>
        <li>
          <a href="#waitlist" className="text-gray-700 hover:text-blue-500">
            Waitlist
          </a>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
