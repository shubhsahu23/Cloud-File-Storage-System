import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

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

      console.log(error);
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


  useEffect(() => {

    fetchFiles();

  }, []);


  return (

    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-blue-600">
          Cloud Storage
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>


      <div className="max-w-6xl mx-auto p-6">

        {/* Storage Usage */}
        <div className="bg-blue-100 text-blue-700 p-4 rounded-xl mb-6">

          Storage Used:
          {" "}

          {
            formatFileSize(
              totalStorage
            )
          }

        </div>


        {/* Upload Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

          <h2 className="text-2xl font-semibold mb-4">
            Upload File
          </h2>

          <form
            onSubmit={handleUpload}
            className="flex flex-col md:flex-row gap-4"
          >

            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
              className="border p-3 rounded-lg w-full"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Upload
            </button>

          </form>

        </div>


        {/* Search Bar */}
        <div className="mb-6">

          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>


        {/* File Count */}
        <p className="text-gray-600 mb-4">

          Total Files:
          {" "}

          {filteredFiles.length}

        </p>


        {/* Files Section */}
        <h2 className="text-3xl font-bold mb-6">
          Your Files
        </h2>


        {/* No Files Message */}
        {
          filteredFiles.length === 0 && (

            <p className="text-gray-500">
              No files found
            </p>
          )
        }


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {
            filteredFiles.map((file) => (

              <div
                key={file._id}
                className="bg-white p-5 rounded-2xl shadow-md"
              >

                <h3 className="text-lg font-semibold mb-2 break-words">
                  {file.original_filename}
                </h3>


                <p className="text-gray-500 text-sm mb-2">

                  Type:
                  {" "}

                  {file.file_type}

                </p>


                <p className="text-gray-500 text-sm mb-2">

                  Size:
                  {" "}

                  {
                    formatFileSize(
                      file.file_size || 0
                    )
                  }

                </p>


                <p className="text-gray-400 text-sm mb-4">

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


                <div className="flex gap-3">

                  <a
                    href={file.file_url}
                    target="_blank"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Download
                  </a>


                  <button
                    onClick={() =>
                      handleDelete(file._id)
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
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