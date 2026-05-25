import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await API.post("/auth/register", formData);
      showToast("Account created successfully! Redirecting... 🚀", "success");
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      showToast(error.response?.data?.detail || "Registration failed. Try again ❌", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-55 via-indigo-50/20 to-slate-100 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-gray-100/80 hover:shadow-indigo-100 transition duration-300">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            CloudVault
          </h1>
          <p className="text-gray-400 font-semibold text-sm mt-2">
            Create your secure account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-gray-700 font-bold text-sm block mb-2">
              Full Name
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 focus-within:bg-white transition-all duration-300">
              <FaUser className="text-gray-400 mr-3" />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent text-sm font-medium text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-700 font-bold text-sm block mb-2">
              Email Address
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 focus-within:bg-white transition-all duration-300">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent text-sm font-medium text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-700 font-bold text-sm block mb-2">
              Password
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 focus-within:bg-white transition-all duration-300 relative">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pr-10 outline-none bg-transparent text-sm font-medium text-gray-700 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 text-white py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-indigo-100 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6 font-semibold">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-blue-600 font-bold hover:underline hover:text-blue-700"
          >
            Login Here
          </Link>
        </p>
      </div>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 border ${
          toast.type === "success"
            ? "bg-emerald-500/90 border-emerald-400 text-white"
            : toast.type === "error"
            ? "bg-rose-500/90 border-rose-400 text-white"
            : "bg-blue-600/90 border-blue-400 text-white"
        }`}>
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: "", type: "success" })}
            className="hover:opacity-75 font-black ml-3 text-lg border-l border-white/20 pl-3 leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;