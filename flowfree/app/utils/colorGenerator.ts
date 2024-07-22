type cellColorType = {
    [key: number]: string;
}

export const generateColors = (boardSize: number) => {
    let cellColors = {} as cellColorType
    for (let i = 0; i <= boardSize; i++) {
        cellColors[i] = getRandomColor();
    }
    cellColors[0] = "#000000";
    return cellColors;
}

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
