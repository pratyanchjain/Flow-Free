type BoardType = number[][];

type CellType = Cell[];

type cellColorType = {
    [key: number]: string;
} 

type Cell = {
    Value: number,
    Id: number
}

interface BoardProps {
    InputBoard: BoardType;
    cellColor: cellColorType;
    onBoardUpdate?: (newBoardState: BoardType | string) => void;
    mode: string;
}
  
type GameData = {
    Game: string;
    Board: BoardType;
    Color: cellColorType;
};