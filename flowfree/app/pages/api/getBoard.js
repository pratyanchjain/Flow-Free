const axios = require('axios')

async function getBoard(boardSize) {
    try {
        let response = await axios.post("http://localhost:3003/puzzle/", {size: boardSize});
        return response.data;
    } catch (error) {
        return error;
    }
}

module.exports = getBoard