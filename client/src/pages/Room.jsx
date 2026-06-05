import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

import Canvas from "../components/Canvas";
import Scoreboard from "../components/Scoreboard";
import Timer from "../components/Timer";
import DrawerInfo from "../components/DrawerInfo";
import GameOver from "../components/GameOver";
import ChatPanel from "../components/ChatPanel";
import WordHint from "../components/WordHint";

function Room() {
  const [players, setPlayers] =
    useState([]);

  useEffect(() => {
    socket.on(
      "player_joined",
      (data) => {
        setPlayers(data.players);
      }
    );

    return () => {
      socket.off("player_joined");
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <GameOver />

      <h1 className="text-4xl font-bold mb-6">
        SketchSync
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <DrawerInfo />
          <Timer />
          <WordHint />

          <h2 className="text-xl font-semibold mt-4 mb-2">
            Players
          </h2>

          {players.map((player) => (
            <p key={player.id}>
              {player.name}
            </p>
          ))}

          <Scoreboard />
        </div>

        <div className="col-span-2 bg-white p-4 rounded shadow">
          <Canvas />
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded shadow">
        <ChatPanel />
      </div>
    </div>
  );
}

export default Room;