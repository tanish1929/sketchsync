import { useRef, useEffect, useState } from "react";
import { socket } from "../socket/socket";

function Canvas() {
  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineCap = "round";

    socket.on("draw", ({ x, y, color, brushSize }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;

      ctx.lineTo(x, y);
      ctx.stroke();
    });

    socket.on("clear_canvas", () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    });

    return () => {
      socket.off("draw");
      socket.off("clear_canvas");
    };
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    ctx.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit("draw", {
      x,
      y,
      color,
      brushSize,
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    socket.emit("clear_canvas");
  };

  return (
    <div>
      <div>
        <input
          type="color"
          value={color}
          onChange={(e) =>
            setColor(e.target.value)
          }
        />

        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) =>
            setBrushSize(
              Number(e.target.value)
            )
          }
        />

        <button onClick={clearCanvas}>
          Clear Canvas
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{
          border: "1px solid black",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}

export default Canvas;