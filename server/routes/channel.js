const { ObjectId } = require("mongodb");
const formidable = require("formidable");
const path = require("path");

module.exports = {
  route: (
    app,
    users,
    groups,
    channelsCollection,
    chatHistoryCollection,
    saveGroups,
    saveUsers
  ) => {
    // META DATA:

    // Get channel details by its ID
    app.get("/api/channels/:id", async (req, res) => {
      const { id } = req.params;

      // Check if the ID is a valid MongoDB ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid channel ID format" });
      }

      try {
        const objectId = new ObjectId(id);
        const channel = await channelsCollection.findOne({ _id: objectId });

        if (channel) {
          res.status(200).json(channel);
        } else {
          // Log for debugging
          res.status(404).json({ message: "Channel not found" });
        }
      } catch (err) {
        console.error("Error in /GET /api/channels/:id", err); // Log the error
        res.status(500).json({ message: "Server error", error: err });
      }
    });

    // Add a new channel to a specific group and update the user
    app.post("/api/groups/:id/channels", async (req, res) => {
      const groupId = req.params.id;
      const { id, name, channelUsers, pendingUsers, banned_users } = req.body;

      const group = groups.find((group) => group.id === groupId);

      if (group) {
        try {
          const newChannel = {
            _id: new ObjectId(),
            name,
            channelUsers,
            pendingUsers,
            banned_users,
          };

          // Insert the new channel directly into MongoDB
          await channelsCollection.insertOne(newChannel);

          // Add the new channel ID to the group's channels array
          group.channels.push(newChannel._id.toString());
          saveGroups(groups); // Save the updated group data

          // console.log(users);
          // Update the user who created the channel (first user in the 'users' array)
          users.forEach((user) => {
            if (newChannel.channelUsers.includes(user.id)) {
              // Add the new channel ID to the user's channels array
              user.channels.push(newChannel._id.toString());
            }
          });
          saveUsers(users); // Save the updated user data

          // Return both the group and new channel in a single object
          res.status(201).json({ group, newChannel });
        } catch (err) {
          res
            .status(500)
            .json({ message: "Failed to create channel", error: err });
        }
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    });

    // Update a channel name by its ID
    app.put("/api/channels/:channelId", async (req, res) => {
      const { channelId } = req.params;
      const { newChannelName } = req.body;

      try {
        const objectId = new ObjectId(channelId);

        // Find the current channel by its ID
        const channel = await channelsCollection.findOne({ _id: objectId });

        if (!channel) {
          return res.status(404).json({ message: "Channel not found" });
        }

        // Check if the newChannelName is the same as the current one
        if (channel.name === newChannelName) {
          // If the names are the same, return a 200 status without performing an update
          return res.status(200).json({ message: "Channel name is unchanged" });
        }

        // If the names are different, perform the update
        const result = await channelsCollection.updateOne(
          { _id: objectId },
          { $set: { name: newChannelName } }
        );

        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Channel updated successfully" });
        } else {
          res.status(404).json({ message: "Channel not found" });
        }
      } catch (err) {
        res
          .status(500)
          .json({ message: "Failed to update channel", error: err });
      }
    });

    // Delete a channel from a specific group
    app.delete("/api/groups/:id/channels/:channelId", async (req, res) => {
      const groupId = req.params.id;
      const channelId = req.params.channelId;

      const group = groups.find((group) => group.id === groupId);

      if (group) {
        const channelIndex = group.channels.findIndex(
          (channelID) => channelID === channelId // Directly comparing the string IDs
        );

        if (channelIndex !== -1) {
          // Remove the channel from the group's channels array
          group.channels.splice(channelIndex, 1);
          saveGroups(groups); // Save the updated groups

          const objectId = new ObjectId(channelId);

          // Remove the channel from MongoDB directly
          const result = await channelsCollection.deleteOne({
            _id: objectId,
          });

          if (result.deletedCount > 0) {
            res.status(200).json({ message: "Channel deleted successfully" });
          } else {
            res.status(404).json({ message: "Channel not found in MongoDB" });
          }
        } else {
          res.status(404).json({ message: "Channel not found in group" });
        }
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    });

    // Request to join a channel
    app.put("/api/channels/:channelId/requestToJoin", async (req, res) => {
      const { channelId } = req.params;
      const { userId } = req.body; // Get the user ID from the request body

      const objectId = new ObjectId(channelId);

      const channel = await channelsCollection.findOne({
        _id: objectId,
      });
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const user = users.find((user) => user.id === userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Add the user to channel's pendingUsers if they are not already there
      if (!channel.pendingUsers.includes(userId)) {
        channel.pendingUsers.push(userId);
      }

      // Add the channel to user's interest_channels if not already present
      if (!user.interest_channels.includes(channelId)) {
        user.interest_channels.push(channelId);
      }

      // Save the updated channel in MongoDB
      await channelsCollection.updateOne(
        { _id: objectId },
        { $set: { pendingUsers: channel.pendingUsers } }
      );
      saveUsers(users); // Save the updated user data

      res
        .status(200)
        .json({ message: "Request to join channel sent", channel, user });
    });

    // Approve user request to join a channel
    app.put("/api/channels/:channelId/approveUser", async (req, res) => {
      const { channelId } = req.params;
      const { userId } = req.body; // Get the user ID from the request body

      const objectId = new ObjectId(channelId);

      const channel = await channelsCollection.findOne({
        _id: objectId,
      });
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const user = users.find((user) => user.id === userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove the user from pendingUsers and add them to the channel's users
      channel.pendingUsers = channel.pendingUsers.filter((u) => u !== userId);
      if (!channel.channelUsers.includes(userId)) {
        channel.channelUsers.push(userId);
      }

      // Update user channel data
      user.interest_channels = user.interest_channels.filter(
        (ch) => ch !== channelId
      );
      if (!user.channels.includes(channelId)) {
        user.channels.push(channelId);
      }

      // Save the updated channel and user in MongoDB
      await channelsCollection.updateOne(
        { _id: objectId },
        {
          $set: {
            pendingUsers: channel.pendingUsers,
            channelUsers: channel.channelUsers,
          },
        }
      );
      saveUsers(users); // Save the updated user data

      res.status(200).json({ user });
    });

    // Decline user request to join channel
    app.put("/api/channels/:channelId/declineUser", async (req, res) => {
      const { channelId } = req.params;
      const { userId } = req.body; // Get the user ID from the request body

      try {
        const objectId = new ObjectId(channelId);

        // Find the channel by its ID
        const channel = await channelsCollection.findOne({ _id: objectId });
        if (!channel) {
          return res.status(404).json({ message: "Channel not found" });
        }

        // Find the user in the `users` array
        const user = users.find((user) => user.id === userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Remove the user from the channel's pendingUsers array
        channel.pendingUsers = channel.pendingUsers.filter((u) => u !== userId);

        // Update the channel in MongoDB with the new pendingUsers array
        await channelsCollection.updateOne(
          { _id: objectId },
          { $set: { pendingUsers: channel.pendingUsers } }
        );

        // Remove the channel from the user's interest_channels array
        user.interest_channels = user.interest_channels.filter(
          (ch) => ch !== channelId
        );

        // Save the updated user
        await saveUsers(users);

        // Respond with the updated user and success message
        return res.status(200).json({
          message: "User request to join channel declined",
          user,
        });
      } catch (err) {
        console.error("Error declining user:", err);
        return res
          .status(500)
          .json({ message: "Failed to decline user", error: err });
      }
    });

    // Ban a user from a channel
    app.put("/api/channels/:channelId/banUser", async (req, res) => {
      const { channelId } = req.params;
      const { userId } = req.body; // Get the user ID from the request body

      try {
        const objectId = new ObjectId(channelId);

        // Find the channel by its ID
        const channel = await channelsCollection.findOne({ _id: objectId });
        if (!channel) {
          return res.status(404).json({ message: "Channel not found" });
        }

        // Find the user in the in-memory `users` array
        const user = users.find((user) => user.id === userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Remove the user from the channel's users array and add them to banned_users if not already banned
        channel.channelUsers = channel.channelUsers.filter((u) => u !== userId);
        if (!channel.banned_users.includes(userId)) {
          channel.banned_users.push(userId);
        }

        // Remove the channel from the user's channels array and add it to banned_channels if not already banned
        user.channels = user.channels.filter((ch) => ch !== channelId);
        if (!user.banned_channels.includes(channelId)) {
          user.banned_channels.push(channelId);
        }

        // Persist the changes to the in-memory `users` array
        saveUsers(users); // Assuming saveUsers(users) saves the in-memory array somewhere (e.g., a file)

        // Save the updated channel in MongoDB
        await channelsCollection.updateOne(
          { _id: objectId },
          {
            $set: {
              channelUsers: channel.channelUsers,
              banned_users: channel.banned_users,
            },
          }
        );

        res.status(200).json({ message: "User successfully banned", user });
      } catch (err) {
        console.error("Error banning user:", err);
        res.status(500).json({ message: "Failed to ban user", error: err });
      }
    });

    // CHAT HISTORY:
    // Get chat history for a specific channel
    app.get("/api/channels/:channelId/messages", async (req, res) => {
      const { channelId } = req.params;

      try {
        const messages = await chatHistoryCollection
          .find({ channelId: channelId })
          .toArray();
        // console.log(messages);
        res.status(200).json(messages);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages", error });
      }
    });

    // Image Upload Route
    app.post("/api/upload-image", (req, res) => {
      const form = new formidable.IncomingForm({
        uploadDir: "./uploads", // Directory where images will be stored
        keepExtensions: true, // Keep the file extension
      });

      let newFileName = null;

      form.on("fileBegin", (name, file) => {
        const ext = path.extname(file.originalFilename).toLowerCase();
        newFileName = `image_${Date.now()}${ext}`; // Unique filename
        file.filepath = path.join(form.uploadDir, newFileName); // Set file path
      });

      form.parse(req, (err, fields, files) => {
        if (err) {
          return res.status(500).json({ message: "Error uploading file", err });
        }

        // Return the file path of the uploaded image
        res.status(200).json({
          message: "Image uploaded successfully",
          imageUrl: `http://localhost:3000/uploads/${newFileName}`,
        });
      });
    });
  },
};
