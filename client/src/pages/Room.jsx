import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function Room() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("player_joined", (data) => {
      setPlayers(data.players);
    });

    return () => {
      socket.off("player_joined");
    };
  }, []);

  return (
    <div>
      <h1>Room Lobby</h1>

      <h2>Players</h2>

      {players.map((player) => (
        <p key={player.id}>
          {player.name}
        </p>
      ))}
    </div>
  );
}

export default Room;