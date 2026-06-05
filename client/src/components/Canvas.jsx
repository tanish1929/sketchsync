import { useRef, useEffect, useState } from "react";
import { socket } from "../socket/socket";

function Canvas({ roomId, isDrawer }) {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Save initial blank state
    historyRef.current.push(canvas.toDataURL());

    // --- SOCKET INBOUND LISTENERS ---
    
    // Explicitly destructure isEraserPacket from incoming draw events
    socket.on("draw", ({ x, y, color, brushSize, isEraserPacket }) => {
      ctx.save(); // Save the current context configuration
      
      // Configure drawing variables dynamically based on sender parameters
      ctx.beginPath();
      ctx.globalCompositeOperation = isEraserPacket ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      
      ctx.lineTo(x, y);
      ctx.stroke();
      
      ctx.restore(); // Revert back to local tool settings seamlessly
    });

    socket.on("clear_canvas", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      historyRef.current = [canvas.toDataURL()];
    });

    socket.on("draw_undo", () => {
      undo();
    });

    return () => {
      socket.off("draw");
      socket.off("clear_canvas");
      socket.off("draw_undo");
    };
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    historyRef.current.push(canvas.toDataURL());
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (historyRef.current.length > 1) {
      historyRef.current.pop();
      const imageData = new Image();
      imageData.src = historyRef.current[historyRef.current.length - 1];
      imageData.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageData, 0, 0);
      };
    }
  };

  // --- MOUSE ACTION HANDLERS ---

  const startDrawing = (e) => {
    if (!isDrawer) return; // Block input if user isn't the active drawer

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize;

    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
    saveHistory();
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineTo(x, y);
    ctx.stroke();

    // Broadcast isEraserPacket state parameter to let clients set composite operations correctly
    socket.emit("draw", {
      roomId,
      x,
      y,
      color: isEraser ? "#FFFFFF" : color,
      brushSize,
      isEraserPacket: isEraser,
    });
  };

  const stopDrawing = () => {
    if (!isDrawer) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [canvas.toDataURL()];

    socket.emit("clear_canvas", { roomId });
  };

  const handleUndo = () => {
    if (!isDrawer) return;
    undo();
    socket.emit("draw_undo", { roomId });
  };

  const toggleEraser = () => {
    setIsEraser(!isEraser);
  };

  return (
    <div className="space-y-4">
      {/* Conditionally hide or disable toolbox options if user is a guesser */}
      <div className={`flex gap-2 flex-wrap bg-gray-100 p-3 rounded transition-opacity ${!isDrawer ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 cursor-pointer"
            disabled={isEraser}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm">{brushSize}px</span>
        </div>

        <button
          onClick={toggleEraser}
          className={`px-3 py-1 rounded font-semibold transition ${
            isEraser ? "bg-yellow-500 text-white" : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          {isEraser ? "🗑️ Eraser ON" : "🗑️ Eraser"}
        </button>

        <button
          onClick={handleUndo}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
        >
          ↶ Undo
        </button>

        <button
          onClick={clearCanvas}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
        >
          🧹 Clear
        </button>
      </div>

      <div className="relative overflow-hidden inline-block rounded" style={{ border: "2px solid #333" }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          style={{
            backgroundColor: "#FFFFFF",
            cursor: isDrawer ? "crosshair" : "not-allowed",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        {!isDrawer && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded text-xs font-bold tracking-wide pointer-events-none uppercase">
            Viewing Mode
          </div>
        )}
      </div>
    </div>
  );
}

export default Canvas;