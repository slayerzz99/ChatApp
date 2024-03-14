import { useNavigate, useNavigation } from "react-router-dom";
import "./App.css";
import { useEffect, useMemo, useState } from "react";
import fb from "./asset/image/fb.png"
import { io } from "socket.io-client";
import Header from "./Header";


function Dashboard() {
  const [users, setUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);


  const navigate = useNavigate();
  const useId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");


  const URL = "https://node-h6he.onrender.com/api";

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === "token") {
        return value;
      }
    }
    return null;
  };

  const socket = useMemo(() => {
    const tokenz = getTokenFromCookie();
    return io("https://node-h6he.onrender.com", {
      auth: {
        token: token
      }
    });
  }, [getTokenFromCookie]);  


  useEffect(() => {

    socket.on("connect", () => {
      console.log("socket connected", socket?.id);
    })

    const fetchData = async () => {
      const tokenz = getTokenFromCookie();

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${URL}/user/getAllUsers`, {
          headers: {
            Authorization: `${token}`
          }
       });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        // Process response data here if needed
        const res = await response.json();
        const res2 = res.result.filter(item => item._id != useId);
        setUsers(res2);
        setFilterUsers(res2);
        // console.log("Response", res?.result);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      // Clean up the socket connection when the component unmounts
      socket.disconnect();
    };
  }, []);


  // console.log("socket connected22", socket?.id);

  const gotoChat = (id) => {
    navigate(`/chat-to/${id}`)
  }

  const callSearch = (e) => {
    const seacrhText = e.target.value;
    if(users.length > 0){
      if(seacrhText == ""){
        setFilterUsers(users);
      }
      else{
        const users2 = users.filter(user => user.name.toLowerCase().includes(seacrhText.toLowerCase()))
        setFilterUsers(users2);
      }
    }
  }

  return (
    <div className="text-center">
      <Header/>
      <p>Users</p>
      <input type="text" placeholder="search user" onChange={(e) => callSearch(e)} className="mb-3"></input>
      {filterUsers && filterUsers.map((user) => {
        return(
          <div onClick={() => gotoChat(user._id)} className="flex justify-start gap-4 mb-4 relative w-max left-[44%] cursor-pointer" key={user._id}>
          <img className="w-8 h-8 rounded-full" src={user?.profilePic == "" ? fb : user?.profilePic}></img>
          <p>{user.name}</p>
          {/* <p>{user.email}</p> */}
          </div>
        )
      })}
    </div>    
  );
}

export default Dashboard;