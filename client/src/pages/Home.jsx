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

    socket.emit("create_room", {
      name,
    });
  };

  useEffect(() => {
    socket.on("room_created", (data) => {
      setRoomId(data.roomId);

      // Navigate to room page
      navigate(`/room/${data.roomId}`);
    });

    return () => {
      socket.off("room_created");
    };
  }, [navigate]);

  return (
    <div>
      <h1>SketchSync</h1>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={createRoom}>
        Create Room
      </button>

      {roomId && (
        <h2>
          Room ID: {roomId}
        </h2>
      )}
    </div>
  );
}

export default Home;