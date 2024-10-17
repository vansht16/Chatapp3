module.exports = {
  route: (app, users) => {
    app.post("/api/auth", (req, res) => {
      const { username, password } = req.body;

      // Check if both username and password are provided
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Missing username or password" });
      }

      // Find the user that matches the provided username and password
      const user = users.find(
        (user) => user.username === username && user.password === password
      );

      if (user) {
        // Send the user info back to the client (excluding the password)
        const { password, ...userInfo } = user;
        res.status(200).json({ userInfo });
      } else {
        // If user is not found, return valid: false
        res.status(401).json({ message: "Invalid credentials" });
      }
    });
  },
};
