const express = require("express");
const path = require("path");
const formidable = require("formidable");
const cors = require("cors");
const fs = require("fs");
const app = express(); // Create an instance of Express
// const https = require("https");

// const sslOptions = {
//   key: fs.readFileSync("key.pem"),
//   cert: fs.readFileSync("cert.pem"),
// };
// const httpsServer = https.createServer(sslOptions, app);

const http = require("http").Server(app); // Create HTTP server
const PORT = 3000;
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});
const sockets = require("./socket.js"); // Import socket logic
const { MongoClient } = require("mongodb");
const { loadUsers, saveUsers } = require("./handler/userDataHandler");
const { loadGroups, saveGroups } = require("./handler/groupDataHandler");

// MongoDB Connection URL and Database Name
const URL = "mongodb://localhost:27017";
const dbName = "chatApp";
let db;

// Parse URL-encoded bodies and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (uploaded images)
app.use("/images", express.static(path.join(__dirname, "./userimages")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// This will allow requests only from the frontend of this application
var corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Load data from JSON file (for users and groups)
let users = loadUsers();
let groups = loadGroups();

// Import and use routes
require("./routes/login").route(app, users);
require("./routes/group").route(app, users, groups, saveGroups, saveUsers);
require("./routes/user").route(app, users, groups, saveGroups, saveUsers);

// Main function to connect to MongoDB and set up the Express server
async function main() {
  try {
    const client = new MongoClient(URL);

    await client.connect(); // Connect to MongoDB
    db = client.db(dbName); // Use the "chatApp" database

    console.log("Connected successfully to MongoDB");

    // Pass MongoDB collections to routes for channels and chat history
    const channelsCollection = db.collection("channels");
    const chatHistoryCollection = db.collection("chatHistory");

    // Register the channel routes, passing MongoDB collections
    require("./routes/channel").route(
      app,
      users,
      groups,
      channelsCollection,
      chatHistoryCollection,
      saveGroups,
      saveUsers
    );

    // Initialize Socket.IO
    sockets.connect(io, chatHistoryCollection);

    // Start the server using http, not app
    http.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Call the main function to connect to MongoDB and start the server
main();

module.exports = app;
