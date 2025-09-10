import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    // Mock bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Got it! Let me check that for you." },
      ]);
    }, 1000);

    setInput("");
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        aria-label="Chat bot"
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-[#48B3AF] hover:bg-[#3a8c87] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8DBCC7] focus:ring-offset-2"
        type="button"
      >
        <MessageCircle size={28} />
      </button>

      {/* Popup Chat Box */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-lg border border-[#A4CCD9] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-2 bg-[#C4E1E6] rounded-t-xl">
            <h3 className="font-semibold text-black">Chat Bot</h3>
            <button onClick={toggleChat} className="hover:text-red-700">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-64">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`px-3 py-2 rounded-lg text-sm ${
                    msg.sender === "user"
                      ? "bg-[#48B3AF] text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 border-t border-gray-200 flex">
            <input
              type="text"
              className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DBCC7]"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 px-3 py-2 bg-[#48B3AF] hover:bg-[#3a8c87] text-white rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
