import { create } from 'zustand'

const useStore = create<StoreState>((set) => ({
    board: [],
    updateBoard: (newBoard) => set({ board: newBoard }),
    cellColor: [],
    updateColor: (newColor) => set({ cellColor: newColor }),
}))

export default useStore