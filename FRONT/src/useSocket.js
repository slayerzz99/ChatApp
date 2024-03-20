import { useEffect, useState, useMemo } from "react";
import io from "socket.io-client";

let socketInstance;

const useSocket = token => {
  const socket = useMemo(
    () => {
      if (!socketInstance) {
        socketInstance = io(process.env.REACT_APP_URL, {
          auth: {
            token: token
          }
        });
      }
      return socketInstance;
    },
    [token]
  );

  useEffect(() => {
    if (socket && socket !== socketInstance) {
      socket.close();
    }

    if (socket) {
      socket.off("receive");
    }
  }, [socket]);

  return socket;
};

export default useSocket;

// import { useEffect, useState, useMemo } from "react";
// import io from "socket.io-client";

// const useSocket = token => {
//   const socket = useMemo(
//     () => {
//       return io("https://node-h6he.onrender.com", {
//         auth: {
//           token: token
//         }
//       });
//     },
//     [token]
//   );

//   useEffect(
//     () => {
//       // Cleanup on unmount
//       return () => {
//         socket.disconnect();
//       };
//     },
//     [socket]
//   );

//   return socket;
// };

// export default useSocket;
