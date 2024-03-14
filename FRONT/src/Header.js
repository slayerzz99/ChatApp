import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState("");
  const [visible, setVisible] = useState(false);
  // const [file, setFile] = useState(null);


  const URL = "https://node-h6he.onrender.com/api";

  const logOut = () => {
    localStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    navigate("/");
  };

  const fetchData = async () => {
    if (!token) {
      navigate("/");
      return;
    }

    console.log(token);
    try {
      const response = await fetch(`${URL}/user/getUserById/${userId}`, {
        headers: {
          Authorization: `${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const res = await response.json();
      setUsers(res?.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const uploadFile = async (data) => {
    const response = await fetch(`${URL}/user/upload-profile-pic`, {
      method: "POST",
      headers: {
        Authorization: token
      },
      body: data
    });

    const responseData = await response.json();
    console.log("urll", responseData);

    return responseData?.profilePicUrl;
  };

  const addPic = async (e) => {
    setVisible(false);
    console.log("file", e.target.result);

    let formData = new FormData();

    formData.append("avatar", e.target.files[0]);

    const response = await uploadFile(formData);
    console.log("pro resp", response);
    fetchData();
  };


  return (
    <>
    <div className="text-center flex gap-4 absolute top-0 right-[10%] mt-1">
      <button onClick={() => logOut()}>Logout</button>
      <img onClick={() => setVisible(prev => !prev)} className="w-8 h-8 cursor-pointer rounded-full" src={users.profilePic} />
      </div>
      {(visible || !users.profilePic) && <div className="items-center justify-center bg-white text-center flex gap-4 absolute top-[7%] right-[8%] mt-1">
        <label className="w-36 flex flex-col items-center bg-[#1DC7EA] text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
          <span className="mt-2 text-white">
            {users.profilePic ? "Update" : "Add"} your Profile pic
          </span>
          <input
            type="file"
            name="avatar"
            onChange={(e) => addPic(e)}
            className="hidden"
          />
        </label>
      </div>}
    </>
  );
}

export default Header;
