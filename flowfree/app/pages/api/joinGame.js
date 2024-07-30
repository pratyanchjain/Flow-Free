const axios = require('axios')

async function getBoard(boardSize) {
    try {
        let response = await axios.post("http://localhost:3004/api/", {size: boardSize});
        return response.data;
    } catch (error) {
        return error;
    }
}

module.exports = getBoard