import React from "react";
import Sidebar from "./sidebar";

const AdminDashboard = () => {
  return (
    <div className="flex font-sans bg-[#e9f9d8] min-h-screen">
      {/* Sidebar */}
      <Sidebar user="Admin" />

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-full space-y-4">
        <h2 className="text-[#3bb6b6] font-semibold text-lg">
          Dashboard Overview
        </h2>

        {/* Stats Section */}
        <section className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="bg-white rounded-md shadow-md p-4 flex-1 max-w-xs sm:max-w-none">
            <p className="text-gray-700 text-xs">Total Tasks</p>
            <p className="text-[#3bb6b6] font-bold text-2xl mt-1">24</p>
          </div>
          <div className="bg-white rounded-md shadow-md p-4 flex-1 max-w-xs sm:max-w-none">
            <p className="text-gray-700 text-xs">Pending Tasks</p>
            <p className="text-[#3bb6b6] font-bold text-2xl mt-1">8</p>
          </div>
          <div className="bg-white rounded-md shadow-md p-4 flex-1 max-w-xs sm:max-w-none">
            <p className="text-gray-400 text-xs">Completed Tasks</p>
            <p className="text-[#a3b6bb] font-bold text-2xl mt-1">16</p>
          </div>
        </section>

        {/* Manage Tasks Section */}
        <section className="bg-white rounded-md shadow-md p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-800 font-semibold text-sm">Manage Tasks</h3>
            <button
              type="button"
              className="bg-[#3bb6b6] text-white text-xs font-semibold px-3 py-1 rounded"
            >
              Add New Task
            </button>
          </div>
          {/* Table omitted for brevity, copy your existing table here */}
        </section>

        {/* Dependencies Section */}
        <section className="bg-white rounded-md shadow-md p-4 space-y-3">
          <h3 className="text-gray-800 font-semibold text-sm">
            Cross Department Dependencies
          </h3>
          {/* Dependency cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#b9d7db] p-3 rounded-md text-xs text-[#3bb6b6]">
              <p className="font-semibold underline cursor-pointer">IT → HR</p>
              <p className="text-gray-700 mt-1">System access setup for new employees</p>
              <span className="inline-block bg-[#3bb6b6] text-white text-[10px] font-semibold px-2 py-0.5 rounded mt-2">
                Active
              </span>
            </div>
            <div className="bg-[#b9d7db] p-3 rounded-md text-xs text-[#3bb6b6]">
              <p className="font-semibold underline cursor-pointer">Finance → Operations</p>
              <p className="text-gray-700 mt-1">Budget approval for Q2 projects</p>
              <span className="inline-block bg-[#3bb6b6] text-white text-[10px] font-semibold px-2 py-0.5 rounded mt-2">
                Pending
              </span>
            </div>
          </div>
        </section>
    
      </main>
    </div>
  );
};

export default AdminDashboard;
