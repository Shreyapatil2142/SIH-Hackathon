import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
      } else {
        localStorage.setItem("token", data.token);
        if (onLogin) onLogin(data); // <-- this will trigger dashboard load
      }
    } catch (err) {
      setError("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#48B3AF] rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

              <input
                type="email"
                className="w-full h-12 pl-10 pr-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#48B3AF] focus:border-[#48B3AF] text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-1">

            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

              <input
                type="password"
                className="w-full h-12 pl-10 pr-10 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#48B3AF] focus:border-[#48B3AF] text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>
         <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#48B3AF] hover:bg-teal-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
      

        </form>
      </div>

    </div>
  );
};

export default Login;
