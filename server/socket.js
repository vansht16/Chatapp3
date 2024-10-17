module.exports = {
  connect: function (io, chatHistoryCollection) {
    io.on("connection", (socket) => {
      console.log(`User connected with socket ID: ${socket.id}`);

      // Listen for chat messages and save them in MongoDB
      socket.on("chatMessage", async (data) => {
        const { channelId, userId, message, imageUrl } = data;
        const chatMessage = {
          channelId,
          userId,
          message,
          imageUrl,
          timestamp: new Date(),
        };
        console.log("Chat Message", chatMessage);

        // Save the message in MongoDB
        await chatHistoryCollection.insertOne(chatMessage);

        // Broadcast the message to all users in the channel
        io.to(channelId).emit("chatMessage", chatMessage);
      });

      // Listen for join channel event
      socket.on("joinChannel", (data) => {
        const { channelId, username } = data;
        socket.join(channelId);

        // Broadcast to the channel that the user has joined
        io.to(channelId).emit("systemMessage", {
          message: `${username} has joined the chat`,
          system: true,
        });
        console.log(`${username} joined channel ${channelId}`);
      });

      // Listen for leave channel event
      socket.on("leaveChannel", (data) => {
        const { channelId, username } = data;
        socket.leave(channelId);

        // Broadcast to the channel that the user has left
        io.to(channelId).emit("systemMessage", {
          message: `${username} has left the chat`,
          system: true,
        });
        console.log(`${username} left channel ${channelId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User disconnected with socket ID: ${socket.id}`);
      });
    });
  },
};
