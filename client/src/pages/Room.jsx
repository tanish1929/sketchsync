import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import Canvas from "../components/Canvas";

function Room() {
  const { id: roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    // Get player name from localStorage or set a default
    const name = localStorage.getItem("playerName") || "Player";
    setPlayerName(name);

    // Join the room
    socket.emit("join_room", {
      roomId,
      name,
    });

    // Listen for room created event (if navigating from create)
    socket.on("room_created", (data) => {
      setPlayers(data.room.players);
    });

    // Listen for player joined event
    socket.on("player_joined", (data) => {
      setPlayers(data.players);
    });

    // Listen for error messages
    socket.on("error_message", (data) => {
      alert(data.message);
    });

    return () => {
      socket.off("room_created");
      socket.off("player_joined");
      socket.off("error_message");
    };
  }, [roomId]);

  return (
    <div>
      <h1>Room Lobby</h1>

      <h3>Room ID: {roomId}</h3>

      <h2>Players ({players.length})</h2>

      {players.length > 0 ? (
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              {player.name} {player.isDrawer && "(Drawing)"}
            </li>
          ))}
        </ul>
      ) : (
        <p>Waiting for players...</p>
      )}

      <hr />

      <h2>Drawing Board</h2>

      <Canvas />
    </div>
  );
}

export default Room;