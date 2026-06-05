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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">
        Game Over
      </h1>

      <h2 className="text-xl">
        Winner: {winner?.name}
      </h2>

      <h3 className="text-lg">
        Score: {winner?.score}
      </h3>
    </div>
  </div>
  );
}

export default GameOver;