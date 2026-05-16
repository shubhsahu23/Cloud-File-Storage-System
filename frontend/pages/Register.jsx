import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaLock
} from "react-icons/fa";

import API from "../api/axios";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: ""
    });


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value
    });
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.post(
        "/auth/register",
        formData
      );

      alert(
        "Registration Successful"
      );

      navigate("/");

    } catch (error) {

      alert(
        error.response?.data?.detail ||
        "Registration failed"
      );
    }
  };


  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 px-4">

      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-gray-100">

        {/* Title */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">

            CloudVault

          </h1>

          <p className="text-gray-500 mt-2">
            Create your secure account
          </p>

        </div>


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Name */}
          <div>

            <label className="text-gray-700 font-medium block mb-2">
              Name
            </label>

            <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">

              <FaUser className="text-gray-400 mr-3" />

              <input
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent"
              />

            </div>

          </div>


          {/* Email */}
          <div>

            <label className="text-gray-700 font-medium block mb-2">
              Email
            </label>

            <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">

              <FaEnvelope className="text-gray-400 mr-3" />

              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent"
              />

            </div>

          </div>


          {/* Password */}
          <div>

            <label className="text-gray-700 font-medium block mb-2">
              Password
            </label>

            <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">

              <FaLock className="text-gray-400 mr-3" />

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent"
              />

            </div>

          </div>


          {/* Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white py-3 rounded-2xl font-semibold shadow-lg transition duration-300"
          >
            Register
          </button>

        </form>


        {/* Footer */}
        <p className="text-center text-gray-500 mt-6">

          Already have an account?
          {" "}

          <Link
            to="/"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;