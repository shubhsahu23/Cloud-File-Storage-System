import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FaCloudUploadAlt,
  FaDownload,
  FaTrash,
  FaDatabase
} from "react-icons/fa";

import API from "../api/axios";

function Dashboard() {

  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [files, setFiles] = useState([]);

  const [search, setSearch] = useState("");

  const token = localStorage.getItem(
    "token"
  );


  // Fetch Files
  const fetchFiles = async () => {

    try {

      const response = await API.get(
        "/files/my-files",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setFiles(response.data.files);

    } catch (error) {

      console.log(error);
    }
  };


  // Upload File
  const handleUpload = async (e) => {

    e.preventDefault();

    if (!file) {
      return alert("Select a file");
    }

    const formData = new FormData();

    formData.append("file", file);

    try {

      await API.post(
        "/files/upload",
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      alert("File Uploaded");

      setFile(null);

      fetchFiles();

    } catch (error) {

      alert(
        error.response?.data?.detail ||
        "Upload failed"
      );
    }
  };


  // Delete File
  const handleDelete = async (
    fileId
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this file?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await API.delete(
        `/files/${fileId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert("File Deleted");

      fetchFiles();

    } catch (error) {

      console.log(error);
    }
  };


  // Logout
  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    navigate("/");
  };


  // Filter Files
  const filteredFiles = files.filter(
    (file) =>

      file.original_filename
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );


  // Format File Size
  const formatFileSize = (bytes) => {

    if (bytes < 1024) {
      return bytes + " B";
    }

    else if (bytes < 1024 * 1024) {

      return (
        (bytes / 1024).toFixed(2)
        + " KB"
      );
    }

    else {

      return (
        (
          bytes /
          (1024 * 1024)
        ).toFixed(2)
        + " MB"
      );
    }
  };


  // Total Storage
  const totalStorage = files.reduce(
    (total, file) =>

      total + (file.file_size || 0),

    0
  );


  // Storage Percentage
  const storagePercentage =
    (
      (totalStorage /
        (1024 * 1024 * 1024))
      * 100
    ).toFixed(2);


  useEffect(() => {

    fetchFiles();

  }, []);


  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">

      {/* Navbar */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CloudVault
          </h1>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white px-5 py-2 rounded-2xl shadow-lg transition duration-300"
          >
            Logout
          </button>

        </div>

      </div>


      <div className="max-w-7xl mx-auto p-6">

        {/* Storage Usage */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

            <div>

              <div className="flex items-center gap-3 mb-2">

                <FaDatabase className="text-blue-600 text-2xl" />

                <h2 className="text-2xl font-bold text-gray-800">
                  Storage Usage
                </h2>

              </div>

              <p className="text-gray-500 text-sm">
                Monitor your cloud storage usage
              </p>

            </div>


            <div className="text-left md:text-right">

              <p className="text-2xl font-bold text-blue-600">

                {
                  formatFileSize(
                    totalStorage
                  )
                }

              </p>

              <p className="text-gray-500 text-sm">
                of 1 GB used
              </p>

            </div>

          </div>


          {/* Progress Bar */}
          <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">

            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-in-out"
              style={{
                width:
                  `${Math.min(
                    storagePercentage,
                    100
                  )}%`
              }}
            />

          </div>


          <div className="flex justify-between mt-4 text-sm text-gray-600">

            <p>
              {storagePercentage}% used
            </p>

            <p>

              Remaining:
              {" "}

              {
                formatFileSize(
                  (1024 * 1024 * 1024)
                  - totalStorage
                )
              }

            </p>

          </div>

        </div>


        {/* Upload Section */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-8">

          <div className="flex items-center gap-3 mb-5">

            <FaCloudUploadAlt className="text-blue-600 text-3xl" />

            <h2 className="text-2xl font-bold text-gray-800">
              Upload File
            </h2>

          </div>


          <form
            onSubmit={handleUpload}
            className="flex flex-col md:flex-row gap-4"
          >

            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 transition duration-300 p-4 rounded-2xl w-full bg-blue-50"
            />

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white px-8 py-3 rounded-2xl shadow-lg transition duration-300 font-semibold"
            >
              Upload
            </button>

          </form>

        </div>


        {/* Search Bar */}
        <div className="mb-8">

          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full p-4 rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>


        {/* Files Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">

          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Your Files
          </h2>

          <p className="text-gray-500 font-medium">

            Total Files:
            {" "}

            <span className="text-blue-600 font-bold">
              {filteredFiles.length}
            </span>

          </p>

        </div>


        {/* Empty State */}
        {
          filteredFiles.length === 0 && (

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">

              <FaCloudUploadAlt className="text-6xl text-blue-400 mx-auto mb-4" />

              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No Files Uploaded
              </h3>

              <p className="text-gray-500">
                Upload your first file to get started 🚀
              </p>

            </div>
          )
        }


        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {
            filteredFiles.map((file) => (

              <div
                key={file._id}
                className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >

                {/* File Name */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 break-words">

                  {file.original_filename}

                </h3>


                {/* File Type */}
                <p className="text-gray-500 text-sm mb-2">

                  Type:
                  {" "}

                  <span className="font-semibold text-gray-700">

                    {file.file_type}

                  </span>

                </p>


                {/* File Size */}
                <p className="text-gray-500 text-sm mb-2">

                  Size:
                  {" "}

                  <span className="font-semibold text-gray-700">

                    {
                      formatFileSize(
                        file.file_size || 0
                      )
                    }

                  </span>

                </p>


                {/* Upload Date */}
                <p className="text-gray-400 text-sm mb-5">

                  Uploaded:
                  {" "}

                  {
                    file.created_at
                      ? new Date(
                          file.created_at
                        ).toLocaleString()
                      : "Unknown"
                  }

                </p>


                {/* Buttons */}
                <div className="flex gap-3">

                  {/* Download */}
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white px-4 py-2 rounded-2xl shadow-md transition duration-300"
                  >

                    <FaDownload />

                    Download

                  </a>


                  {/* Delete */}
                  <button
                    onClick={() =>
                      handleDelete(file._id)
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 text-white px-4 py-2 rounded-2xl shadow-md transition duration-300"
                  >

                    <FaTrash />

                    Delete

                  </button>

                </div>

              </div>
            ))
          }

        </div>

      </div>

    </div>
  );
}

export default Dashboard;