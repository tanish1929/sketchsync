import { useState, useEffect } from "react";
import { socket } from "../socket/socket";

function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    socket.emit("create_room", {
      name,
    });
  };

  useEffect(() => {
    socket.on("room_created", (data) => {
      setRoomId(data.roomId);
    });

    return () => {
      socket.off("room_created");
    };
  }, []);

  return (
    <div>
      <h1>SketchSync</h1>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <button onClick={createRoom}>
        Create Room
      </button>

      <h2>{roomId}</h2>
    </div>
  );
}

export default Home;