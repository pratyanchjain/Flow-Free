import { create } from 'zustand'
import { persist } from 'zustand/middleware';

const useStore = create<StoreState>()(persist(
    (set) => ({
    board1: [],
    board2: [],
    updateBoard1: (newBoard) => set({ board1: newBoard }),
    updateBoard2: (newBoard) => set({ board2: newBoard }),
    cellColor: [],
    updateColor: (newColor) => set({ cellColor: newColor }),
    }),
    {
        name: '',
        getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    })
)

export default useStore