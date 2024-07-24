"use client"
import { useState, useEffect} from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import getBoard from "../../pages/api/getBoard";
import { on } from "stream";

const Board: React.FC<BoardProps> = ( { InputBoard, cellColor, onBoardUpdate = () => {}, mode}) => {
  const [board, setBoard] = useState<BoardType>([]);
  const [chosenFlow, setChosenFlow] = useState(-1);
  const [draggingOver, setDraggingOver] = useState(false);
  const [currCell, setCurrCell] = useState<number>(-1);
  const [flow, setFlow] = useState<BoardType>([]);
  const [endPoint, setEndPoint] = useState<BoardType>([]);
  const [boardSize, setBoardSize] = useState<number>(9);
  const [showAnimation, setShowAnimation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (mode == '') {
      console.log("board setup  being called")
      boardSetup();
      console.log(InputBoard)
    }
  }, [InputBoard])

  // useEffect(() => {
  //   if (mode === 'solution') {
  //     flowSetup(InputBoard);
  //   }
  // }, [InputBoard])

  useEffect(() => {
    if (mode !== "") {
      console.log(endPoint);
      if (endPoint.length === 0) {
        console.log("board setup  being called")
        boardSetup()
      }
      if (endPoint.length !== 0) {
        console.log("flow setup  being called")
        flowSetup(InputBoard);
        console.log(InputBoard)
      }
    }
  }, [InputBoard])
 
  const boardSetup = () => {
    setBoard(InputBoard);
    console.log("input is ", InputBoard)
    const initialFlow: BoardType = Array.from({ length: InputBoard.length + 1 }, () => []);
    setFlow(initialFlow);
    let updatedBoard: BoardType = InputBoard;
    setEndPoint(updatedBoard.map(row => [...row]))
    console.log("st to", updatedBoard)
    setBoardSize(InputBoard.length);
  }

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

  const flowSetup = (solvedBoard: BoardType) => {
    setBoard(solvedBoard);
    console.log("before", flow)
    console.log("ep", endPoint)
    let solvedFlow: BoardType = Array.from({ length: solvedBoard.length + 1 }, () => []);
    for (let i = 0; i < solvedBoard.length; i++) {
      for (let j = 0; j < solvedBoard.length; j++) {
        let color = solvedBoard[i][j];
        if (endPoint[i][j] !== 0 && color !== 0) {
          if (solvedFlow[color].length <= 1) {
            solvedFlow[color] = []
            let stack: number[]  = [i * solvedBoard.length + j]
            while (stack.length > 0) {
              var last = stack.pop()
              if (last === undefined) {
                break;
              }
              solvedFlow[color].push(last)
              let vb = getValidNeighbors(Math.floor(last / solvedBoard.length), last % solvedBoard.length, solvedBoard.length, solvedBoard.length);
              for (let nb = 0; nb < vb.length; nb++) {
                let a = vb[nb][0]
                let b = vb[nb][1]
                let idx = a * solvedBoard.length + b
                if (solvedBoard[a][b] === color && (!solvedFlow[color].includes(idx))) {
                  stack.push(idx)
                }
              }
            }
          }
        }
      }
    }
    setFlow(solvedFlow);
    console.log("after", solvedFlow)
  }

type Coordinate = [number, number];

const getValidNeighbors = (x: number, y: number, numRows: number, numCols: number): Coordinate[] => {
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
    onBoardUpdate(updatedBoard);
  }


  // useEffect(() => {
  //   if (isSolved()) {
  //     setShowAnimation(true);
  //     setTimeout(() => {
  //       boardSetup();
  //     }, 5000)
  //   }
  // }, [updateFlow])

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
          dir = 'Bottom';
          break
        case 'bottom':
          dir = 'Top';
          break
        case 'left':
          dir = 'Right';
          break
        case 'right':
          dir = 'Left';
          break
      }
      let size = getCellSize()
      let obj = { backgroundColor: cellColor[cell],
        width: `${size/4}px`, height: `${size + 0.25}px`,
        [`margin${dir}`] : `${size * 0.75}px`,
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
       <div
       draggable className={`${getConnector(idx)}`}
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
          ${
            boardValue(endPoint, idx) ? "circle" : ""}
          ${boardValue(endPoint, idx) === 0 && flow[boardValue(board, idx)].indexOf(idx) === flow[boardValue(board, idx)].length - 1
            ? "smaller-circle" : ""
          }`}>
          {cell ? cell : ""}
          </button>
        </div>
        </>
      ))}
    </div>
    </div>
    </>
  );
}

export default Board;
