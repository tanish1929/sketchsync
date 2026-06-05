import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function WordHint() {
  const [hint, setHint] =
    useState("");

  useEffect(() => {
    socket.on(
      "word_hint",
      (data) => {
        setHint(data.hint);
      }
    );

    return () => {
      socket.off("word_hint");
    };
  }, []);

  return (
    <div>
      <h2>Word Hint</h2>
      <h3>{hint}</h3>
    </div>
  );
}

export default WordHint;