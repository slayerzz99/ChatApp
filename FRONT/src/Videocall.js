import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fb from "./asset/image/fb.png";
import useSocket from "./useSocket";
import toast from "react-hot-toast";
import Notification from "./notification";
import Peer from "simple-peer";


function Videocall() {
  const [users, setUsers] = useState(null);
  const [ me, setMe ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()

  const navigate = useNavigate();

  const params = useParams();
  const id = params.id;

  const useId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const userPic = localStorage.getItem("userPics");

  const URL = process.env.REACT_APP_API_URL;

  const socket  = useSocket(token); 

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
      if(myVideo.current){
				myVideo.current.srcObject = stream
      }
		})

  },[])
  
  useEffect(() => {
    if (!socket) return;

    socket.on("me", (id) => {
			setMe(id)
		})

		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
  }, [socket]);

  const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				userVideo.current.srcObject = stream
			
		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}


  const fetchData = async () => {
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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);


  return (
    <div className="chat-container2">
      {/* <Header /> */}
      <div className="fixed flex items-center gap-4 mt-1 left-[18%]">
        <p>
          Talking to : <span className="font-semibold">{users?.name}</span>
        </p>
      </div>

      <>
			<h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
		<div className="container">
			<div className="video-container">
				<div className="video">
					{<video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
				</div>
				<div className="video">
					{callAccepted && !callEnded ?
					<video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />:
					null}
				</div>
			</div>
			<div className="myId">

				<p>Me id {me}</p>

				<input
					id="filled-basic"
					label="ID to call"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/>
				<div className="call-button">
					{callAccepted && !callEnded ? (
						<button onClick={leaveCall}>
							End Call
						</button>
					) : (
						<button color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
							Phone icon
						</button>
					)}
					{idToCall}
				</div>
			</div>

			<div>
				{receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
						<button variant="contained" color="primary" onClick={answerCall}>
							Answer
						</button>
					</div>
				) : null}
			</div>

		</div>
		</>

      
    </div>
  );
}

export default Videocall;
