import { useState } from "react";
import { socket } from "../socket/socket";

function Chat({ roomId, playerName }) {
  const [guess, setGuess] = useState("");

  const sendGuess = () => {
    socket.emit("guess_word", {
      roomId,
      guess,
      playerName,
    });

    setGuess("");
  };

  return (
    <div>
      <input
        value={guess}
        onChange={(e) =>
          setGuess(e.target.value)
        }
        placeholder="Enter Guess"
      />

      <button onClick={sendGuess}>
        Send
      </button>
    </div>
  );
}

export default Chat;