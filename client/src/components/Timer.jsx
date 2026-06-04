import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function Timer() {
  const [timeLeft, setTimeLeft] =
    useState(60);

  useEffect(() => {
    socket.on(
      "timer_update",
      (time) => {
        setTimeLeft(time);
      }
    );

    return () => {
      socket.off("timer_update");
    };
  }, []);

  return (
    <h2>
      Time Left: {timeLeft}s
    </h2>
  );
}

export default Timer;