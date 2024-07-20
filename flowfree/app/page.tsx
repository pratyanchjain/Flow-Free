"use client"
import Board from "@/app/board"
import {useState} from "react"
import Multiplayer from "./multiplayer";
export default function App() {
  const [practice, setPractice] = useState(false);
  const [multiplayer, setMultiplayer] = useState(false);

  return (
    <>
    {practice && 
    <Board />
    }
    {multiplayer &&
    <Multiplayer />
    }
    <div className="h-full text-center align-items-center gap-4">
      <div onClick={() => setPractice(true)}>Practice</div>
      <div onClick={() => setMultiplayer(true)}>Multiplayer</div>
    </div>
    </>
  )
}