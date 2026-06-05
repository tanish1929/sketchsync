import { useState, useEffect } from "react";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";

function Home() {
  const [name, setName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const navigate = useNavigate();

  const createRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    localStorage.setItem(
      "playerName",
      name
    );

    socket.emit("create_room", {
      name,
    });
  };

  const joinRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!joinRoomId.trim()) {
      alert("Please enter a room ID");
      return;
    }

    localStorage.setItem(
      "playerName",
      name
    );

    navigate(`/room/${joinRoomId}`);
  };

  useEffect(() => {
    socket.on(
      "room_created",
      (data) => {
        navigate(
          `/room/${data.roomId}`
        );
      }
    );

    return () => {
      socket.off("room_created");
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-4xl font-bold text-center mb-6">
          SketchSync
        </h1>

        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        <button
          onClick={createRoom}
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
        >
          Create Room
        </button>

        <div className="mt-6 text-center text-gray-400">
          ─── OR ───
        </div>

        <input
          type="text"
          placeholder="Enter Room ID"
          value={joinRoomId}
          onChange={(e) =>
            setJoinRoomId(e.target.value)
          }
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 mt-6 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={joinRoom}
          className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default Home;