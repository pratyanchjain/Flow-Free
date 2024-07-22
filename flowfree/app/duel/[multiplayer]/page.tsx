"use client"
import {useEffect, useState} from "react"
import Board from "../../components/board"
import { socket } from '../../socket';
import { useRouter, usePathname } from "next/navigation";
import { generateColors } from "../../utils/colorGenerator";

type BoardType = number[][];
type GameData = {
    Game: string;
    Board: BoardType;
    Color: cellColorType;
};
type cellColorType = {
    [key: number]: string;
  }
export default function Multiplayer() {
    const [board, setBoard] = useState<BoardType>([])
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [game, setGame] = useState('');
    const [cellColor, setCellColor] = useState<cellColorType>({});
    const router = useRouter()

    useEffect(() => {
        console.log("game", game)
        if (game !== '') {
            router.push("/duel/" + game);
        }
    }, [usePathname()])

    useEffect(() => {
        socket.connect(); // Manually connect

        function onConnect() {
            setIsConnected(true);
            socket.emit("joinQueue");
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function joinGame(response: GameData) {
            console.log("client", response);
            setGame(response.Game);
            setCellColor(response.Color)
            setBoard(response.Board);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('matched', (response:  GameData) => joinGame(response))
        socket.on('aborted', () => setGame(''))

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect(); // Ensure to disconnect on cleanup
        };
    }, []);


    return (
        <>
        {game !== '' ? 
        <div className="flex flex-lg-row flex-col lg:flex-row m-4">
            <Board InputBoard={board} cellColor={cellColor}/>
            <Board InputBoard={board} cellColor={cellColor}/>
        </div>
        :
            `joined : ${game}` 
        }
        </>
    )
}