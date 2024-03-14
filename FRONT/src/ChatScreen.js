import { io } from "socket.io-client";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";

function ChatScreen() {
  const [users, setUsers] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgList, setMsgList] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const params = useParams();
  const id = params.id;

  const useId = localStorage.getItem("userId");
  console.log("useId", useId);
  const token = localStorage.getItem("token");

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

  const URL = "https://node-h6he.onrender.com/api";

     const socket = useMemo(() => {
        const tokenz = getTokenFromCookie();
        return io("https://node-h6he.onrender.com", {
          auth: {
            token: token
          }
        });
      }, []);

      useEffect(() => {
        // Log socket connection status
        console.log("Socket connected:", socket.id);
      
        // Event listener for receiving messages
        socket.on("recive", (data) => {
          console.log("Received message:", data);
      
          // Add the received message to the messages state
          setMessages((prevMessages) => [...prevMessages, data]);
        });

        socket.emit("userId", useId);

      
      }, []); // Dependency array includes the socket object
      
      useEffect(() => {
        console.log("Messages updated:", messages);
      }, [messages]); // Log messages whenever it's updated
      
      const fetchMessages = async () => {
        try {
          const response = await fetch(`${URL}/messages/${useId}/${id}`);
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

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();

    // Check if the message date is before today
    if (messageDate < today) {
      // Return time only for past dates
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // Return empty string for current date (will be handled separately)
      return "";
    }
  };

  const renderMessages = () => {
    let currentDate = null; // Track the current date to determine when to display it
  
    return messages.map((message, index) => {
      // Convert message timestamp to a Date object
      const messageDate = new Date(message.timestamp);
      const formattedTime = formatDate(messageDate);
  
      // Check if the current message has a different date from the previous one
      const showDate = messageDate.toLocaleDateString() !== currentDate;
      currentDate = messageDate.toLocaleDateString();

      const delChat = async (id) => {
        const res = fetch(`${URL}/deletemessages/${id}`, {
          method: 'DELETE',
        })

        const resp = await res.json();
        console.log("deleeing" , resp);

        fetchMessages();

      }
  
      return (
        <div className="flex items-center" key={index}>
          <div>
          {showDate && <div className="text-center mb-2 w-[10rem]">{currentDate}</div>}
          <div className={message.senderId === useId ? "bg-blue-400 w-[15rem] text-right" : "bg-green-400 w-[15rem] text-left"}>
            <div className="msgg">{message.message}</div>
            <div className="text-xs">{formattedTime}</div>
          </div>
          </div>
          <button onClick={() => delChat(message._id)}>Delete</button>
        </div>
      );
    });
  };

  const handleSub = () => {
    if (!users) {
      console.error("Users state is null");
      return;
    }

    const recipientId = users._id;
    const senderId = useId;

    console.log("pay" , senderId, recipientId, msg);
    socket.emit("msg", { senderId, recipientId, msg });
    setMsg(""); // Clear input after sending message
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSub();
    }
  };

  return (
    <div className="chat-container2">
            <Header/>

      <p>Talking to : {users?.name}</p>
      <img className="w-6 h-6" src={users?.profilePic}></img>
    <div className="chat-container">
      <div className="messages-container">
      {/* {messages.map((message, index) => (
        <div key={index} className={message.senderId === useId ? "bg-blue-400 w-[15rem] text-right" : "bg-green-400 w-[15rem] text-left"}>
          <div>{message.message}</div>
          <div className="text-xs">{formatDate(message.timestamp)}</div>
        </div>
      ))} */}
              {renderMessages()}

      </div>
    </div>
      <div className="input-container">
        <input
          placeholder="Type a message..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          disabled={loading} // Disable input while loading
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSub} disabled={loading}>Send</button>
      </div>
    </div>
  );
}


export default ChatScreen;
