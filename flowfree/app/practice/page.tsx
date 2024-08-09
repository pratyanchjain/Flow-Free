"use client"
import { useState, useEffect} from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import Board from "@/app/components/board";
import { generateColors } from "../utils/colorGenerator";
import {Button, Input} from "@nextui-org/react"
export default function Practice() {
  const [cellColor, setCellColor] = useState<cellColorType>({});
  const [board, setBoard] = useState<BoardType>([]);
  const [boardInput, setBoardInput] = useState<number>(9);
  const [mode, setMode] = useState('')
  const router = useRouter();

  useEffect(() => {
    genBoard();
  }, [])

  const genBoard = () => {
    if (boardInput <= 1) {
      return;
    }
    axios.post("https://flow-free.onrender.com/puzzle/", {size: boardInput}).then((response) => {
      if (response.data === "Invalid Input") {
        console.log("error!");
        return;
      }
      setBoard(response.data);
      setCellColor(generateColors(response.data.length));
      setMode('')
    })
  }

  const getSolve = () => {
    axios.get("https://flow-free.onrender.com/solution").then((response) => {
      setBoard(response.data);
      setMode("solution")
    })
  }

  return (
    <>
    {/* <button className="bg-white text-black px-4 m-2" onClick={() => router.push("/")}>Back</button> */}
    {/* {showAnimation &&
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.2}
      />
    } */}
    <Board  InputBoard={board} cellColor={cellColor} mode={mode} drag={true}/>
    <div className="flex flex-row gap-4 my-2 w-full" style={{marginTop: "25px"}}>
      <div className="w-full "><Button className="flex w-full h-full" color="warning" onClick={getSolve}><p>View Solution</p></Button></div>
      <div className="w-full flex flex-col gap-2 bg-black">
        <label>
          <Input variant="bordered" size="lg" label="Enter board size: " type="number" defaultValue={boardInput.toString()} onChange={(num) => setBoardInput(Number(num.target.value))}/>
        </label>
        <Button  color="primary" onClick={genBoard}>Generate Board </Button>
        </div>
    </div>
    </>
  );
}
