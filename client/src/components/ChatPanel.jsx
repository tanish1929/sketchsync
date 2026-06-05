import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function ChatPanel() {
  const [messages, setMessages] =
    useState([]);

  useEffect(() => {
    socket.on(
      "chat_message",
      (data) => {
        setMessages((prev) => [
          ...prev,
          `${data.playerName}: ${data.message}`,
        ]);
      }
    );

    socket.on(
      "correct_guess",
      (data) => {
        setMessages((prev) => [
          ...prev,
          `🎉 ${data.playerName} guessed "${data.word}"`,
        ]);
      }
    );

    return () => {
      socket.off("chat_message");
      socket.off("correct_guess");
    };
  }, []);

  return (
    <div>
      <h2>Chat</h2>

      {messages.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
    </div>
  );
}

export default ChatPanel;