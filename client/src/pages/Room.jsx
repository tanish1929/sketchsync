import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket/socket";

import Canvas from "../components/Canvas";
import Chat from "../components/Chat";
import Scoreboard from "../components/Scoreboard";
import Timer from "../components/Timer";
import DrawerInfo from "../components/DrawerInfo";
import GameOver from "../components/GameOver";
import ChatPanel from "../components/ChatPanel";
import WordHint from "../components/WordHint";
import WordSelector from "../components/WordSelector";

function Room() {
  const { id: roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [drawerId, setDrawerId] = useState(null);

  const isDrawer = drawerId === socket.id;

  useEffect(() => {
    // Get player name from localStorage
    const name =
      localStorage.getItem("playerName") ||
      "Player";
    setPlayerName(name);

    // Join the room
    socket.emit("join_room", {
      roomId,
      name: name,
    });

    // Listen for room created event
    socket.on("room_created", (data) => {
      setPlayers(data.room.players);
    });

    // Listen for player joined event
    socket.on("player_joined", (data) => {
      setPlayers(data.players);
    });

    // Track drawer
    socket.on("game_started", (data) => {
      setDrawerId(data.drawerId);
    });

    return () => {
      socket.off("room_created");
      socket.off("player_joined");
      socket.off("game_started");
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <GameOver />
      <WordSelector 
        roomId={roomId} 
        playerName={playerName} 
        isDrawer={isDrawer} 
      />

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

          {players && players.length > 0 ? (
            <ul>
              {players.map((player) => (
                <li key={player.id}>
                  {player.name}
                  {player.isDrawer &&
                    " (Drawing)"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              Waiting for players...
            </p>
          )}

          {players.length > 1 && (
            <button
              onClick={() =>
                socket.emit(
                  "start_game",
                  { roomId }
                )
              }
              className="mt-4 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
            >
              Start Game
            </button>
          )}

          <Scoreboard />
        </div>

        <div className="col-span-2 bg-white p-4 rounded shadow">
          <Canvas roomId={roomId} />
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Chat & Guessing</h2>
        <Chat roomId={roomId} playerName={playerName} />
        <hr className="my-4" />
        <ChatPanel />
      </div>
    </div>
  );
}

export default Room;