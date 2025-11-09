import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Connetti al backend Render
const socket = io("https://rtdrawingboard.onrender.com");

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef(null); // punto precedente per disegnare correttamente

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "red";

    // Ricezione dati da altri utenti
    socket.on("draw", (data) => {
      const { x, y, prevX, prevY } = data;
      if (prevX != null && prevY != null) {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });
  }, []);

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) { // touch device
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    } else { // mouse
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  const handleStart = (e) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "red";

    lastPointRef.current = { x, y };
    setIsDrawing(true);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      // invia coordinate al backend con punto precedente
      socket.emit("draw", {
        x,
        y,
        prevX: lastPointRef.current.x,
        prevY: lastPointRef.current.y,
      });
    }

    lastPointRef.current = { x, y };
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="bg-white border"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseMove={handleMove}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchMove={handleMove}
      />
    </div>
  );
}