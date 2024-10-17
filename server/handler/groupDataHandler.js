const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/group.json");

function loadGroups() {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return [];
}

function saveGroups(groups) {
  fs.writeFileSync(filePath, JSON.stringify(groups, null, 2));
}

module.exports = {
  loadGroups,
  saveGroups,
};
