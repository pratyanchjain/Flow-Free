const express = require('express')
var cors = require('cors')
const app = express()

app.use(cors())

const port = 3004

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})