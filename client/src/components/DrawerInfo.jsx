import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function DrawerInfo() {
  const [drawer, setDrawer] =
    useState("");

  useEffect(() => {
    socket.on(
      "game_started",
      (data) => {
        setDrawer(data.drawer);
      }
    );

    socket.on(
      "next_round",
      (data) => {
        setDrawer(data.drawer);
      }
    );

    return () => {
      socket.off("game_started");
      socket.off("next_round");
    };
  }, []);

  return (
    <h2>
      Current Drawer: {drawer}
    </h2>
  );
}

export default DrawerInfo;