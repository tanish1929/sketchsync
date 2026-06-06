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
  const [wordOptions, setWordOptions] = useState([]);

  const isDrawer = drawerId === socket.id;

  useEffect(() => {
    // Get player name from localStorage
    const name = localStorage.getItem("playerName") || "Player";
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

    // Listen for word options to display in the modal
    socket.on("round_start", (data) => {
      if (data.drawerId === socket.id) {
        setWordOptions(data.wordOptions);
      } else {
        setWordOptions([]);
      }
    });

    // Clear word options once a word has been chosen
    socket.on("word_hint", () => {
      setWordOptions([]);
    });

    return () => {
      socket.off("room_created");
      socket.off("player_joined");
      socket.off("game_started");
      socket.off("round_start");
      socket.off("word_hint");
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <GameOver />
      <WordSelector 
        roomId={roomId} 
        playerName={playerName} 
        isDrawer={isDrawer}
        wordOptions={wordOptions}
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
                <li key={player.id} className="py-1">
                  {player.name} {player.id === socket.id && <span className="text-gray-400 text-sm">(You)</span>}
                  {player.id === drawerId && " (Drawing)"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              Waiting for players...
            </p>
          )}

          {/* Render button for any player when 2+ players are in room */}
          {players.length >= 2 && !drawerId ? (
            <div className="mt-4">
              <button
                onClick={() => socket.emit("start_game", { roomId })}
                className="w-full bg-green-500 text-white p-3 rounded-lg font-bold hover:bg-green-600 transition"
              >
                Start Game 🚀
              </button>
            </div>
          ) : players.length === 1 ? (
            <div className="mt-4">
              <p className="text-sm text-amber-600 text-center">Waiting for another player to join...</p>
            </div>
          ) : null}

          <Scoreboard />
        </div>

        <div className="col-span-2 bg-white p-4 rounded shadow">
          {/* CRITICAL FIX: Passing down isDrawer state utility mapping to canvas visibility context */}
          <Canvas roomId={roomId} isDrawer={isDrawer} />
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