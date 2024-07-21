"use client"
import {useEffect, useState} from "react"
import axios from 'axios'
import { socket } from '../../socket';
import { useRouter, usePathname } from "next/navigation";

type BoardType = number[][];
type GameData = {
    Game: string;
    Board: BoardType; // Replace `any` with the specific type of `Board` if known
};

export default function Multiplayer() {
    const [board, setBoard] = useState<BoardType>([])
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [game, setGame] = useState('');
    const router = useRouter()

    useEffect(() => {
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
            setBoard(response.Board);
        }
        // axios.get("http://localhost:3004/multiplayer/")
        //     .then((response) => {
        //         console.log(response);
        //         if (response.data) {
        //             setMsg(response.data);
        //         }
        //     })
        //     .catch(error => {
        //         console.error('There was an error with the axios request:', error);
        //     });

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
        <div>{game !== '' ? `joined : ${game}` : "no one is here"}</div>
        <div></div>
        </>
    )
}