const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./queries');
const app = express();
const port = 4000;
const socketPort = 8001;
const server = require("http").createServer(app);
const io = require("socket.io") (server, {
  cors: {
    origin: "http://localhost:4000",
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
  /* response.json({ info: 'Our app is up and running' }) */
});
app.listen(port, () => {
  console.log(`App running on *:${port}.`)
});

app.get("/options", db.getOptions);
app.post("/options", db.createBuyer);

const emitOptions = () => {
  db.getSocketOptions()
    .then((result) => io.emit("option", result))
    .catch(console.log);
};

// connects, creates buyer, and emits top 10 options
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("option", (msg) => {
    db.createSocketBuyer(JSON.parse(msg))
      .then((_) => {
        emitOptions();
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
