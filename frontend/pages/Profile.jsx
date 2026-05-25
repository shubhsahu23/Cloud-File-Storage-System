import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaShieldAlt, FaDatabase, FaFolderOpen, FaArrowLeft, FaTrash, FaUndo } from "react-icons/fa";
import API from "../api/axios";

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState({ name: "", email: "", role: "user" });
  const [files, setFiles] = useState([]);
  const [trashFiles, setTrashFiles] = useState([]);
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

  const fetchUserData = async () => {
    try {
      // Fetch User Profile
      const profileRes = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(profileRes.data);

      // Fetch active user files (is_deleted !== true)
      const filesRes = await API.get("/files/my-files", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(filesRes.data.files);
    } catch (error) {
      console.log(error);
      showToast("Session expired. Please log in again. ❌", "error");
      setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/");
      }, 2000);
    }
  };

  const fetchTrashFiles = async () => {
    try {
      const trashRes = await API.get("/files/trash", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrashFiles(trashRes.data.files);
    } catch (err) {
      console.log("Failed to load trash files", err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchTrashFiles();
  }, []);

  const handleRestore = async (fileId, fileName) => {
    try {
      await API.post(`/files/${fileId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`Restored "${fileName}" successfully! 🚀`, "success");
      fetchUserData();
      fetchTrashFiles();
    } catch (error) {
      console.log(error);
      showToast("Failed to restore file ❌", "error");
    }
  };

  const handlePermanentDelete = async (fileId, fileName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to PERMANENTLY delete "${fileName}"? This will purge the file from S3/disk and cannot be recovered.`
    );
    if (!confirmDelete) return;

    try {
      await API.delete(`/files/${fileId}/permanent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`Permanently deleted "${fileName}"! 🗑`, "success");
      fetchTrashFiles();
    } catch (error) {
      console.log(error);
      showToast("Permanent deletion failed ❌", "error");
    }
  };

  const totalStorage = files.reduce((total, file) => total + (file.file_size || 0), 0);
  const storagePercentage = ((totalStorage / (1024 * 1024 * 1024)) * 100).toFixed(2);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // 3. Storage Categories Analysis Calculations
  const categories = {
    images: { size: 0, label: "Images", color: "bg-emerald-500", text: "text-emerald-500" },
    pdfs: { size: 0, label: "PDFs", color: "bg-rose-500", text: "text-rose-500" },
    code: { size: 0, label: "Code & Text", color: "bg-purple-500", text: "text-purple-500" },
    archives: { size: 0, label: "Archives", color: "bg-amber-500", text: "text-amber-500" },
    others: { size: 0, label: "Others", color: "bg-slate-400", text: "text-slate-400" }
  };

  files.forEach((file) => {
    const type = file.file_type ? file.file_type.toLowerCase() : "";
    const size = file.file_size || 0;
    if (type.includes("pdf")) {
      categories.pdfs.size += size;
    } else if (type.includes("image")) {
      categories.images.size += size;
    } else if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("compressed") || type.includes("7z")) {
      categories.archives.size += size;
    } else if (type.includes("json") || type.includes("javascript") || type.includes("html") || type.includes("css") || type.includes("python") || type.includes("text") || type.includes("code")) {
      categories.code.size += size;
    } else {
      categories.others.size += size;
    }
  });

  const getPercentage = (size) => {
    if (totalStorage === 0) return 0;
    return ((size / totalStorage) * 100).toFixed(1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Navbar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
          <Link to={profile.role === "admin" ? "/admin" : "/dashboard"} className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CloudVault
          </Link>

          <div className="flex items-center gap-4">
            {profile.role === "admin" ? (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-blue-600 font-bold transition text-sm flex items-center gap-2"
              >
                <FaArrowLeft /> Admin Panel
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-blue-600 font-bold transition text-sm flex items-center gap-2"
              >
                <FaArrowLeft /> Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-95 text-white px-6 py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header Cover Card */}
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-8 text-white relative">
            <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-bold border border-white/30 shadow-lg">
                {profile.name ? profile.name.charAt(0).toUpperCase() : <FaUser />}
              </div>
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-3xl font-extrabold">{profile.name || "Loading..."}</h2>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    profile.role === "admin" ? "bg-amber-400 text-amber-950" : "bg-white/20 text-white"
                  }`}>
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-8 space-y-8">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">
              Account Information
            </h3>

            {/* Profile Grid Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Name */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <FaUser className="text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold">Full Name</p>
                  <p className="text-gray-700 font-bold">{profile.name}</p>
                </div>
              </div>

              {/* Field 2: Email */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <FaEnvelope className="text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold">Email Address</p>
                  <p className="text-gray-700 font-bold">{profile.email}</p>
                </div>
              </div>

              {/* Field 3: Account Type */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                  <FaShieldAlt className="text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold">Security Role</p>
                  <p className="text-gray-700 font-bold uppercase tracking-wider">{profile.role}</p>
                </div>
              </div>

              {/* Field 4: Files Count */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                  <FaFolderOpen className="text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold">Total Active Files</p>
                  <p className="text-gray-700 font-bold">{files.length} items</p>
                </div>
              </div>
            </div>

            {/* Storage Performance & Stacked Categories Visual Card */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FaDatabase className="text-blue-600 text-xl" />
                  <h4 className="text-lg font-bold text-gray-800">Storage Performance</h4>
                </div>
                <div className="text-right">
                  <span className="text-blue-600 font-extrabold text-lg">{formatFileSize(totalStorage)}</span>
                  <span className="text-gray-400 text-xs font-semibold"> / 1.00 GB max</span>
                </div>
              </div>

              {/* Progress Bar (Overall) */}
              <div className="space-y-2">
                <div className="w-full h-3.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(parseFloat(storagePercentage), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-500">
                  <p>{storagePercentage}% full</p>
                  <p>Remaining allocation: {formatFileSize(Math.max((1024 * 1024 * 1024) - totalStorage, 0))}</p>
                </div>
              </div>

              {/* 3.1 Stacked Categories Progress Bar */}
              {totalStorage > 0 && (
                <div className="space-y-3 pt-3 border-t border-gray-200/50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">File Type Storage Share</p>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                    {Object.values(categories).map((cat) => {
                      const pct = getPercentage(cat.size);
                      if (cat.size === 0) return null;
                      return (
                        <div
                          key={cat.label}
                          className={`${cat.color} h-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                          title={`${cat.label}: ${formatFileSize(cat.size)} (${pct}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* Legends */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                    {Object.values(categories).map((cat) => {
                      const pct = getPercentage(cat.size);
                      return (
                        <div key={cat.label} className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-gray-200/50">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                          <div className="min-w-0">
                            <p className="text-gray-700 font-extrabold text-[10px] truncate">{cat.label}</p>
                            <p className="text-gray-400 text-[9px] font-semibold">{pct}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1. & 2. Trash Bin Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                <FaTrash className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Trash Bin</h3>
                <p className="text-gray-400 text-xs mt-0.5">Restore soft-deleted files or delete them permanently</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-rose-50 text-rose-600 px-3.5 py-1 rounded-full uppercase tracking-wider">
              {trashFiles.length} files
            </span>
          </div>

          {trashFiles.length === 0 ? (
            <div className="text-center p-12 text-gray-400">
              <FaFolderOpen className="text-5xl mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">Your trash is empty.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {trashFiles.map((file) => (
                <div key={file._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 rounded-3xl border border-gray-100 transition gap-4">
                  <div className="max-w-md">
                    <p className="text-sm font-extrabold text-gray-800 break-all">{file.original_filename}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-bold">
                      <span>{formatFileSize(file.file_size || 0)}</span>
                      <span>•</span>
                      <span>Deleted: {file.deleted_at ? new Date(file.deleted_at).toLocaleDateString() : "Unknown"}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(file._id, file.original_filename)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl transition text-xs font-bold border border-emerald-100 flex items-center gap-1.5"
                    >
                      <FaUndo /> Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(file._id, file.original_filename)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl transition text-xs font-bold border border-rose-100 flex items-center gap-1.5"
                    >
                      <FaTrash /> Delete Permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default Profile;
