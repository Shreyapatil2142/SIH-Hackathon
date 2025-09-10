import React, { useState } from "react";

const AddTaskModal = ({ onClose }) => {
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3000/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create task");

      alert("Task created successfully!");
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            placeholder="Task Description"
            className="w-full border rounded-md p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <select
            className="w-full border rounded-md p-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="ENGINEER">ENGINEER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
          </select>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#48B3AF] text-white rounded-md"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
