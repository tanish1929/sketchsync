import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function GameOver() {
  const [winner, setWinner] =
    useState(null);

  const [gameOver, setGameOver] =
    useState(false);

  useEffect(() => {
    socket.on(
      "game_over",
      (data) => {
        setWinner(data.winner);
        setGameOver(true);
      }
    );

    return () => {
      socket.off("game_over");
    };
  }, []);

  if (!gameOver) return null;

  return (
    <div>
      <h1>Game Over</h1>

      <h2>
        Winner:
        {" "}
        {winner?.name}
      </h2>

      <h3>
        Score:
        {" "}
        {winner?.score}
      </h3>
    </div>
  );
}

export default GameOver;