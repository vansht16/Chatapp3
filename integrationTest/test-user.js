const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server/server.js");
const fs = require("fs");
const path = require("path");

const { expect } = chai;
chai.use(chaiHttp);

// Load the JSON data
const usersFilePath = path.join(__dirname, "../server/data/user.json");
const groupsFilePath = path.join(__dirname, "../server/data/group.json");

describe("Users API", function () {
  let users, groups;
  let user_id;

  // Load and reset the JSON files before each test
  beforeEach(() => {
    users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
    groups = JSON.parse(fs.readFileSync(groupsFilePath, "utf8"));
  });

  // Save back the JSON data after each test
  afterEach(() => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    fs.writeFileSync(groupsFilePath, JSON.stringify(groups, null, 2));
  });

  // Test for GET /api/users
  describe("/GET /api/users", () => {
    it("should return all users", async () => {
      const res = await chai.request(app).get("/api/users");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.equal(users.length);
    });
  });

  // Test for GET /api/users/:id
  describe("/GET /api/users/:id", () => {
    it("should return a user by their valid ID", async () => {
      const userId = users[0].id;
      const res = await chai.request(app).get(`/api/users/${userId}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("id").eql(userId);
    });

    it("should return 404 if the user is not found", async () => {
      const res = await chai.request(app).get(`/api/users/nonExistingId`);
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("User not found");
    });
  });

  // Test for POST /api/users
  describe("/POST /api/users", () => {
    it("should create a new user", async () => {
      const newUser = {
        id: "user-test",
        username: "TestUser",
        email: "test@example.com",
      };
      user_id = "user-test";

      const res = await chai.request(app).post("/api/users").send(newUser);
      expect(res).to.have.status(201);
      expect(res.body).to.have.property("id").eql(newUser.id);
    });

    it("should return 400 if the username already exists", async () => {
      const existingUser = users[0];
      const res = await chai
        .request(app)
        .post("/api/users")
        .send({ username: existingUser.username });
      expect(res).to.have.status(400);
      expect(res.body)
        .to.have.property("message")
        .eql("Username already exists. Please choose another one.");
    });
  });

  // Test for PUT /api/users/:id/role
  describe("/PUT /api/users/:id/role", () => {
    it("should update the role of a user", async () => {
      const newRole = "admin";

      const res = await chai
        .request(app)
        .put(`/api/users/${user_id}/role`)
        .send({ role: newRole });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("roles").that.includes(newRole);
    });

    it("should return 404 if the user is not found", async () => {
      const res = await chai
        .request(app)
        .put(`/api/users/nonExistingId/role`)
        .send({ role: "admin" });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("User not found");
    });
  });

  // Test for PUT /api/users/:id (file upload)
  describe("/PUT /api/users/:id (file upload)", () => {
    it("route path is accessible", async () => {
      const res = await chai
        .request(app)
        .put("/api/users/nonExistingId")
        .field("username", "UpdatedUser");

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("User not found");
    });
  });

  // Test for DELETE /api/users/:id
  describe("/DELETE /api/users/:id", () => {
    it("should delete a user by their ID", async () => {
      const res = await chai.request(app).delete(`/api/users/${user_id}`);
      expect(res).to.have.status(200);
      expect(res.body)
        .to.have.property("message")
        .eql("User deleted successfully");
    });

    it("should return 404 if the user is not found", async () => {
      const res = await chai.request(app).delete("/api/users/nonExistingId");
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("User not found");
    });
  });
});
