
type BoardType = number[][];

type CellType = Cell[];

type cellColorType = {
    [key: number]: string;
} 

type Cell = {
    Value: number,
    Id: number
}
  
type GameData = {
    Game: string;
    Board: BoardType;
    Color: cellColorType;
};

interface BoardProps {
    InputBoard: BoardType;
    cellColor: cellColorType;
    onBoardUpdate?: (newBoardState: BoardType | string) => void;
    mode: string;
}

interface MultiplayerProps {
    board: BoardType;
    cellColor: cellColorType;
    game: string;
}

interface StoreState {
    board1: BoardType;
    board2: BoardType;
    updateBoard1: (newBoard: BoardType) => void;
    updateBoard2: (newBoard: BoardType) => void;
    cellColor: cellColorType;
    updateColor: (newColor: cellColorType) => void;
}