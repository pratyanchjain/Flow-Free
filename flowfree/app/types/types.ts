
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
    board: BoardType;
    updateBoard: (newBoard: BoardType) => void;
    cellColor: cellColorType;
    updateColor: (newColor: cellColorType) => void;
}