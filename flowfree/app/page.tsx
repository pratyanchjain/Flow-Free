"use client"
import { useState, useEffect} from "react";
import axios from 'axios';

type BoardType = number[][];
type cellColorType = {
  [key: number]: string;
}
export default function Home() {
  const [board, setBoard] = useState<BoardType>([]);
  const [cellColor, setCellColor] = useState<cellColorType>({});
  const [chosenFlow, setChosenFlow] = useState(0);
  const [draggingOver, setDraggingOver] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3001/puzzle").then((response) => {
      console.log(response.data);
      setBoard(response.data);
      let cellColors = {} as cellColorType
      for (let i = 0; i <= response.data.length; i++) {
        cellColors[i] = getRandomColor();
      }
      cellColors[0] = "#000000";
      setCellColor(cellColors);
    })
  }, [])

  useEffect(() => {
    if (draggingOver) {
      const interval = setInterval(() => {
        handleDrop()
      }, 200);

      return () => {
        setDraggingOver(true);
        console.log(`clearing interval`);
        clearInterval(interval);
      };
    }
  }, [draggingOver])

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  function handleOnDrag(e: React.DragEvent, cell: number) {
    setChosenFlow(cell)
    setDraggingOver(true);
    console.log("chosen flow is", cell)
  }

  function handleDrop() {
    setDraggingOver(false);
  }

  const updateCellColor = (cell: number) => {
    if (chosenFlow) {
      console.log(chosenFlow, cell)
      let updatedBoard = [...board]
      updatedBoard[Math.floor(cell / board.length)][cell % board.length] = chosenFlow;
    }
  }

  return (
    <>
    <div className="board grid grid-cols-9">
      {board.flat().map((cell, idx) => (
        <div
          key={idx}
          onDragStart={(e) => handleOnDrag(e, cell)}
          onDragOver={(e) => {e.preventDefault(), updateCellColor(idx)
           }}
          onDrop={handleDrop}
          className="widget boardCell h-20 w-20 flex justify-center items-center"
        >
          <button           
          draggable
          style={{ backgroundColor: cellColor[cell] }}
          className="circle flex m-3 justify-center items-center">
            {cell ? cell : ""}
          </button>
        </div>
      ))}
    </div>
    </>
  );
}
