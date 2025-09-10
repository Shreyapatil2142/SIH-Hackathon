// import React from "react";

// function Login({ onLogin }) {
//    const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');

//     // Very basic validation
//     if (email === 'admin' && password === 'password') {
//       onLogin({ name: 'Admin User', role: 'Administrator' });
//     } else if (email === 'staff' && password === 'password') {
//       onLogin({ name: 'Staff User', role: 'Staff' });
//     } else {
//       setError('Invalid credentials. Try admin/password or staff/password');
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center relative"
//       style={{ background: "linear-gradient(90deg, #d7f0d9 0%, #a7c9d9 100%)" }}
//     >

//       {/* Card */}
//       <div className="bg-gradient-to-b from-white to-[#f7fcfc] rounded-xl shadow-lg p-8 w-full max-w-sm">
//         {/* Header */}
//         <div className="flex flex-col items-center mb-6">
//           <div className="bg-[#4ba1a3] rounded-full p-3 mb-3 flex items-center justify-center w-12 h-12">
//             <i className="fas fa-user text-white text-xl"></i>
//           </div>
//           <h2 className="font-semibold text-gray-900 text-lg mb-1">
//             Welcome Back
//           </h2>
//           <p className="text-gray-600 text-sm">Sign in to your account</p>
//         </div>

//         {/* Form */}
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           {/* Email */}
//           <div>
//             <label
//               htmlFor="email"
             
//               className="block text-xs font-semibold text-gray-700 mb-1"
//             >
//               Email Address
//             </label>
//             <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 text-gray-400 text-sm">
//               <i className="fas fa-at mr-2"></i>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter your email"
//                 className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-xs font-semibold text-gray-700 mb-1"
//             >
//               Password
//             </label>
//             <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 text-gray-400 text-sm">
//               <i className="fas fa-lock mr-2"></i>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
//               />
//               <i className="fas fa-eye text-gray-400 cursor-pointer"></i>
//             </div>
//           </div>

//           {/* Options */}
//           <div className="flex items-center justify-between text-xs text-gray-600">
//             <label className="flex items-center gap-1 cursor-pointer select-none">
//               <input type="checkbox" className="w-3 h-3 border border-gray-400" />
//               Remember me
//             </label>
//             <a href="#" className="text-[#4ba1a3] hover:underline">
//               Forgot password?
//             </a>
//           </div>

//           {/* Sign In Button */}
//           <button
//             type="submit"
//             className="w-full bg-[#4ba1a3] text-white font-semibold py-2 rounded-md mt-2"
//           >
//             Sign In
//           </button>
//         </form>

//         {/* Divider */}
//         <div className="flex items-center my-6 text-xs text-gray-400">
//           <div className="flex-grow border-t border-gray-300"></div>
//           <span className="mx-3">or</span>
//           <div className="flex-grow border-t border-gray-300"></div>
//         </div>

//         {/* Google Button */}
//         <button
//           type="button"
//           className="w-full border border-gray-300 rounded-md py-2 mb-3 flex items-center justify-center gap-2 text-xs text-gray-700 hover:bg-gray-50"
//         >
//           <img
//             src="https://storage.googleapis.com/a1aa/image/1f8c6b9a-5b80-4ef5-d274-2e93154f80a3.jpg"
//             alt="Google"
//             className="w-5 h-5"
//           />
//           Continue with Google
//         </button>

//         {/* Footer */}
//         <p className="text-center text-xs text-gray-600 mt-6">
//           Don't have an account?{" "}
//           <a href="#" className="text-[#4ba1a3] font-semibold hover:underline">
//             Sign up here
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


import React, { useState } from "react";

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
        credentials: "include", // ✅ important if using cookies/JWT
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
      } else {
        localStorage.setItem("token", data.token); // ✅ save JWT token
        if (onLogin) onLogin(data); // notify parent (e.g. show dashboard)
      }
    } catch (err) {
      setError("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
