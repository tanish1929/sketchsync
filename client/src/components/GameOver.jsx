import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";

function GameOver() {
  const [winner, setWinner] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("game_over", (data) => {
      setWinner(data.winner);
      setLeaderboard(data.leaderboard || []);
      setGameOver(true);
    });

    return () => {
      socket.off("game_over");
    };
  }, []);

  const handlePlayAgain = () => {
    setGameOver(false);
    navigate("/");
  };

  if (!gameOver) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
        <h1 className="text-4xl font-bold mb-6 text-center text-green-600">
          🎉 Game Over! 🎉
        </h1>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Winner: {winner?.name}
          </h2>
          <p className="text-3xl font-bold text-blue-600">
            {winner?.score} points
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3">Final Leaderboard</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {leaderboard.map((player, idx) => (
              <div
                key={idx}
                className="flex justify-between p-2 bg-gray-100 rounded"
              >
                <span className="font-semibold">
                  {idx + 1}. {player.name}
                </span>
                <span className="text-blue-600 font-bold">
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handlePlayAgain}
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 font-bold"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

export default GameOver;