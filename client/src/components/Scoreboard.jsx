import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function Scoreboard() {
  const [players, setPlayers] =
    useState([]);

  useEffect(() => {
    socket.on(
      "score_update",
      (updatedPlayers) => {
        setPlayers(updatedPlayers);
      }
    );

    return () => {
      socket.off("score_update");
    };
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>

      {players.map((player) => (
        <p key={player.id}>
          {player.name} - {player.score}
        </p>
      ))}
    </div>
  );
}

export default Scoreboard;