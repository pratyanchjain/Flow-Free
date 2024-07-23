type BoardType = number[][];

type cellColorType = {
    [key: number]: string;
} 

interface BoardProps {
    InputBoard: BoardType;
    cellColor: cellColorType;
    onBoardUpdate?: (newBoardState: BoardType) => void;
    mode: string;
}
  
type GameData = {
    Game: string;
    Board: BoardType;
    Color: cellColorType;
};