"use client"
import {useEffect, useState,useContext} from "react"
import Board from "../../components/board"
import { usePathname } from "next/navigation";
import Stopwatch from "@/app/components/Stopwatch";
import { Modal, ModalBody,ModalHeader, ModalContent, ModalFooter, Button, useDisclosure, user } from "@nextui-org/react";
import useStore  from "../../Zustand/useStore";
import {useRouter} from "next/navigation";
import { socket } from "../../../socket";

const Multiplayer = () => {
    const [board1, setBoard1] = useState<BoardType>(useStore((state) => state.board1))
    const [board2, setBoard2] = useState<BoardType>(useStore((state) => state.board2))
    const game = usePathname()
    const [cellColor, setCellColor] = useState<cellColorType>(useStore((state) => state.cellColor))
    const path = usePathname()
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [winner, setWinner] = useState('');
    const router = useRouter()
    const updateBoard1 = useStore((state) => state.updateBoard1)
    const updateBoard2 = useStore((state) => state.updateBoard2)
    const [userId, setUserId] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [finalTime, setFinalTime] = useState<number>(0.00);

    useEffect(() => {
        console.log("winner ", winner);
        if (winner) {
            console.log("pushing to router");
            router.push("/duel/");
        }
        let user = localStorage.getItem('userId');
        if (!user) {
          user = (Math.random() * 1000).toString();
          localStorage.setItem('userId', user);
        }
        console.log("user Id is", user);
        setUserId(user);
    }, [])

    useEffect(() => {
        if (userId !== "") {
            socket.emit("userID", userId, board1.length)
        }

        if (socket.connected) {
            onConnect();
            console.log("emitting playerID")
            socket.emit("playerID", game, userId)
        }
    
        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
        
            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });

        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }
      
        const endGame = (response: string) => {
            if (response === "you won") {
                setWinner("1")
            }
            else {
                setWinner("2")
            }
            onOpen();
        }

        const opMove = (response: BoardType) => {
            console.log("response from op move", response);
            setBoard2(response);
            updateBoard2(response)

        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('opponentMove', opMove)
        socket.on('endGame', (response: string) => endGame(response));

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('opponentMove', opMove);
            socket.off('endGame');
        };
    }, [userId]);

    const updateMove = (board: BoardType | string) => {
        console.log("reaching updateMove", board)
        if (board === "solved!") {
            console.log("emitted won")
            socket.emit("gameWon", userId, board.length);
        }
        else {
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
                updateBoard1(board as BoardType)
                console.log("op move", board)
                socket.emit("updateMove", board, userId);
            }
        }
    }

    const handleStopwatchStop = (time: number) => {
        setFinalTime(time); // Capture the time when the stopwatch stops
    };

    return (
        <>
        {game !== '' ? 
        <div className="h-full p-4">
            <Button variant="bordered" className="text-white" onClick={() => router.push("/")}>Exit</Button>
            {winner !== '' ?
            <Modal backdrop={"opaque"} 
            isDismissable={false}
            classNames={{
                body: "py-6",
                backdrop: "bg-[#000000]/50 backdrop-opacity-40",
                base:  `border-4 border-${winner === "1" ? "success" : "danger"} bg-black light:bg-[#000000] text-[#FFFFFF]`,
                // header: "border-b-[1px] border-[#000000]",
                // footer: "border-t-[1px] border-[#000000]",
                // closeButton: "hover:bg-white/5 active:bg-white/10",
              }}
              isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                  <h4 className="pt-4">{winner === "1" ? "You won!": "You lost"}</h4>
                  </ModalHeader>
                  <ModalBody>
                  {finalTime !== null && <div>Final Time: {finalTime}</div>}
                  </ModalBody>
                  <ModalFooter className="w-full">
                    <Button className="w-full" color="danger" onPress={onClose}>
                      Close
                    </Button>
                    <Button color="primary" className="w-full" onClick={() => router.push("/duel/")}>Play Again</Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
            : <div></div> }
        <div className="w-full text-center"><Stopwatch isActive={winner===''} onStop={handleStopwatchStop}/></div>
        <div className="flex flex-lg-row flex-col lg:flex-row m-4 text-center">
            <div className="flex flex-col">
                <h3>You</h3>
                <Board key={1} drag={winner ? false : true} InputBoard={board1} cellColor={cellColor} onBoardUpdate={updateMove} mode="duel"/>
            </div>
            <div className="flex flex-col">
                <h3>Opponent</h3>
                <Board key={2} drag={false} InputBoard={board2} cellColor={cellColor}  mode="duel"/>
            </div>
        </div></div>        
        :
            `joined : ${game}` 
        }
        </>
    )
}

export default Multiplayer;