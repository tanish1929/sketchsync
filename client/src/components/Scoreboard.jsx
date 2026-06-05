import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function Scoreboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Listen for player joined to get initial list
    socket.on("player_joined", (data) => {
      if (data.players) {
        setPlayers(
          data.players
            .map((p) => ({
              id: p.id,
              name: p.name,
              score: p.score || 0,
            }))
            .sort((a, b) => b.score - a.score)
        );
      }
    });

    // Listen for round end to update scores
    socket.on("round_end", (data) => {
      if (data.scores) {
        setPlayers(
          data.scores
            .map((p) => ({
              name: p.name,
              score: p.score || 0,
            }))
            .sort((a, b) => b.score - a.score)
        );
      }
    });

    // Listen for correct guesses
    socket.on("correct_guess", (data) => {
      setPlayers((prev) =>
        prev
          .map((p) =>
            p.name === data.playerName
              ? { ...p, score: (p.score || 0) + 10 }
              : p
          )
          .sort((a, b) => b.score - a.score)
      );
    });

    return () => {
      socket.off("player_joined");
      socket.off("round_end");
      socket.off("correct_guess");
    };
  }, []);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-3">Leaderboard</h2>
      {players.length > 0 ? (
        <div className="space-y-2">
          {players.map((player, idx) => (
            <div
              key={idx}
              className="flex justify-between p-2 bg-gray-100 rounded"
            >
              <span className="font-semibold">
                {idx + 1}. {player.name}
              </span>
              <span className="text-blue-600 font-bold">
                {player.score || 0} pts
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No players yet</p>
      )}
    </div>
  );
}

export default Scoreboard;