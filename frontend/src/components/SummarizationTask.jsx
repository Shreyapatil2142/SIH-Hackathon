import React, { useState } from "react";

const SummarizationTask = ({ onClose }) => {
  const [progressPercent, setProgressPercent] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startSummarization = () => {
    if (isRunning) return;
    setIsRunning(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProgressPercent(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 500); // simulate task progress
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-20 flex justify-center items-start overflow-auto pt-10 px-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-6 sm:p-8">
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

        <p className="text-gray-500 mb-6 text-sm">
          Run summarization for uploaded documents. Track progress below.
        </p>

        <div className="w-full h-4 bg-gray-200 rounded-full mb-4">
          <div
            className="h-full bg-[#48B3AF] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mb-6">{progressPercent}% Completed</p>

        <button
          onClick={startSummarization}
          disabled={isRunning}
          className={`px-4 py-2 rounded ${
            isRunning ? "bg-gray-400 cursor-not-allowed" : "bg-[#48B3AF] hover:bg-[#3a8c87]"
          } text-white font-semibold`}
        >
          {isRunning ? "Running..." : "Start Summarization"}
        </button>
      </div>
    </div>
  );
};

export default SummarizationTask;
