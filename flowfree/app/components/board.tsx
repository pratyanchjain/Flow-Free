"use client"
import { useState, useEffect, useCallback} from "react";
import React from "react";

const Board: React.FC<BoardProps> = ( { InputBoard, cellColor, onBoardUpdate = () => {}, mode}) => {
  const [board, setBoard] = useState<BoardType>([]);
  const [chosenFlow, setChosenFlow] = useState(-1);
  const [draggingOver, setDraggingOver] = useState(false);
  const [currCell, setCurrCell] = useState<number>(-1);
  const [flow, setFlow] = useState<BoardType>([]);
  const [endPoint, setEndPoint] = useState<BoardType>([]);
  const [boardSize, setBoardSize] = useState<number>(9);

  useEffect(() => {
    console.log("rerendering")
    const updateBoard = setTimeout(() => {
      if (board.length !== 0) {
        let solved = isSolved()
        console.log(board, solved)
        if (solved === true) {
          onBoardUpdate("solved!");
        } else {
          onBoardUpdate(board);
        }
      }
    }, 100)

    return () => clearTimeout(updateBoard);
  }, [flow]);

  useEffect(() => {
    updateFlow()
  }, [flow])

  const boardSetup = () => {
    setBoard(InputBoard);
    const initialFlow: BoardType = Array.from({ length: InputBoard.length + 1 }, () => []);
    setFlow(initialFlow);
    setEndPoint(InputBoard)
    setBoardSize(InputBoard.length);
  }


  useEffect(() => {
    if (draggingOver) {
      const interval = setInterval(() => {
        handleDrop()
      }, 200);

      return () => {
        setDraggingOver(true);
        clearInterval(interval);
      };
    }
  }, [])

  const flowSetup = (solvedBoard: BoardType) => {
    setBoard(solvedBoard);    
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
  }

  useEffect(() => {
    if (mode === '') {
      boardSetup();
    }
    if (mode === 'solution') {
      flowSetup(InputBoard);
    }
    if (mode === "duel") {
      // console.log(board, endPoint)
      // boardSetup()
      if (endPoint.length === 0) {
        boardSetup()
      }
      if (endPoint.length !== 0) {
        flowSetup(InputBoard);
      }
    }
  }, [InputBoard])

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


  const handleOnDrag = (e: React.DragEvent, cell: number) => {
    let val = boardValue(board, cell)
    let updatedFlow = flow.map(row=> [...row])
    if (val) {
      setCurrCell(cell);
      setChosenFlow(val)
      setDraggingOver(true);
      // if (boardValue(endPoint, cell) === val) {
      //   updatedFlow[val] = [];
      // }
      if (boardValue(endPoint, cell)) {
        updatedFlow[val] = [];
      }
      let cellIndex = updatedFlow[val].indexOf(cell)
      if (cellIndex !== -1) {
        updatedFlow[val] = updatedFlow[val].slice(0, cellIndex + 1);
      } else {
        updatedFlow[val].push(cell);
      }
      setFlow(updatedFlow.map(row=>[...row]))
    }
  }


  const handleOnDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    let updatedFlow = flow.map(row=> [...row])
    if (currCell !== -1 && chosenFlow !== -1) {
      if (isNeighbour(idx, currCell, board.length)) {
        if (boardValue(board, idx) === 0 && !flowComplete()) {
          updatedFlow[chosenFlow].push(idx)
          setCurrCell(idx);
          updateCellColor(idx)
        }
        else {
          if (boardValue(board, idx) === chosenFlow) {
            if (updatedFlow[chosenFlow].includes(idx)) {
              updatedFlow[chosenFlow].splice(updatedFlow[chosenFlow].indexOf(idx) + 1, updatedFlow[chosenFlow].length);
            } else {
              updatedFlow[chosenFlow].push(idx);
            }
            if (boardValue(endPoint, idx) === chosenFlow) {
              let flowComplete = 0;
              for (let i = 0; i < updatedFlow[chosenFlow].length; i++) {
                const elem = updatedFlow[chosenFlow][i];
                if (boardValue(endPoint, elem)) {
                  flowComplete += 1;
                }
              }
              if (flowComplete === 2) {
                setFlow(updatedFlow.map(row=>[...row]))
                return
              }
            }
            setCurrCell(idx);
          }
        }
      }
    }
    setFlow(updatedFlow.map(row=>[...row]))
  }

  const handleDrop = () => {
    setDraggingOver(false);
  }

  const updateCellColor = (cell: number) => {
    if (chosenFlow) {
      let updatedBoard = board.map(row => [...row]);
      updatedBoard[Math.floor(cell / board.length)][cell % board.length] = chosenFlow;
      setBoard(updatedBoard.map(row => [...row]));
    }
  }

  const updateFlow = () => {
    const updatedBoard =  board.map(row => [...row]);
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
    setBoard(updatedBoard.map(row => [...row]));
  }

  

  // useEffect(() => {
  //   if (isSolved()) {
  //     setShowAnimation(true);
  //     setTimeout(() => {
  //       boardSetup();
  //     }, 5000)
  //   }
  // }, [updateFlow])

  const boardValue = (arr: BoardType, cell: number) => {
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

  const isEnd = (idx: number) => {
    const value = boardValue(board, idx);
    const flowArray = flow[value];
    const flowIndex = flowArray.indexOf(idx);
    const connector = flowIndex !== -1 && flowIndex === flowArray.length - 1 && flowArray.length > 1;
    return connector || (boardValue(endPoint, idx) !== 0);
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
      let size = getCellSize(-1)
      let obj = { backgroundColor: cellColor[cell],
        width: `${size/4}px`, height: `${size + 0.25}px`,
        [`margin${dir}`] : `${size * 0.75}px`,
      }
      return obj;
    }
    return {}
  }
  const getCellSize = (index: number) => {
    let containerSize = Math.min(window.innerHeight, window.innerWidth) * 0.75;
    let size = containerSize / boardSize;
    let isEndPoint = false;
    if (index !== -1) {
      isEndPoint = !(boardValue(endPoint, index) === 0);
      let val = boardValue(board, index)
      let idx = flow[val].indexOf(index)
      let isLast = (idx === flow[val].length - 1) && (idx !== -1);
      if (!isEndPoint && isLast) {
        return size / 1.75;
      }
    }

    if (isEndPoint) {
      return size/1.5;
    }
    return size;
  }

  const isSolved = () => {
    if (board.length === 0) {
      return false;
    }
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === 0) {
          return false;
        }
      }
    }
    let flowCopy = flow.map(row => [...row])
    flowCopy.shift()
    for (const color of flowCopy) {
      let cnt = 0;
      for (const index of color) {
        if (boardValue(endPoint, index)) {
          cnt += 1
        }
      }
      if (cnt < 2) {
        return false;
      }
    }
    return true;
  }

  const flowComplete = () => {
    let cnt = 0
    for (const color of flow[chosenFlow]) {
      if (boardValue(endPoint, color)) {
        cnt += 1
      }
    }
    return cnt === 2;
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
      {board.flat().map((cell, index) => (
        <React.Fragment key={index}>
        <div
          style = {{width: `${getCellSize(-1)}px`, height: `${getCellSize(-1)}px`}}
          className="boardCell flex justify-center items-center"
        >
        {isConnector(index) && 
       <div
       draggable className={`${getConnector(index)}`}
        style={getConnectorStyle(cell, index)}
        ></div>
      }

        <button           
          draggable
          onDragStart={(e) => handleOnDrag(e, index)}
          onDragOver={(e) => handleOnDragOver(e, index)}
          onDrop={handleDrop}
          style= { {
            ...getBackgroundClass(index),
           width: `${getCellSize(index)}px`, 
           height: `${getCellSize(index)}px`
          }}
          className={`flex justify-center item-center 
          ${isEnd(index) ? "circle" : ""}`}>
          {isEnd(index) ? cell : ""}
          </button>
        </div>
        </React.Fragment>
      ))}
    </div>
    </div>
    </>
  );
}

export default Board;
