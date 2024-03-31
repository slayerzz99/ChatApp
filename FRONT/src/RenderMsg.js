import { useEffect, useRef, useState } from "react";
import fb from "./asset/image/fb.png";
import useSocket from "./useSocket";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

export const RenderMessages = ({users, msg}) => {
    const [vis, setVis] = useState(false); // Add loading state
    const [edMsgs, setEdMsgs] = useState(null);
    const [edtype, setedtype] = useState(" ");
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);

    const params = useParams();
    const id = params.id;
    console.log("id", id);

    const URL = process.env.REACT_APP_API_URL;

    const useId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const userPic = localStorage.getItem("userPics");
  
  
    let currentDate = null;

    const formatDate = (timestamp) => {
        const messageDate = new Date(timestamp);
        const today = new Date();
    
        if (messageDate < today) {
          return messageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });
        } else {
          return "";
        }
      };

    const fetchMessages = async () => {
        try {
          const response = await fetch(`${URL}/message/getAllMessages/${useId}/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

    useEffect(() => {
        setMessages(msg);
    },[msg])

    useEffect(() => {
      if(bottomRef.current){
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);

    return messages.map((message, index) => {
      const messageDate = new Date(message?.timestamp);
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
            `${URL}/message/editmessage/${id}`,
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
          const res = await fetch(`${URL}/message/deletemessages/${id}`, {
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
                  message?.senderId !== useId
                    ? "mb-1 flex gap-1"
                    : "mb-1 flex justify-end gap-3"
                }
              >
                {message?.senderId !== useId && (
                  <img
                    className="w-8 h-8 rounded-full"
                    src={users?.profilePic ? users.profilePic : fb}
                  ></img>
                )}
                <div
                  className={
                    message?.senderId !== useId
                      ? "bg-gray-200 rounded-lg p-2 max-w-[45%] inline-block"
                      : "bg-green-200 rounded-lg p-2 max-w-[45%] inline-block"
                  }
                >
                  {vis && edMsgs == message?._id ? (
                    <input
                      value={edtype === " " ? message?.message : edtype}
                      onChange={(e) => setedtype(e.target.value)}
                    ></input>
                  ) : (
                    <p className="msgg">{message?.message}</p>
                  )}
                  <div className="text-xs">{formattedTime}</div>
                </div>
                {message?.senderId == useId && (
                  <>
                    <div className="flex items-center gap-3">
                      <img
                        className="w-8 h-8 rounded-full"
                        src={userPic ? userPic : fb}
                      ></img>
                      <button
                        onClick={() => {
                          setVis((prev) => !prev);
                          setEdMsgs(message?._id);
                        }}
                        className="mr-2"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </div>

                    {vis && edMsgs == message?._id && (
                      <div className="flex flex-col justify-center gap-3">
                        <button
                          onClick={() => {
                            editChat(message?._id, message?.message);
                          }}
                          className="border border-black rounded-lg p-2"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => delChat(message?._id)}
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
          <div ref={bottomRef} />
        </div>
      );
    });
  };