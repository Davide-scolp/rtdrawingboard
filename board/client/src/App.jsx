import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Connetti al backend Render
const socket = io("https://rtdrawingboard.onrender.com");

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 2;      // spessore della penna
    ctx.lineCap = "round";  // estremità arrotondate
    ctx.strokeStyle = "red"; // colore rosso della penna

    // Gestione disegno ricevuto dagli altri utenti
    socket.on("draw", (data) => {
      const { x, y } = data;
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  }, []);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();       // inizia nuovo path
    ctx.moveTo(x, y);      // punto iniziale
    ctx.strokeStyle = "red"; // assicura colore rosso
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();

    // Invia coordinate agli altri utenti
    socket.emit("draw", { x, y });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="bg-white border"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
}