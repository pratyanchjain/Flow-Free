"use client"
import {useEffect, useState} from "react"
import Board from "../../components/board"
import { socket } from '../../socket';
import { useRouter, usePathname } from "next/navigation";

export default function Multiplayer() {
    const [board1, setBoard1] = useState<BoardType>([])
    const [board2, setBoard2] = useState<BoardType>([])
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
            setBoard1(response.Board);
            setBoard2(response.Board)
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('matched', (response:  GameData) => joinGame(response))
        socket.on('aborted', () => setGame(''))
        socket.on('opponentMove', (response: BoardType) => setBoard2(response))

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect(); // Ensure to disconnect on cleanup
        };
    }, []);

    function updateMove(board: BoardType) {
        console.log("op move emitted");
        socket.emit("updateMove", board);
    }
    return (
        <>
        {game !== '' ? 
        <div className="flex flex-lg-row flex-col lg:flex-row m-4">
            <Board InputBoard={board1} cellColor={cellColor} onBoardUpdate={() => updateMove(board1)} mode="duel"/>
            <Board InputBoard={board2} cellColor={cellColor} onBoardUpdate={() => updateMove(board2)} mode="duel"/>
        </div>
        :
            `joined : ${game}` 
        }
        </>
    )
}