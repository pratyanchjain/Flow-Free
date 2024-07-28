"use client"
import {useEffect, useState, useRef} from "react"
import Board from "../../components/board"
import { socket } from '../../socket';
import { useRouter, usePathname } from "next/navigation";

const Multiplayer = () => {
    const [board1, setBoard1] = useState<BoardType>([])
    const [board2, setBoard2] = useState<BoardType>([])
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [cellColor, setCellColor] = useState<cellColorType>({});
    const [game, setGame] = useState('')
    const router = useRouter()
    const path = usePathname()
    const [winner, setWinner] = useState('');

    useEffect(() => {
        console.log("rerendering")
        console.log(board1, board2)
    }, [board1, board2])

    useEffect(() => {
        socket.connect(); // Manually connect

        const onConnect = () => {
            setIsConnected(true);
            if (!path?.includes("game")) {
                socket.emit("joinQueue");
            }
        }

        const onDisconnect = () => {
            setIsConnected(false);
        }

        const joinGame = (response: GameData) => {
            console.log("client", response);
            setGame(response.Game);
            setCellColor(response.Color)
            setBoard1(response.Board);
            setBoard2(response.Board)
        }

        const endGame = (response: string) => {
            if (response === "you won") {
                setWinner("1")
            }
            else {
                setWinner("2")
            }
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('matched', (response:  GameData) => joinGame(response))
        socket.on('aborted', () => setGame(''))
        socket.on('opponentMove', (response: BoardType) => {
            console.log("response from op move", response);
            setBoard2(response)
        })
        socket.on('endGame', (response: string) => endGame(response));

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('matched', joinGame);
            socket.off('aborted');
            socket.off('opponentMove');
            socket.off('endGame');
            socket.disconnect(); // Ensure to disconnect on cleanup
        };
    }, []);

    const updateMove = (board: BoardType | string) => {
        console.log("reaching updateMove")
        let changed = false
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (board1[i][j] !== board[i][j]) {
                    changed = true;
                    break
                }
            }
        }
        if (changed) {
            setBoard1(board as BoardType);
            if (board !== "solved!") {
                // setBoard1(board as BoardType);
                if (board)
                socket.emit("updateMove", board);
            } else {
                console.log("emitted won")
                socket.emit("gameWon");
            }
        }
    }
    return (
        <>
        {game !== '' ? 
        winner === '' ?
        <div>
            {game}
        <div className="flex flex-lg-row flex-col lg:flex-row m-4">
            <Board key={1} InputBoard={board1} cellColor={cellColor} onBoardUpdate={updateMove} mode="duel"/>
            <Board key={2} InputBoard={board2} cellColor={cellColor} onBoardUpdate={updateMove} mode="duel"/>
        </div></div>: 
        winner === "1" ? <div>You won!</div> : <div>Opponent won</div>
        :
            `joined : ${game}` 
        }
        </>
    )
}

export default Multiplayer;