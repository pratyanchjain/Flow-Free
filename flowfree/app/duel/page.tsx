// pages/duel/lobby.js
"use client"
import React, { useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import useStore from '../Zustand/useStore';
import { socket } from "../../socket";

const Lobby = () => {
  const router = useRouter(); 
  const updateBoard1 = useStore((state) => state.updateBoard1)
  const updateBoard2 = useStore((state) => state.updateBoard2)
  const updateColor = useStore((state) => state.updateColor)
  // const boardSize = localStorage.getItem('boardSize');
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    // console.log("boardSize is", boardSize);
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = (Math.random() * 1000).toString();
      localStorage.setItem('userId', userId);
    }

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      socket.emit("joinQueue", userId, localStorage.getItem('boardSize'));
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function joinGame(response: GameData) {
      console.log("client", response);
      updateBoard1(response.Board)
      updateBoard2(response.Board)
      updateColor(response.Color)
      console.log("updating")
      router.push(`/duel/${response.Game}`)
  }

    socket.on("connect", onConnect);
    socket.on("matched", joinGame);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  return (
    <>
    <div>
      <h1>Waiting for a match...</h1>
      <div>
      <p>Status: { isConnected ? "connected" : "disconnected" }</p>
      <p>Transport: { transport }</p>
    </div>
      {/* Optional loading spinner or other UI elements */}
    </div>
    </>
  );
};

export default Lobby;