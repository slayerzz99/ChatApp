import { useEffect, useState, useMemo } from "react";
import io from "socket.io-client";
import Notification from "./notification";
import toast from "react-hot-toast";
import ChatScreen from "./ChatScreen";

let socketInstance;

const useSocket = token => {
  const useId = localStorage.getItem("userId");

  const URL = "https://chatappbytilak.onrender.com";

  const socket = useMemo(
    () => {
      if (!socketInstance) {
        socketInstance = io(URL, {
          auth: {
            token: token
          }
        });
      }
      return socketInstance;
    },
    [token]
  );

  useEffect(
    () => {

    socket.on("connect", () => {
      console.log("socket connected", socket?.id);

      socket.emit("userId", useId);
      console.log("emit id", useId);

      socket.on("recive", (data) => {
        console.log("Received message:", data);
  
        toast.custom((t) => (
          <Notification t={t} data={data} useId={useId}/>
        ))
      });

    })


      if (socket && socket !== socketInstance) {
        socket.close();
      }

    },
    [socket]
  );

  return socket;
};

export default useSocket;

