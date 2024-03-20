import { Link, useNavigate, useNavigation } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [apiErr, setApiErr] = useState("");

  const navigate = useNavigate();

  const URL = process.env.REACT_APP_API_URL;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log(formData);

    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? "Email is required" : "",
        password: !formData.password ? "Password is required" : ""
      });
      return;
    }

    try {
      setErrors({
        email: !formData.email ? "Email is required" : "",
        password: !formData.password ? "Password is required" : ""
      });

      const response = await fetch(`${URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      const userID = responseData.userId;
      const token = responseData.result;

      localStorage.setItem("userId", userID);
      localStorage.setItem("token", token);

      document.cookie = `token=${responseData.result}; max-age=${responseData.maxAge}; secure=${responseData.secure
        ? "true"
        : "false"};`;

      console.log(responseData);
      if (responseData.result != null) {
        navigate("/dashboard");
      } else {
        setApiErr(responseData.message);
      }
    } catch (err) {
      console.log(err);
      setApiErr("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-[35%]">
        <h1 className="text-2xl font-bold mb-6">Welcome to Chat Room</h1>
        <div className="mb-4">
          <form className="w-full">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Enter your Details To Login
            </label>
            <input
              type="email"
              id="email"
              className={`w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password
                ? "border-red-500"
                : ""}`}
              placeholder="Enter your emial"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email &&
              <span className="text-red-500 text-sm w-min">
                {errors.email}
              </span>}
            <input
              type="password"
              id="password"
              className={`w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password
                ? "border-red-500"
                : ""}`}
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password &&
              <span className="text-red-500 text-sm w-min">
                {errors.password}
              </span>}
          </form>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mb-4 w-full"
        >
          Continue
        </button>
        {apiErr &&
          <p className="text-red-500 text-center">
            {apiErr}
          </p>}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:text-blue-700">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
