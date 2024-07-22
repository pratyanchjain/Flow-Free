"use client"
import { useState, useEffect} from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import getBoard from "../../pages/api/getBoard";
import Board from "@/app/components/board";
import { generateColors } from "../utils/colorGenerator";

type BoardType = number[][];
type cellColorType = {
  [key: number]: string;
}
export default function Practice() {
  const [cellColor, setCellColor] = useState<cellColorType>({});
  const [board, setBoard] = useState<BoardType>([]);
  const [boardInput, setBoardInput] = useState<number>(9);

  const router = useRouter();

  useEffect(() => {
    genBoard();
  }, [])

  const genBoard = () => {
    if (boardInput <= 1) {
      return;
    }
    axios.post("http://localhost:3003/puzzle/", {size: boardInput}).then((response) => {
      console.log(response);
      if (response.data === "Invalid Input") {
        console.log("error!");
        return;
      }
      setBoard(response.data);
      console.log("setting board to", response.data)
      setCellColor(generateColors(response.data.length));
    })
  }

  return (
    <>
    <button className="bg-white text-black px-4 m-2" onClick={() => router.push("/")}>Back</button>
    {/* {showAnimation &&
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.2}
      />
    } */}
    <Board  InputBoard={board} cellColor={cellColor}/>
    <div className="flex flex-row gap-4 cursor-pointer my-2" style={{marginTop: "25px"}}>
      {/* <div className="w-full"><button className=" h-full w-full bg-white rounded text-black px-4" onClick={}><p>View Solution</p></button></div> */}
      <div className="w-full flex flex-col gap-2 bg-black">
        <label>
          <input placeholder="Enter board size: " className="w-full rounded p-2 text-black" type="number" defaultValue={boardInput} onChange={(num) => setBoardInput(Number(num.target.value))}/>
        </label>
        <div className="fit-content bg-white rounded p-2 text-black"  onClick={genBoard}>Generate Board </div>
        </div>
    </div>
    </>
  );
}
