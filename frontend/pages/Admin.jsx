import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield, FaUsers, FaFolderOpen, FaDatabase, FaArrowLeft, FaFileAlt, FaSearch, FaTimes } from "react-icons/fa";
import API from "../api/axios";

function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState({ name: "", email: "", role: "user" });
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Search state variables for premium usability
  const [searchUser, setSearchUser] = useState("");

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

  const fetchData = async () => {
    try {
      // 1. Fetch Admin Profile to double check access
      const profileRes = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileRes.data.role !== "admin") {
        showToast("Access Denied. Admins only! ❌", "error");
        setTimeout(() => navigate("/dashboard"), 2000);
        return;
      }
      setProfile(profileRes.data);

      // 2. Fetch All Registered Users
      const usersRes = await API.get("/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data.users);

      // 3. Fetch All Files uploaded across system
      const filesRes = await API.get("/files/all-files", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(filesRes.data.files);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      showToast("Verification failed. Redirecting... ❌", "error");
      setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/");
      }, 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper size formatter
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Dynamic lists filtering
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  // System statistics (overall)
  const totalSystemStorage = files.reduce((total, file) => total + (file.file_size || 0), 0);
  const averageFileSize = files.length > 0 ? (totalSystemStorage / files.length) : 0;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-semibold text-sm">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30">
      {/* Navbar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
          <Link to="/admin" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <FaUserShield className="text-blue-600 text-3xl" /> CloudVault
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="w-10 h-10 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 font-bold rounded-full flex items-center justify-center shadow-inner transition-all duration-300 transform hover:scale-105 border border-indigo-200"
              title="My Profile"
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-95 text-white px-6 py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Page Title */}
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Admin Operations Command</h2>
          <p className="text-gray-500 text-sm mt-1">Global platform metrics, user access lists, and physical storage administration.</p>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Total Users */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
              <FaUsers className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Platform Users</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{users.length}</p>
            </div>
          </div>

          {/* Card 2: Total Files */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
              <FaFolderOpen className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Global Files</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{files.length}</p>
            </div>
          </div>

          {/* Card 3: Storage Occupied */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
              <FaDatabase className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Platform Space Occupied</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{formatFileSize(totalSystemStorage)}</p>
            </div>
          </div>

          {/* Card 4: Avg File Size */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
              <FaFileAlt className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Average Asset Size</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{formatFileSize(averageFileSize)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Left Column: Registered Users Table */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-50 flex items-center gap-2">
                <FaUsers className="text-blue-500" /> Platform Members
              </h3>

              {/* Members search bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search members by name/email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full text-xs pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-400 transition"
                />
                <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
                {searchUser && (
                  <button 
                    onClick={() => setSearchUser("")}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition text-xs"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {filteredUsers.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6 font-semibold">No members match search query.</p>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-100 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-indigo-55 text-indigo-600 bg-indigo-50 font-bold rounded-xl flex items-center justify-center shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate" title={u.name}>{u.name}</p>
                          <p className="text-xs text-gray-400 truncate" title={u.email}>{u.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                        u.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {u.role || "user"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
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

export default Admin;
