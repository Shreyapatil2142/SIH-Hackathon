import EntriesTable from "./EntriesTable";
import React, { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import CreateUserModal from "./CreateUser.jsx";
import UploadDocumentModal from "./UploadDocument.jsx";
import AddTaskModal from "./AddTaskModel.jsx";
import ChatBot from "./Chatbot.jsx";
import SummarizationTask from "./SummarizationTask1.jsx";

const AdminDashboard = ({ user, onLogout }) => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showSummarization, setShowSummarization] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with callback */}
      <Sidebar user="Admin" onCreateUser={() => setShowCreateUser(true)}
        onUploadDocument={() => setShowUploadDocument(true)}
        onSummarization={() => setShowSummarization(true)} />

      {/* Main Dashboard Content */}
      <div className="flex-1 bg-[#e9f9d8] p-4 max-w-full space-y-4">

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Welcome, {user.name}</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-[#3bb6b6] text-gray-700 rounded-md hover:bg-[#00d0ff]"
          >
            Logout
          </button>
        </div>

        {/* Stat section */}
        <section className="flex flex-col sm:flex-row gap-4">
          <div className="p-4 flex-1 max-w-xs sm:max-w-none shadow-md hover:shadow-lg hover:-translate-y-1 transition transform duration-200 space-y-3 mx-auto border border-[#A4CCD9] rounded-xl sm:p-4 bg-white">
            <p className="text-base font-normal mb-1 text-gray-900">Total Tasks</p>
            <p className="text-[#3bb6b6] font-bold text-2xl mt-1">24</p>
          </div>

          <div className="p-4 flex-1 max-w-xs sm:max-w-none shadow-md hover:shadow-lg hover:-translate-y-1 transition transform duration-200 space-y-3 mx-auto border border-[#A4CCD9] rounded-xl sm:p-4 bg-white">
            <p className="text-base font-normal mb-1 text-gray-900">Pending Tasks</p>
            <p className="text-[#3bb6b6] font-bold text-2xl mt-1">8</p>
          </div>

          <div className="p-4 flex-1 max-w-xs sm:max-w-none shadow-md hover:shadow-lg hover:-translate-y-1 transition transform duration-200 space-y-3 mx-auto border border-[#A4CCD9] rounded-xl sm:p-4 bg-white">
            <p className="text-base font-normal mb-1 text-gray-900">Completed Tasks</p>
            <p className="text-[#3bb6b6] font-bold text-2xl mt-1">16</p>
          </div>
        </section>

        {/* Manage Tasks Section */}
        <section className="shadow-md space-y-3 max-w-5xl mx-auto border border-[#A4CCD9] rounded-xl sm:p-6 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-normal mb-1 text-gray-900">Manage Tasks</h3>
            <button
              onClick={() => setShowAddTask(true)}
              className="px-4 py-2 bg-[#3bb6b6] text-gray-700 rounded-md hover:bg-[#00d0ff]"
            >
              Add New Task
            </button>
          </div>
        </section>

        {/* Dependencies Section */}
        <section className="shadow-md space-y-3 max-w-5xl mx-auto border border-[#A4CCD9] rounded-xl sm:p-6 bg-white">
          <h3 className="text-base font-normal mb-1 text-gray-900">
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

        {/*Table */}
        <EntriesTable />

      </div>

      {showCreateUser && (
        <CreateUserModal onClose={() => setShowCreateUser(false)} />
      )}
      {showUploadDocument && (
        <UploadDocumentModal onClose={() => setShowUploadDocument(false)} />
      )}
      {showSummarization && (
        <SummarizationTask onClose={() => setShowSummarization(false)} />
      )}

      <ChatBot />
    </div>
  );
};

export default AdminDashboard;
