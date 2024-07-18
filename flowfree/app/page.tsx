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


  const getSolve = () => {
    axios.get("http://localhost:3001/solution").then((response) => {
      setBoard(response.data);
      let solvedFlow: BoardType = Array.from({ length: response.data.length + 1 }, () => []);
      let solvedBoard: BoardType = response.data;
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
          let color = solvedBoard[i][j];
          if (endPoint[i][j]) {
            if (solvedFlow[color].length === 0) {
              let stack: number[]  = [i * board.length + j]
              let cnt = 0;
              while (stack.length > 0) {
                var last = stack.pop()
                console.log("last is", last, stack)
                if (last === undefined) {
                  break;
                }
                solvedFlow[color].push(last)
                let vb = getValidNeighbors(Math.floor(last / board.length), last % board.length, board.length, board.length);
                for (let nb = 0; nb < vb.length; nb++) {
                  let a = vb[nb][0]
                  let b = vb[nb][1]
                  let idx = a * board.length + b
                  console.log("iterating over", idx, color)
                  if (solvedBoard[a][b] === color && (!solvedFlow[color].includes(idx))) {
                    console.log("pushing", idx);
                    stack.push(idx)
                  }
                }

                console.log(stack);
                console.log(solvedFlow[color])
                cnt++;
                // if (cnt === 5) break;
                
              }
            }
          }
        }
      }
      setFlow(solvedFlow);
      console.log(solvedFlow);
    })
  }

  type Coordinate = [number, number];

const getValidNeighbors = (x: number, y: number, numRows: number, numCols: number): Coordinate[] => {
  console.log("receiving", x, y)
  const neighbors: Coordinate[] = [];

  // Directions for top, right, bottom, left
  const directions: Coordinate[] = [
    [-1, 0],  // top
    [1, 0],   // bottom
    [0, -1],  // left
    [0, 1]    // right
  ];

  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;

    // Check if the new coordinates are within the grid bounds
    if (newX >= 0 && newX < numRows && newY >= 0 && newY < numCols) {
      neighbors.push([newX, newY]);
    }
  }

  return neighbors;
};

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
                console.log("flow complete!");
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

  const getDirection = (index1: number, index2: number, boardSize: number) => {
    const row1 = Math.floor(index1 / boardSize);
    const col1 = index1 % boardSize;
    const row2 = Math.floor(index2 / boardSize);
    const col2 = index2 % boardSize;
    if (row1 < row2) return 'bottom';
    if (row1 > row2) return 'top';
    if (col1 < col2) return 'right';
    if (col1 > col2) return 'left';
    return '';
  };

  const getConnector = (idx: number) => {
    const value = boardValue(board, idx);
    const flowArray = flow[value];
    const flowIndex = flowArray.indexOf(idx);
    const isConnector = flowIndex !== -1 && flowIndex !== flowArray.length - 1 && flowArray.length > 1;
    if (isConnector) {
      let connectClass = "connector "
      let dir = getDirection(idx, flowArray[flowIndex + 1], board.length);
      connectClass += dir;
      console.log("dir is ", dir)
      return connectClass;
    }
  }

  const getBackgroundClass = (idx: number) => {
    const value = boardValue(board, idx);
    const flowArray = flow[value];
    const flowIndex = flowArray.indexOf(idx);
    const isConnector = flowIndex !== -1 && flowIndex !== flowArray.length - 1 && flowArray.length > 1;
    if (!isConnector || boardValue(endPoint, idx)) {
      return { background: cellColor[value] }
    }
    return {}
  }

  return (
    <>
    <div className="board grid grid-cols-9">
      {board.flat().map((cell, idx) => (
        <>
        <div
          key={idx}
          onDragStart={(e) => handleOnDrag(e, idx)}
          onDragOver={(e) => handleOnDragOver(e, idx)}
          onDrop={handleDrop}
          className="widget boardCell h-20 w-20 flex justify-center items-center"
        >
       <div className={`${getConnector(idx)}`}
        style={{ backgroundColor: cellColor[cell] }}
        ></div>

            <button           
          draggable
          style={getBackgroundClass(idx)}
          className={`flex m-3 justify-center item-center 
          ${boardValue(endPoint, idx) ? "circle" : ""}
          ${boardValue(endPoint, idx) === 0 && flow[boardValue(board, idx)].indexOf(idx) === flow[boardValue(board, idx)].length - 1
            ? "smaller-circle" : ""
          }`}>
          {cell ? cell : ""}
          </button>
        </div>
        </>
      ))}
    </div>
    <button onClick={getSolve}>View Solution</button>
    </>
  );
}
