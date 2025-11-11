import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FaPen, FaEraser } from "react-icons/fa";

// Connetti al backend
const socket = io("https://rtdrawingboard.onrender.com");

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // 'pen' o 'eraser'
  const [color, setColor] = useState("#000000");
  const [penWidth, setPenWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(20);
  const lastPointRef = useRef(null);

  // --- Ottieni coordinate ---
  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // --- Disegna linea ---
  const drawLine = ({ x, y, prevX, prevY, color: strokeColor, width, emit = false }) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    if (prevX != null && prevY != null) {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    if (emit) socket.emit("draw", { x, y, prevX, prevY, color: strokeColor, width });
  };

  // --- Eventi mouse/touch ---
  const handleStart = (e) => {
    const { x, y } = getCoordinates(e);
    lastPointRef.current = { x, y };
    setIsDrawing(true);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const strokeColor = tool === "pen" ? color : "white";
    const strokeWidth = tool === "pen" ? penWidth : eraserWidth;

    drawLine({
      x,
      y,
      prevX: lastPointRef.current?.x,
      prevY: lastPointRef.current?.y,
      color: strokeColor,
      width: strokeWidth,
      emit: true,
    });

    lastPointRef.current = { x, y };
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // --- Ricezione disegni ---
  useEffect(() => {
    socket.on("draw", drawLine);
    socket.on("clear", () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });
    return () => {
      socket.off("draw", drawLine);
      socket.off("clear");
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 select-none">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-md">
        {/* Pen button */}
        <button
          className={`p-3 rounded-full shadow ${tool === "pen" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          onClick={() => setTool("pen")}
        >
          <FaPen size={20} />
        </button>

        {/* Eraser button */}
        <button
          className={`p-3 rounded-full shadow ${tool === "eraser" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          onClick={() => setTool("eraser")}
        >
          <FaEraser size={20} />
        </button>

        {/* Color picker */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 border-2 border-gray-300 rounded-md cursor-pointer"
        />

        {/* Pen width */}
        {tool === "pen" && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Pen size</label>
            <input
              type="range"
              min="1"
              max="20"
              value={penWidth}
              onChange={(e) => setPenWidth(Number(e.target.value))}
            />
            <span className="text-sm">{penWidth}px</span>
          </div>
        )}

        {/* Eraser width */}
        {tool === "eraser" && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Eraser size</label>
            <input
              type="range"
              min="5"
              max="50"
              value={eraserWidth}
              onChange={(e) => setEraserWidth(Number(e.target.value))}
            />
            <span className="text-sm">{eraserWidth}px</span>
          </div>
        )}

        {/* Clear button */}
        <button
          className="p-3 rounded-md bg-red-500 text-white shadow hover:bg-red-600"
          onClick={() => {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            socket.emit("clear");
          }}
        >
          🧹 Clear
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="bg-white border touch-none rounded-lg shadow-lg"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseMove={handleMove}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchMove={handleMove}
      />
    </div>
  );
}
