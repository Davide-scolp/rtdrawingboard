import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FaPen, FaEraser } from "react-icons/fa";

// Connetti al backend
const socket = io("https://rtdrawingboard.onrender.com");

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // 'pen' o 'eraser'
  const lastPointRef = useRef(null);

  // Funzione per ottenere coordinate
  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Disegna una linea sul canvas e invia l'evento al server
  const drawLine = ({ x, y, prevX, prevY, color, emit = false }) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === "pen" ? 2 : 20;
    ctx.lineCap = "round";

    if (prevX != null && prevY != null) {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    if (emit) {
      socket.emit("draw", { x, y, prevX, prevY, color });
    }
  };

  // Gestione degli eventi del canvas
  const handleStart = (e) => {
    const { x, y } = getCoordinates(e);
    lastPointRef.current = { x, y };
    setIsDrawing(true);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const color = tool === "pen" ? "black" : "white";

    drawLine({ 
      x, 
      y, 
      prevX: lastPointRef.current?.x, 
      prevY: lastPointRef.current?.y, 
      color, 
      emit: true 
    });

    lastPointRef.current = { x, y };
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Ricezione dei disegni dagli altri utenti
  useEffect(() => {
  socket.on("draw", drawLine);

  const canvas = canvasRef.current;
  const preventScroll = (e) => e.preventDefault();

  // Previene lo scroll quando tocchi il canvas (fondamentale per iPad / iPhone)
  canvas.addEventListener("touchmove", preventScroll, { passive: false });

  return () => {
    socket.off("draw", drawLine);
    canvas.removeEventListener("touchmove", preventScroll);
  };
}, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`p-3 rounded-full shadow ${tool === "pen" ? "bg-blue-500 text-white" : "bg-white"}`}
          onClick={() => setTool("pen")}
        >
          <FaPen size={20} />
        </button>
        <button
          className={`p-3 rounded-full shadow ${tool === "eraser" ? "bg-blue-500 text-white" : "bg-white"}`}
          onClick={() => setTool("eraser")}
        >
          <FaEraser size={20} />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="bg-white border touch-none"
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