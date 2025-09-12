import React, { useState } from "react";

const SummarizationTask = ({ onClose, startTask }) => {
  const steps = [
    "Logging in",
    "Uploading document",
    "Processing document",
    "Retrieving summary",
    "Listing all summaries",
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const appendLog = (message) => {
    setLogs((prev) => [...prev, message]);
  };

  const runTask = async () => {
    setLoading(true);
    setLogs([]);
    setCurrentStep(0);

    let token = "";
    let docId = "";

    try {
      // Step 1: Login
      appendLog("Logging in as admin...");
      const loginRes = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@metro-docs.com",
          password: "admin123",
        }),
        credentials: "include",
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || "Login failed");

      // ✅ Save token to localStorage (so it’s always available)
      if (loginData.token) {
        localStorage.setItem("token", loginData.token);
      }

      // ✅ Use token from localStorage (fallback)
      token = loginData.token || localStorage.getItem("token");
      appendLog(`✅ Login successful, token: ${token ? "found" : "missing"}`);
      setCurrentStep(1);

      // Step 2: Upload document (using FormData)
      appendLog("Uploading test document...");
      const formData = new FormData();
      formData.append("title", "Metro Safety Inspection Report");

      // Create a dummy file Blob for testing
      const fakeFile = new Blob(
        [
          "The metro system requires comprehensive safety inspections across all stations. " +
            "Track maintenance is critical for passenger safety. " +
            "Electrical systems need regular testing and calibration. " +
            "Emergency procedures must be updated and staff training completed by end of month. " +
            "Signal systems require immediate attention due to recent malfunctions.",
        ],
        { type: "text/plain" }
      );
      formData.append("file", fakeFile, "report.txt");

      const uploadRes = await fetch("http://localhost:3000/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok)
        throw new Error(uploadData.message || "Document upload failed");
      docId = uploadData.documentId;
      appendLog("✅ Document uploaded successfully");
      setCurrentStep(2);

      // Step 3: Process document
      appendLog("Processing document...");
      const processRes = await fetch(
        `http://localhost:3000/documents/${docId}/process`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const processData = await processRes.json();
      if (!processData.success) throw new Error("Document processing failed");
      appendLog("✅ Document processed successfully");
      setCurrentStep(3);

      // Step 4: Retrieve summary
      appendLog("Retrieving summary...");
      const summaryRes = await fetch(
        `http://localhost:3000/documents/${docId}/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const summaryData = await summaryRes.json();
      if (!summaryData.success) throw new Error("Summary retrieval failed");
      appendLog("✅ Summary retrieved successfully");
      setCurrentStep(4);

      // Step 5: List all summaries
      appendLog("Listing all summaries...");
      const listRes = await fetch(
        "http://localhost:3000/documents/summaries/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const listData = await listRes.json();
      if (!listData.success) throw new Error("Listing summaries failed");
      appendLog("✅ All summaries listed successfully");
      setCurrentStep(5);

      appendLog("🎉 Task completed!");
    } catch (error) {
      appendLog(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (currentStep / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-r from-green-100 to-blue-100flex justify-center items-start overflow-auto pt-10 px-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-6 sm:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            MetroDocs Summarization Task
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Close
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-500 mb-6 text-sm">
          Run summarization for the uploaded documents. Track the progress
          below.
        </p>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full mb-6">
          <div
            className="h-full bg-[#48B3AF] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          {progressPercent}% Completed
        </p>

        {/* Action Button */}
        <button
          onClick={runTask}
          className="px-4 py-2 rounded bg-[#48B3AF] hover:bg-[#3a8c87] text-white font-semibold"
          disabled={loading}
        >
          {loading ? "Running..." : "Start Summarization"}
        </button>

        {/* Logs */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4 h-40 overflow-auto text-sm text-gray-700">
          {logs.map((log, idx) => (
            <p key={idx}>{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummarizationTask;
