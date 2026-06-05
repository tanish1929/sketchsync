import { useState, useEffect } from "react";
import { socket } from "../socket/socket";

function WordSelector({ roomId, playerName, isDrawer }) {
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    socket.on("round_start", (data) => {
      if (data.wordOptions) {
        setWords(data.wordOptions);
        setSelectedWord(null);
      }
    });

    return () => {
      socket.off("round_start");
    };
  }, []);

  const handleWordSelect = (word) => {
    setSelectedWord(word);
    socket.emit("word_chosen", {
      roomId,
      word,
      playerName,
    });
  };

  if (!isDrawer || words.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Choose a Word to Draw
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {words.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handleWordSelect(word)}
              className={`p-3 rounded-lg font-semibold transition ${
                selectedWord === word
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WordSelector;
