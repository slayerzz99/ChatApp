import { io } from "socket.io-client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import fb from "./asset/image/fb.png";
import useSocket from "./useSocket";
import toast from "react-hot-toast";
import Notification from "./notification";
import { RenderMessages } from "./RenderMsg";

function ChatScreen() {
  const [users, setUsers] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  const params = useParams();
  const id = params.id;

  const useId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const userPic = localStorage.getItem("userPics");

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

  const URL = process.env.REACT_APP_API_URL;

  const socket  = useSocket(token); 

  
  useEffect(() => {
    if (!socket) return;

    // Event listener for receiving messages
    socket.on("recive", (data) => {
      console.log("Received message:", data);
      // Add the received message to the messages state
      setMessages((prevMessages) => [...prevMessages, data]);

      fetchMessages();
    });
  }, [socket]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${URL}/message/getAllMessages/${useId}/${id}`, 
      {headers: {
        Authorization: `${token}`
      }}
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchData = async () => {
    const tokenz = getTokenFromCookie();

    if (!token) {
      navigate("/");
      return;
    }

    console.log(token);
    try {
      const response = await fetch(`${URL}/user/getUserById/${id}`, {
        headers: {
          Authorization: `${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const res = await response.json();
      setUsers(res?.result);
      setLoading(false); // Update loading state once data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchData();
  }, [id]);

  // useEffect(() => {
  //   bottomRef.current.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);


  const handleSub = () => {
    if (!users) {
      console.error("Users state is null");
      return;
    }

    const recipientId = users._id;
    const senderId = useId;
    const name = userName;

    console.log("pay", senderId, recipientId, msg);
    socket.emit("msg", { senderId, recipientId, msg, name });
    setMsg(""); // Clear input after sending message
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSub();
    }
  };

  const deleteAllChat = async () => {
    const result = await fetch(
      `${URL}/message/deleteallmessages/userId=${useId}&senderId=${id}`,
      {
        method: "DELETE"
      }
    );

    const res = await result.json();
    console.log("del all messages", res);

    fetchMessages();
  };


  return (
    <div className="chat-container2">
      {/* <Header /> */}
      <div className="fixed flex items-center gap-4 mt-1 left-[18%]">
        <p>
          Talking to : <span className="font-semibold">{users?.name}</span>
        </p>
        <button
          onClick={() => deleteAllChat()}
          className="text-red-600 border-2 rounded-lg p-2 border-red-600"
        >
          {" "}
          Delete All Chats
        </button>
        <button onClick={() => navigate(`/videocall/${id}`)} className="text-blue-600 border-2 rounded-lg p-2 border-blue-600"
        >Video call</button>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          <RenderMessages users={users} msg={messages}/>
          </div>
      </div>

      <div className="p-4 flex gap-1">
        <input
          placeholder="Type a message..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          disabled={loading} // Disable input while loading
          onKeyPress={handleKeyPress}
          className="w-full border rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleSub} disabled={loading}>
          <i className="fa fa-paper-plane fa-lg" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

export default ChatScreen;
