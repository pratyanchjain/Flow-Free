"use client"
import { useState, useEffect} from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import getBoard from "../../pages/api/getBoard";

type BoardType = number[][];
type cellColorType = {
  [key: number]: string;
}
export default function Board() {
  const [board, setBoard] = useState<BoardType>([]);
  const [cellColor, setCellColor] = useState<cellColorType>({});
  const [chosenFlow, setChosenFlow] = useState(-1);
  const [draggingOver, setDraggingOver] = useState(false);
  const [currCell, setCurrCell] = useState<number>(-1);
  const [flow, setFlow] = useState<BoardType>([]);
  const [endPoint, setEndPoint] = useState<BoardType>([]);
  const [boardSize, setBoardSize] = useState<number>(9);
  const [boardInput, setBoardInput] = useState<number>(9);
  const [showAnimation, setShowAnimation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    genBoard();
    setBoardSize(boardInput)
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
      setBoardSize(response.data.length);
      setShowAnimation(false);
    })
  }

  useEffect(() => {
    console.log("board Size: ", boardSize)
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
    axios.get("http://localhost:3003/solution").then((response) => {
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


  useEffect(() => {
    if (isSolved()) {
      setShowAnimation(true);
      setTimeout(() => {
        genBoard();
      }, 5000)
    }
  }, [updateFlow])

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
    const {connector, val} = isConnector(idx);
    if (connector) {
      let connectClass = "connector "
      let dir = getDirection(idx, val, board.length);
      connectClass += dir;
      return connectClass;
    }
  }

  const isConnector = (idx : number) => {
    const value = boardValue(board, idx);
    const flowArray = flow[value];
    const flowIndex = flowArray.indexOf(idx);
    const connector = flowIndex !== -1 && flowIndex !== flowArray.length - 1 && flowArray.length > 1;
    let val = flowArray[flowIndex + 1];
    return {connector,  val};
  }

  const getBackgroundClass = (idx: number) => {
    const {connector, val} = isConnector(idx);
    const value = boardValue(board, idx);
    if (!connector || boardValue(endPoint, idx)) {
      return { background: cellColor[value] }
    }
    return {}
  }

  const getConnectorStyle = (cell: number, idx: number) => {
    const {connector, val} = isConnector(idx);
    if (connector) {
      let dir = getDirection(idx, val, board.length);
      switch (dir) {
        case 'top':
          dir = 'bottom';
          break
        case 'bottom':
          dir = 'top';
          break
        case 'left':
          dir = 'right';
          break
        case 'right':
          dir = 'left';
          break
      }
      let size = getCellSize()
      let obj = { backgroundColor: cellColor[cell],
        width: `${size/4}px`, height: `${size + 0.25}px`,
        [`margin-${dir}`] : `${size * 0.75}px`,
      }
      return obj;
    }
    return {}
  }
  const getCellSize = () => {
    let containerSize = Math.min(window.innerHeight, window.innerWidth) * 0.75;
    return containerSize / boardSize;
  }

  const isSolved = () => {
    if (board.length === 0) {
      return false;
    }
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] == 0) {
          return false;
        }
      }
    }
    flow.forEach((color) => {
      let cnt = 0;
      color.forEach((index) => {
        if (boardValue(endPoint, index)) {
          cnt += 1
        }
      })
      if (cnt < 2) {
        return false;
      }
    })
    return true;
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
    <div className="text-center p-5 m-5">
    <div className="board grid" style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, gridTemplateRows: `repeat(${boardSize}, 1fr)` }} >
      {board.flat().map((cell, idx) => (
        <>
        <div
          key={idx}
          onDragStart={(e) => handleOnDrag(e, idx)}
          onDragOver={(e) => handleOnDragOver(e, idx)}
          onDrop={handleDrop}
          style = {{width: `${getCellSize()}px`, height: `${getCellSize()}px`}}
          className="boardCell flex justify-center items-center"
        >
        {isConnector(idx) && 
       <div draggable className={`${getConnector(idx)}`}
        style={getConnectorStyle(cell, idx)}
        ></div>
      }

        <button           
          draggable
          style= { {
            ...getBackgroundClass(idx),
           width: `${getCellSize() / 1.5}px`, height: `${getCellSize() / 1.5}px`
          }}
          className={`flex justify-center item-center 
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
    <div className="flex flex-row gap-4 cursor-pointer my-2" style={{marginTop: "25px"}}>
      <div className="w-full"><button className=" h-full w-full bg-white rounded text-black px-4" onClick={getSolve}><p>View Solution</p></button></div>
      <div className="w-full flex flex-col gap-2 bg-black">
        <label>
          <input placeholder="Enter board size: " className="w-full rounded p-2 text-black" type="number" defaultValue={boardSize} onChange={(num) => setBoardInput(Number(num.target.value))}/>
        </label>
        <div className="fit-content bg-white rounded p-2 text-black"  onClick={genBoard}>Generate Board </div>
        </div>
    </div>
    </div>
    </>
  );
}
