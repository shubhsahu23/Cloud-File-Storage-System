import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  FaEnvelope,
  FaLock
} from "react-icons/fa";

import API from "../api/axios";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      password: ""
    });


  // Handle Input Change
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value
    });
  };


  // Handle Login
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      console.log(formData);

      const payload = {
        email: formData.email,
        password: formData.password
      };

      const response = await API.post(
        "/auth/login",
        payload
      );

      // Save Token
      localStorage.setItem(
        "token",
        response.data.access_token
      );

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.detail ||
        "Login failed"
      );
    }
  };


  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 px-4">

      {/* Card */}
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-gray-100">

        {/* Logo / Title */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">

            CloudVault

          </h1>

          <p className="text-gray-500 mt-2">
            Secure cloud file storage
          </p>

        </div>


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}
          <div>

            <label className="block text-gray-700 font-medium mb-2">

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

            <label className="block text-gray-700 font-medium mb-2">

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


          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white py-3 rounded-2xl font-semibold shadow-lg transition duration-300"
          >

            Login

          </button>

        </form>


        {/* Footer */}
        <p className="text-center text-gray-500 mt-6">

          Don’t have an account?
          {" "}

          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >

            Register

          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;