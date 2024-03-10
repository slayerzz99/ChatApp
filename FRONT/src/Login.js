import { useNavigate, useNavigation } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const URL = "http://localhost:8000/api";

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

    try {
      const response = await fetch(`${URL}/user/login`, {
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
        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />{" "}
        <label>Email</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        <label>Password</label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
