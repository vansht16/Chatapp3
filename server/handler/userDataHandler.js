const fs = require("fs");
const path = require("path");

// Path to the users.json file
const filePath = path.join(__dirname, "../data/user.json");

// Load users from the JSON file
function loadUsers() {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return [];
}

// Save users to the JSON file
function saveUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");
}

module.exports = {
  loadUsers,
  saveUsers,
};
