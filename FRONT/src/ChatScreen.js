import { io } from "socket.io-client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import fb from "./asset/image/fb.png";
import useSocket from "./useSocket";
import toast from "react-hot-toast";
import Notification from "./notification";

function ChatScreen() {
  const [users, setUsers] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgList, setMsgList] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [messages, setMessages] = useState([]);
  const [vis, setVis] = useState(false); // Add loading state
  const [edMsgs, setEdMsgs] = useState(null);
  const [edtype, setedtype] = useState(" ");
  const bottomRef = useRef(null);

  const navigate = useNavigate();

  const params = useParams();
  const id = params.id;

  const useId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const userPic = localStorage.getItem("userPic");

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

  const socket = useSocket(token); // Use the useSocket hook

  useEffect(() => {
    if (!socket) return;

    // Log socket connection status
    console.log("Socket connected:", socket);

    // Event listener for receiving messages
    socket.on("recive", (data) => {
      console.log("Received message:", data);

      // Add the received message to the messages state
      setMessages((prevMessages) => [...prevMessages, data]);

      toast.custom((t) => (
        <Notification t={t} data={data} useId={useId}/>
      ))
      
      fetchMessages();
    });

    socket.emit("userId", useId);

    return () => {
      socket.off("receive");
    };
  }, [socket]);

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

  useEffect(() => {
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();

    // Check if the message date is before today
    if (messageDate < today) {
      // Return time only for past dates
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else {
      // Return empty string for current date (will be handled separately)
      return "";
    }
  };

  const renderMessages = () => {
    let currentDate = null;

    return messages.map((message, index) => {
      const messageDate = new Date(message.timestamp);
      const formattedTime = formatDate(messageDate);

      const showDate = messageDate.toLocaleDateString() !== currentDate;
      currentDate = messageDate.toLocaleDateString();

      const editChat = async (id, mes) => {
        let msg = edtype;

        if(msg == "" || msg == " "){
          msg = mes
        }
        const data = {
          message: msg
        };

        setVis(false);
        setedtype(" ");


        try {
          const res = await fetch(
            `${URL}/editmessage/${id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
            }
          );


          const myprom = fetchMessages();
          toast.promise(myprom, {
            loading: 'Loading',
            success: 'Updated Successfully!',
            error: 'Error occured!',
          });

        } catch (err) {
          console.log(err);
        }
      };

      const delChat = async (id) => {
        try {
          const res = await fetch(`${URL}/deletemessages/${id}`, {
            method: "DELETE"
          });
          
          const myprom = fetchMessages();
          toast.promise(myprom, {
            loading: 'Loading',
            success: 'Deleted Successfully!',
            error: 'Error occured!',
          });
          

        } catch (err) {
          console.log(err);
        }
      };

      console.log("ed", edtype);

      return (
        <div className="flex flex-col" key={index}>
          <div className="flex-grow overflow-y-auto">
            {showDate && (
              <div className="mb-2 font-semibold flex justify-center p-2">
                <p className="bg-gray-500 p-2 rounded-lg">{currentDate}</p>
              </div>
            )}
            <div className="p-4">
              <div
                className={
                  message.senderId !== useId
                    ? "mb-1 flex gap-1"
                    : "mb-1 flex justify-end gap-3"
                }
              >
                {message.senderId !== useId && (
                  <img
                    className="w-8 h-8 rounded-full"
                    src={users?.profilePic ? users.profilePic : fb}
                  ></img>
                )}
                <div
                  className={
                    message.senderId !== useId
                      ? "bg-gray-200 rounded-lg p-2 max-w-[45%] inline-block"
                      : "bg-green-200 rounded-lg p-2 max-w-[45%] inline-block"
                  }
                >
                  {vis && edMsgs == message._id ? (
                    <input
                      value={edtype === " " ? message.message : edtype}
                      onChange={(e) => setedtype(e.target.value)}
                    ></input>
                  ) : (
                    <p className="msgg">{message.message}</p>
                  )}
                  <div className="text-xs">{formattedTime}</div>
                </div>
                {message.senderId == useId && (
                  <>
                    <div className="flex items-center gap-3">
                      <img
                        className="w-8 h-8 rounded-full"
                        src={userPic ? userPic : fb}
                      ></img>
                      <button
                        onClick={() => {
                          setVis((prev) => !prev);
                          setEdMsgs(message._id);
                        }}
                        className="mr-2"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </div>

                    {vis && edMsgs == message._id && (
                      <div className="flex flex-col justify-center gap-3">
                        <button
                          onClick={() => {
                            editChat(message._id, message.message);
                          }}
                          className="border border-black rounded-lg p-2"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => delChat(message._id)}
                          className="border border-black rounded-lg p-2"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </>
                )}{" "}
              </div>
            </div>
          </div>
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
      `${URL}/deleteallmessages/userId=${useId}&senderId=${id}`,
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
      </div>

      <div className="chat-container">
        <div className="messages-container">{renderMessages()}</div>
        <div ref={bottomRef} />
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
// <div className="flex items-center" key={index}>
        //   <div>
        //     {showDate && (
        //       <div className="text-center mb-2 w-[10rem]">{currentDate}</div>
        //     )}
        //     <div
        //       className={
        //         message.senderId === useId
        //           ? "bg-blue-400 w-[15rem] text-right"
        //           : "bg-green-400 w-[15rem] text-left"
        //       }
        //     >
        //       {vis && edMsgs == message._id ? (
        //         <input
        //           value={edtype == " " ? message.message : edtype}
        //           onChange={(e) => setedtype(e.target.value)}
        //         ></input>
        //       ) : (
        //         <div className="msgg">{message.message}</div>
        //       )}
        //       <div className="text-xs">{formattedTime}</div>
        //     </div>
        //   </div>
        //   {vis && edMsgs == message._id ? (
        //     <div className="flex gap-2">
        //       <button
        //         onClick={() => {
        //           setVis(false);
        //           setedtype(" ");
        //         }}
        //       >
        //         Cancel
        //       </button>
        //       <button
        //         onClick={() => {
        //           editChat(message._id);
        //         }}
        //       >
        //         Submit
        //       </button>
        //     </div>
        //   ) : (message.senderId == useId &&
        //     <button
        //       onClick={() => {
        //         setEdMsgs(message._id);
        //         setVis(true);
        //       }}
        //     >
        //       Edit
        //     </button>
        //   )}
        //   <button className="ml-2" onClick={() => delChat(message._id)}>
        //     Delete
        //   </button>
        // </div>