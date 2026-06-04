import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

import Canvas from "../components/Canvas";
import Scoreboard from "../components/Scoreboard";
import Timer from "../components/Timer";
import DrawerInfo from "../components/DrawerInfo";
import GameOver from "../components/GameOver";

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
    <div>
        <GameOver />
      <h1>SketchSync</h1>

      <DrawerInfo />

      <Timer />

      <h2>Players</h2>

      {players.map((player) => (
        <p key={player.id}>
          {player.name}
        </p>
      ))}

      <Scoreboard />

      <hr />

      <h2>Drawing Board</h2>

      <Canvas />
    </div>
  );
}

export default Room;