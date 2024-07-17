"use client"
import { useState, useEffect} from "react";
import axios from 'axios';
import { init } from "next/dist/compiled/webpack/webpack";

type BoardType = number[][];
type cellColorType = {
  [key: number]: string;
}
export default function Home() {
  const [board, setBoard] = useState<BoardType>([]);
  const [cellColor, setCellColor] = useState<cellColorType>({});
  const [chosenFlow, setChosenFlow] = useState(-1);
  const [draggingOver, setDraggingOver] = useState(false);
  const [currCell, setCurrCell] = useState<number>(-1);
  const [flow, setFlow] = useState<BoardType>([]);
  const [endPoint, setEndPoint] = useState<BoardType>([]);

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
      const initialFlow: BoardType = Array.from({ length: response.data.length + 1 }, () => []);
      setFlow(initialFlow);
      let updatedBoard: BoardType = response.data;
      setEndPoint(updatedBoard.map(row => [...row]))
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
  }, [])

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  function handleOnDrag(e: React.DragEvent, cell: number) {
    let val = boardValue(board, cell)
    console.log("val", val)
    console.log(board);
    if (val) {
      setCurrCell(cell);
      setChosenFlow(val)
      setDraggingOver(true);
      if (boardValue(endPoint, cell) === val) {
        flow[val] = [];
      }
      console.log(flow[val])
      if (flow[val].includes(cell)) {
        console.log("before", flow[val])
        flow[val].splice(flow[val].indexOf(cell) + 1, flow[val].length);
        console.log("after", flow[val])
      } else {
        console.log("pushing")
        flow[val].push(cell);
      }
      updateFlow()
      console.log("chosen flow is", val)
    }
  }

  function handleOnDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    if (currCell !== -1 && chosenFlow !== -1) {
      if (isNeighbour(idx, currCell, board.length)) {
        if (boardValue(board, idx) === 0) {
          setCurrCell(idx);
          updateCellColor(idx)
          flow[chosenFlow].push(idx)
        }
        else {
          if (boardValue(board, idx) === chosenFlow) {
            if (flow[chosenFlow].includes(idx)) {
              flow[chosenFlow].splice(flow[chosenFlow].indexOf(idx) + 1, flow[chosenFlow].length);
            } else {
              console.log("pushed", idx)
              flow[chosenFlow].push(idx);
              console.log(flow[chosenFlow])
            }
            if (boardValue(endPoint, idx) === chosenFlow) {
              let flowComplete = 0;
              for (let i = 0; i < flow[chosenFlow].length; i++) {
                const elem = flow[chosenFlow][i];
                if (boardValue(endPoint, elem)) {
                  flowComplete += 1;
                }
              }
              console.log("nums", flow[chosenFlow], flowComplete)
              if (flowComplete === 2) {
                alert("flow complete!");
                return
              }
            }
            setCurrCell(idx);
            updateFlow();
          }
        }
      }
    }
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

  const updateFlow = () => {
    const updatedBoard = [...board];
    const valuesInFlow = new Set(flow[chosenFlow]);

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cellValue = board[row][col];
        const cellIndex = row * board.length + col;

        if (cellValue === chosenFlow && !valuesInFlow.has(cellIndex) && (endPoint[row][col] === 0)) {
          updatedBoard[row][col] = 0;
        }
        // if (valuesInFlow.has(cellIndex) && cellValue === 0) {}
      }
    }
  }

  function boardValue(arr: BoardType, cell: number) {
    return arr[Math.floor(cell / board.length)][cell % board.length];
  }

  const isNeighbour = (index1: number, index2: number, boardSize: number) => {
    const row1 = Math.floor(index1 / boardSize);
    const col1 = index1 % boardSize;
    const row2 = Math.floor(index2 / boardSize);
    const col2 = index2 % boardSize;
    return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
  };

  return (
    <>
    <div className="board grid grid-cols-9">
      {board.flat().map((cell, idx) => (
        <div
          key={idx}
          onDragStart={(e) => handleOnDrag(e, idx)}
          onDragOver={(e) => handleOnDragOver(e, idx)}
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
