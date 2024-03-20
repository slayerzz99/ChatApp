import { Link, useNavigate, useNavigation } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [apiErr, setApiErr] = useState("");

  const navigate = useNavigate();

  const URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${URL}/user/getAllUsers`).catch(err => {
      console.log("in register", err);
    });
  }, []);

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

    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.confirmPassword
    ) {
      setErrors({
        email: !formData.email ? "Email is required" : "",
        password: !formData.password ? "Password is required" : "",
        name: !formData.name ? "Name is required" : "",
        confirmPassword: !formData.confirmPassword
          ? "Confirm Password is required"
          : ""
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({
        confirmPassword: formData.confirmPassword
          ? "Confirm Password and Password do not match"
          : ""
      });
      return;
    }

    try {
      setErrors({});
      const response = await fetch(`${URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      const userID = responseData.userId;

      localStorage.setItem("userId", userID);

      document.cookie = `token=${responseData.result}; max-age=${responseData.maxAge}; secure=${responseData.secure
        ? "true"
        : "false"};`;

      console.log(responseData);
      if (responseData.result != null) {
        localStorage.setItem("token", responseData.result);
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
              htmlFor="name"
              className="block text-gray-700 font-bold mb-2"
            >
              Enter your Details To Register
            </label>
            <input
              type="text"
              id="name"
              className={`w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name
                ? "border-red-500"
                : ""}`}
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name &&
              <span className="text-red-500 text-sm w-min">
                {errors.name}
              </span>}

            <input
              type="email"
              id="email"
              className={`w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email
                ? "border-red-500"
                : ""}`}
              placeholder="email@gmail.com"
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
              placeholder="XXXXXXXXXXXXXX"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password &&
              <span className="text-red-500 text-sm w-min">
                {errors.password}
              </span>}

            <input
              type="password"
              id="confirmPassword"
              className={`w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword
                ? "border-red-500"
                : ""}`}
              placeholder="XXXXXXXXXXXXXX"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword &&
              <span className="text-red-500 text-sm w-min">
                {errors.confirmPassword}
              </span>}
          </form>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mb-4 w-full"
        >
          Continue with Email
        </button>
        {apiErr &&
          <p className="text-red-500 text-center">
            {apiErr}
          </p>}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="login" className="text-blue-500 hover:text-blue-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
