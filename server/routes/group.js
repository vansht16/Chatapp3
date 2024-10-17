module.exports = {
  route: (app, users, groups, saveGroups, saveUsers) => {
    // Get all groups
    app.get("/api/groups", (req, res) => {
      const adminIds = req.query.adminId ? [].concat(req.query.adminId) : null;

      let filteredGroups = groups;

      if (adminIds) {
        filteredGroups = groups.filter((group) =>
          adminIds.includes(group.adminId)
        );
      }

      res.json(filteredGroups);
    });

    // Get a specific group by its ID
    app.get("/api/groups/:id", (req, res) => {
      const groupId = req.params.id;
      const group = groups.find((group) => group.id === groupId);

      if (group) {
        res.status(200).json(group);
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    });

    // Add a new group
    app.post("/api/groups", (req, res) => {
      try {
        const newGroup = req.body;

        // Check if the necessary fields are provided
        if (!newGroup.id || !newGroup.groupname || !newGroup.adminId) {
          return res
            .status(400)
            .json({ message: "Required fields: id, groupname, adminId" });
        }

        // Add the new group to the groups list
        groups.push(newGroup);

        // Find the admin in the users list and update their groups array
        const adminUser = users.find((user) => user.id === newGroup.adminId);
        if (adminUser) {
          adminUser.groups.push(newGroup.id);
        }

        // Save the updated groups and users lists
        saveGroups(groups);
        saveUsers(users);

        // Respond with the newly created group
        res.status(201).json(newGroup);
      } catch (err) {
        // Handle potential errors
        res
          .status(500)
          .json({ message: "Error occurred while creating the group" });
      }
    });

    // Update a group name
    app.put("/api/groups/:id/name", (req, res) => {
      const groupId = req.params.id;
      const { newGroupName } = req.body;

      const group = groups.find((group) => group.id === groupId);

      if (group) {
        group.groupname = newGroupName; // Update the group name
        saveGroups(groups); // Save the updated group list to JSON file
        res.status(200).json(group);
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    });

    // Delete a group
    app.delete("/api/groups/:id", (req, res) => {
      const groupId = req.params.id;
      const adminId = req.query.adminId;

      // Find the group by ID
      const groupIndex = groups.findIndex(
        (group) =>
          group.id === groupId &&
          (group.adminId === adminId || group.adminId === "super")
      );

      if (groupIndex !== -1) {
        // Remove the group from the groups array
        groups.splice(groupIndex, 1);

        // Find the admin in the users list and remove the group from their groups array
        const adminUser = users.find((user) => user.id === adminId);
        if (adminUser) {
          adminUser.groups = adminUser.groups.filter((id) => id !== groupId);
        }

        // Save the updated groups and users lists to their respective JSON files
        saveGroups(groups);
        saveUsers(users);

        // Send a no-content response
        res.status(204).send();
      } else {
        res.status(403).json({
          message: "Forbidden: You don't have permission to delete this group.",
        });
      }
    });

    // Request to join a group
    app.put("/api/groups/:id/register-interest", (req, res) => {
      const groupId = req.params.id;
      const userId = req.body.userId;

      const group = groups.find((group) => group.id === groupId);
      const user = users.find((user) => user.id === userId);

      if (group && user) {
        // Add user to the group's pendingUsers list if not already added
        if (!group.pendingUsers.includes(userId)) {
          group.pendingUsers.push(userId);
        }

        // Add group to the user's interest_groups list if not already added
        if (!user.interest_groups.includes(groupId)) {
          user.interest_groups.push(groupId);
        }

        // Save the updated groups and users lists to their respective JSON files
        saveGroups(groups);
        saveUsers(users);

        res.status(200).json({ message: "Interest registered successfully" });
      } else {
        res.status(404).json({ message: "Group or user not found" });
      }
    });

    // Approve user to join a group
    app.put("/api/groups/:id/approve", (req, res) => {
      const groupId = req.params.id;
      const userId = req.body.userId;

      const group = groups.find((group) => group.id === groupId);
      const user = users.find((user) => user.id === userId);

      if (group && user) {
        // Remove the user from the group's pending users
        group.pendingUsers = group.pendingUsers.filter((id) => id !== userId);

        // Add the user to the group's users
        group.users.push(userId);

        // Add the group to the user's list of groups
        if (!user.groups.includes(groupId)) {
          user.groups.push(groupId);
        }

        // Remove the group from the user's interest groups
        user.interest_groups = user.interest_groups.filter(
          (id) => id !== groupId
        );

        // Save the updated groups and users
        saveGroups(groups);
        saveUsers(users);

        res.status(200).json(group);
      } else {
        res.status(404).json({ message: "Group or user not found" });
      }
    });

    // Decline user to join a group
    app.put("/api/groups/:id/decline", (req, res) => {
      const groupId = req.params.id;
      const userId = req.body.userId;

      const group = groups.find((group) => group.id === groupId);
      const user = users.find((user) => user.id === userId);

      if (group && user) {
        group.pendingUsers = group.pendingUsers.filter((id) => id !== userId);
        user.interest_groups = user.interest_groups.filter(
          (id) => id !== groupId
        );
        console.log(user);
        saveGroups(groups);
        saveUsers(users);
        res.status(200).json(group);
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    });

    // Update group adminId to "super"
    app.put("/api/groups/:id/admin-to-super", (req, res) => {
      const groupId = req.params.id;

      const group = groups.find((group) => group.id === groupId);

      // console.log(group);

      if (group) {
        group.adminId = "super";
        saveGroups(groups);
        res
          .status(200)
          .json({ message: 'Group adminId updated to "super" successfully' });
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    });

    // Report a user to the Super Admin
    app.put("/api/groups/:id/report", (req, res) => {
      const groupId = req.params.id;
      const userId = req.body.userId;

      const group = groups.find((group) => group.id === groupId);
      const user = users.find((user) => user.id === userId);

      if (group && user) {
        // Add the user to the group's reported_users array
        if (!group.reported_users.includes(userId)) {
          group.reported_users.push(userId);
        }

        // Add the group to the user's reported_by_groups array
        if (!user.reported_by_groups) {
          user.reported_by_groups = [];
        }
        if (!user.reported_by_groups.includes(groupId)) {
          user.reported_by_groups.push(groupId);
        }

        // Save the updated group and user data
        saveGroups(groups);
        saveUsers(users);

        // console.log(
        //   `User ${user.username} has been reported to the Super Admin in group ${groupId}`
        // );

        res.status(200).json(group);
      } else {
        res.status(404).json({ message: "Group or user not found" });
      }
    });

    // Remove a user from a group
    app.put("/api/groups/:id/remove", (req, res) => {
      const groupId = req.params.id;
      const userId = req.body.userId;

      const group = groups.find((group) => group.id === groupId);
      const user = users.find((user) => user.id === userId);

      if (group && user) {
        // Remove the user from the group's users array
        group.users = group.users.filter((id) => id !== userId);

        // Remove the group from the user's groups array
        user.groups = user.groups.filter((id) => id !== groupId);

        // Save the updated groups and users
        saveGroups(groups);
        saveUsers(users);

        res.status(200).json(group);
      } else {
        res.status(404).json({ message: "Group or user not found" });
      }
    });
  },
};
