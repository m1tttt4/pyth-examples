const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const queries = require('./queries');
const app = express();
const port = 4000;
const socketPort = 8001;
const server = require("http").createServer(app);
const io = require("socket.io") (server, {
  cors: {
    origin: "http://34.122.28.32:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get('/', (request, response) => {
  response.sendFile('./index.html', { root: '.' });
});
app.listen(port, () => {
  console.log(`App running on *:${port}.`)
});

const emitContracts = () => {
  queries.getContracts()
    .then((result) => io.emit("getContracts", result))
    .catch(console.log);
};

/*
 * Listens for:
 *   "connection"
 *     "getContracts" -> emitContracts() -> queries.getContracts() -then-emits->
 *         "getContracts", result
 *     "createContract" -> queries.createSeller(JSON.parse(contract)) -then->
 *         emitContracts() -> queries.getContracts() -then-emits->
 *         "getContracts", result
*/
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("getContracts", (symbol_key) => {
    console.log("getContracts", symbol_key);
    emitContracts(symbol_key);
  });
  socket.on("createContract", (contract) => {
    console.log("createContract", contract);
    queries.createSeller(JSON.parse(contract))
      .then((_) => {
        emitContracts();
      })
      .catch((err) => io.emit(err));
  });
  // close event when user disconnects from app
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Displays in terminal which port the socketPort is running on
server.listen(socketPort, () => {
  console.log(`listening on *:${socketPort}`);
});
