import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function VideoCallNotification({t, data, useId}){
    const navigate = useNavigate();
    
    return(
        <>
         { data && data?.senderId !== useId && <div
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
  >
    <div className="flex-1 w-0 p-4 cursor-pointer">
      <div className="flex items-start">
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            Call From: <span className="font-semibold">{data?.senderName}</span>
          </p>
        <button className="text-green-600 border-2 rounded-lg p-2 border-green-600"
         onClick={() => {navigate(`videocall/${data?.senderId}`)}}>
            Answer
        </button>
        </div>
      </div>
    </div>
    <div className="flex border-l border-gray-200">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Close
      </button>
    </div>
  </div>}

        </>
    )
}