import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaDownload,
  FaTrash,
  FaDatabase,
  FaFilePdf,
  FaFileImage,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
  FaSearch,
  FaTimes
} from "react-icons/fa";
import API from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const token = localStorage.getItem("token");

  // Show dynamic toast helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Toast Auto-hide timer
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Fetch Files
  const fetchFiles = async () => {
    try {
      const response = await API.get("/files/my-files", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFiles(response.data.files);
    } catch (error) {
      console.log(error);
      showToast("Failed to fetch files from storage server ❌", "error");
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      showToast(`Selected file: ${e.dataTransfer.files[0].name} 📂`, "info");
    }
  };

  // Upload File
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      return showToast("Please select or drop a file first! 📁", "error");
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      showToast("File uploaded successfully! 🚀", "success");
      setFile(null);
      fetchFiles();
    } catch (error) {
      showToast(error.response?.data?.detail || "Upload failed ❌", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete File
  const handleDelete = async (fileId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this file?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      showToast("File deleted successfully! 🗑️", "success");
      fetchFiles();
    } catch (error) {
      console.log(error);
      showToast("Failed to delete file from cloud ❌", "error");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Filter Files based on Search Input
  const filteredFiles = files.filter((file) =>
    file.original_filename.toLowerCase().includes(search.toLowerCase())
  );

  // Format File Size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }
  };

  // Determine Icon and Accent Styling based on Mime-type
  const getFileIconAndColor = (fileType) => {
    const type = fileType ? fileType.toLowerCase() : "";
    if (type.includes("pdf")) {
      return { icon: <FaFilePdf className="text-rose-500 text-3xl" />, bg: "bg-rose-50", text: "text-rose-700", label: "PDF" };
    } else if (type.includes("image")) {
      return { icon: <FaFileImage className="text-emerald-500 text-3xl" />, bg: "bg-emerald-50", text: "text-emerald-700", label: "Image" };
    } else if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("compressed") || type.includes("7z")) {
      return { icon: <FaFileArchive className="text-amber-500 text-3xl" />, bg: "bg-amber-50", text: "text-amber-700", label: "Archive" };
    } else if (type.includes("json") || type.includes("javascript") || type.includes("html") || type.includes("css") || type.includes("python") || type.includes("text") || type.includes("code")) {
      return { icon: <FaFileCode className="text-purple-500 text-3xl" />, bg: "bg-purple-50", text: "text-purple-700", label: "Code/Text" };
    } else {
      return { icon: <FaFileAlt className="text-slate-500 text-3xl" />, bg: "bg-slate-50", text: "text-slate-700", label: "File" };
    }
  };

  // Total Storage Calculation
  const totalStorage = files.reduce(
    (total, file) => total + (file.file_size || 0),
    0
  );

  // Storage Percentage Calculation (1 GB boundary)
  const storagePercentage = ((totalStorage / (1024 * 1024 * 1024)) * 100).toFixed(2);

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Navbar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CloudVault
          </h1>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-95 text-white px-6 py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Storage Usage */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80 mb-8 hover:shadow-md transition duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <FaDatabase className="text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Storage Usage
                </h2>
              </div>
              <p className="text-gray-500 text-sm ml-12">
                Monitor your personal cloud storage allocation
              </p>
            </div>

            <div className="text-left md:text-right md:pr-2">
              <p className="text-2xl font-black text-blue-600">
                {formatFileSize(totalStorage)}
              </p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
                of 1.00 GB allocation used
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(parseFloat(storagePercentage), 100)}%`
              }}
            />
          </div>

          <div className="flex justify-between mt-4 text-xs font-semibold text-gray-600 px-1">
            <p className="bg-slate-100 px-2.5 py-1 rounded-lg">
              {storagePercentage}% full
            </p>
            <p className="bg-slate-100 px-2.5 py-1 rounded-lg">
              Remaining: {formatFileSize(Math.max((1024 * 1024 * 1024) - totalStorage, 0))}
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80 mb-8 hover:shadow-md transition duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <FaCloudUploadAlt className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Upload Files
            </h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Interactive Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input").click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                  : file
                  ? "border-emerald-400 bg-emerald-50/20 hover:border-emerald-500"
                  : "border-gray-200 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/20"
              }`}
            >
              <input
                id="file-input"
                type="file"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setFile(e.target.files[0]);
                    showToast(`Selected file: ${e.target.files[0].name} 📂`, "info");
                  }
                }}
                className="hidden"
              />

              <FaCloudUploadAlt className={`text-5xl mx-auto mb-4 transition-all duration-300 ${
                isDragging ? "text-blue-600 scale-110" : file ? "text-emerald-500 animate-pulse" : "text-gray-400"
              }`} />

              {file ? (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-emerald-700">File Ready for Upload!</p>
                  <p className="text-gray-700 font-semibold break-all text-sm">{file.name}</p>
                  <p className="text-gray-400 text-xs font-semibold">{formatFileSize(file.size)}</p>
                  <p className="text-blue-500 text-xs font-bold mt-3 hover:underline">Click to change selected file</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-700">
                    {isDragging ? "Drop to load file!" : "Drag & drop files here"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    or <span className="text-blue-600 font-bold hover:underline">browse files</span> on your device
                  </p>
                  <p className="text-gray-400 text-xs mt-2">Any typical files up to 100 MB</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex gap-3 justify-end">
              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    showToast("File selection cleared", "info");
                  }}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl transition duration-300 font-semibold border border-gray-200"
                  disabled={isUploading}
                >
                  Clear Selection
                </button>
              )}

              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Uploading to cloud...
                  </>
                ) : (
                  "Upload to Cloud"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 shadow-sm rounded-2xl">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>

          <input
            type="text"
            placeholder="Search files by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition bg-white"
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                showToast("Search cleared", "info");
              }}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition"
              title="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Files Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Your Files
          </h2>

          <p className="text-gray-500 font-semibold text-sm">
            Total Files:{" "}
            <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
              {filteredFiles.length}
            </span>
          </p>
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 p-12 text-center">
            <FaCloudUploadAlt className="text-6xl text-blue-400/80 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-1">
              {search ? "No Matches Found" : "No Files Uploaded"}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {search 
                ? "Try searching for a different keyword or clear the search query." 
                : "Upload your first file by dropping it inside the upload container above 🚀"
              }
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-2xl transition text-xs font-bold"
              >
                Clear Search Query
              </button>
            )}
          </div>
        )}

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => {
            const fileInfo = getFileIconAndColor(file.file_type);
            return (
              <div
                key={file._id}
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  {/* File Type Icon & Accent Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3.5 rounded-2xl ${fileInfo.bg} shadow-inner`}>
                      {fileInfo.icon}
                    </div>
                    <span className={`text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider ${fileInfo.bg} ${fileInfo.text}`}>
                      {fileInfo.label}
                    </span>
                  </div>

                  {/* File Name */}
                  <h3 className="text-lg font-bold text-gray-800 mb-2 break-all line-clamp-2" title={file.original_filename}>
                    {file.original_filename}
                  </h3>

                  {/* Metadata fields */}
                  <div className="space-y-1.5 mb-6 bg-gray-50/50 p-3 rounded-2xl">
                    <div className="text-xs flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="font-semibold text-gray-600">{formatFileSize(file.file_size || 0)}</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-gray-400">Uploaded:</span>
                      <span className="font-semibold text-gray-600">
                        {file.created_at ? new Date(file.created_at).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons Action Container */}
                <div className="flex gap-2 mt-auto">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-grow flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 text-white px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition duration-300 text-sm font-bold"
                  >
                    <FaDownload />
                    Download
                  </a>

                  <button
                    onClick={() => handleDelete(file._id)}
                    className="flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-3 rounded-2xl transition duration-300 text-sm font-bold border border-rose-100"
                    title="Delete File"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Floating Toast Notification */}
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

export default Dashboard;