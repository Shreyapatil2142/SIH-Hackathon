import React from "react";

const Sidebar = ({ user }) => {
  return (
    <aside className="bg-[#3bb6b6] text-white w-60 min-h-screen flex flex-col justify-between p-4">
      {/* Logo / Title */}
      <div className="mb-8">
        <h1 className="text-lg font-bold mb-6">Admin Dashboard</h1>
    <nav className="flex flex-col space-y-3 text-sm font-semibold rounded-md border border-transparent">
  <a
    href="#"
    className="px-3 py-2 rounded-md hover:bg-[#2a8f8f] hover:text-white transition-colors duration-200 border border-transparent hover:border-[#1f6d6d]"
  >
    Upload
  </a>
  <a
    href="#"
    className="px-3 py-2 rounded-md hover:bg-[#2a8f8f] hover:text-white transition-colors duration-200 border border-transparent hover:border-[#1f6d6d]"
  >
    View Doc
  </a>
  <a
    href="#"
    className="px-3 py-2 rounded-md hover:bg-[#2a8f8f] hover:text-white transition-colors duration-200 border border-transparent hover:border-[#1f6d6d]"
  >
    Team Members
  </a>
  <a
    href="#"
    className="px-3 py-2 rounded-md hover:bg-[#2a8f8f] hover:text-white transition-colors duration-200 border border-transparent hover:border-[#1f6d6d]"
  >
    Category of GR
  </a>
  <a
    href="#"
    className="px-3 py-2 rounded-md hover:bg-[#2a8f8f] hover:text-white transition-colors duration-200 border border-transparent hover:border-[#1f6d6d]"
  >
    Knowledge Bot
  </a>
</nav>

      </div>

      {/* Footer / User Info */}
      <div className="flex flex-col space-y-2">
        <button
          className="bg-[#a3b6bb] px-3 py-2 rounded-md text-white text-xs font-semibold"
          type="button"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
