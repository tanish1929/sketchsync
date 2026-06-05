import { useState, useEffect } from "react";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";

function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

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

  useEffect(() => {
    socket.on(
      "room_created",
      (data) => {
        setRoomId(data.roomId);

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

        {roomId && (
          <h2 className="mt-4 text-center text-gray-700">
            Room ID: {roomId}
          </h2>
        )}
      </div>
    </div>
  );
}

export default Home;