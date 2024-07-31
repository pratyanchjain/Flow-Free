const axios = require('axios')

async function getBoard(boardSize) {
    try {
        let response = await axios.post("https://flow-free.onrender.com/puzzle/", {size: boardSize});
        return response.data;
    } catch (error) {
        return error;
    }
}

module.exports = getBoard