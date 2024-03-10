import { useNavigate, useNavigation } from "react-router-dom";
import "./App.css";
import { useEffect, useMemo, useState } from "react";
import fb from "./asset/image/fb.png"
import { io } from "socket.io-client";


function Dashboard() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [room, setRoom] = useState("");
  const [msg2, setMsg2] = useState([]);

  const navigate = useNavigate();
  const useId = localStorage.getItem("userId");

  const URL = "http://localhost:8000/api";

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
    const token = getTokenFromCookie();
    return io("http://localhost:8000", {
      auth: {
        token: token
      }
    });
  }, [getTokenFromCookie]);  


  useEffect(() => {

    socket.on("connect", () => {
      console.log("socket connected", socket?.id);
    })

    socket.on("recive" , (data) => {
      console.log("recived" , data);
      setMsg2((prev) => [...prev, data]);
    })


    const fetchData = async () => {
      const token = getTokenFromCookie();

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

  const handleSub = () => {
    console.log("click");
    socket.emit("msg", {msg , room});
  }

  console.log("users", msg2);
  // console.log("socket connected22", socket?.id);

  const gotoChat = (id) => {
    navigate(`/chat-to/${id}`)
  }

  return (
    <div className="text-center">
      <p>Users</p>
      {users && users.map((user) => {
        return(
          <div onClick={() => gotoChat(user._id)} className="flex justify-start gap-4 mb-4 relative left-[44%] cursor-pointer" key={user._id}>
          <img className="w-8 h-8 rounded-full" src={user?.profilePic == "" ? fb : user?.profilePic}></img>
          <p>{user.name}</p>
          <p>{user.email}</p>
          </div>
        )
      })}

      <p>{socket.id}</p>

      <input placeholder="msg" onChange={(e) => {setMsg(e.target.value)}} type="text"></input>
      <br/>
      <input placeholder="room" onChange={(e) => {setRoom(e.target.value)}} type="text"></input>
      <button type="submit" onClick={handleSub}>Submit</button>

      <div>{msg2 && msg2.map((item) => {
        return <p key={item.msg}>{item.msg} from {item.room}</p>
      })}</div>
    </div>

    
  );
}

export default Dashboard;
