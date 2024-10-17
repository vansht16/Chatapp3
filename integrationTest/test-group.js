const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server/server.js");
const fs = require("fs");
const path = require("path");

const { expect } = chai;
chai.use(chaiHttp);
const {
  loadGroups,
  saveGroups,
} = require("../server/handler/groupDataHandler");
const { loadUsers, saveUsers } = require("../server/handler/userDataHandler");

// Load the JSON data
const usersFilePath = path.join(__dirname, "../server/data/user.json");
const groupsFilePath = path.join(__dirname, "../server/data/group.json");

describe("Groups API", function () {
  let users, groups;
  let group_id;
  let admin_id;
  let user;

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

  // Test for GET /api/groups
  describe("/GET /api/groups", () => {
    it("should return all groups", async () => {
      const res = await chai.request(app).get("/api/groups");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.equal(groups.length);
    });

    it("should filter groups by adminId", async () => {
      const adminId = users[0].id;
      const res = await chai.request(app).get(`/api/groups?adminId=${adminId}`);
      const filteredGroups = groups.filter(
        (group) => group.adminId === adminId
      );
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.equal(filteredGroups.length);
    });
  });

  // Test for GET /api/groups/:id
  describe("/GET /api/groups/:id", () => {
    it("should return a group by its valid ID", async () => {
      const groupId = groups[0].id;
      const res = await chai.request(app).get(`/api/groups/${groupId}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("id").eql(groupId);
    });

    it("should return 404 if the group is not found", async () => {
      const res = await chai.request(app).get(`/api/groups/nonExistingId`);
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Group not found");
    });
  });

  // Test for POST /api/groups
  describe("/POST /api/groups", () => {
    it("should create a new group", async () => {
      const newGroup = {
        id: "group-test",
        groupname: "Test Group",
        adminId: "test",
        users: [],
        pendingUsers: [],
      };

      group_id = newGroup.id;
      admin_id = newGroup.adminId;

      const res = await chai.request(app).post("/api/groups").send(newGroup);
      expect(res).to.have.status(201);
      expect(res.body).to.have.property("id").eql(newGroup.id);
    });
  });

  // Test for PUT /api/groups/:id/name
  describe("/PUT /api/groups/:id/name", () => {
    it("should update a group's name", async () => {
      const newGroupName = "Updated Group Name";

      const res = await chai
        .request(app)
        .put(`/api/groups/${group_id}/name`)
        .send({ newGroupName });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("groupname").eql(newGroupName);
    });

    it("should return 404 if the group is not found", async () => {
      const res = await chai
        .request(app)
        .put(`/api/groups/nonExistingId/name`)
        .send({ newGroupName: "New Group Name" });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Group not found");
    });
  });

  // Test for PUT /api/groups/:id/register-interest
  describe("/PUT /api/groups/:id/register-interest", () => {
    it("route path is accessible", async () => {
      const res = await chai
        .request(app)
        .put(`/api/groups/nonExistingId/register-interest`)
        .send({ userId: users[1].id });

      expect(res).to.have.status(404);
      expect(res.body)
        .to.have.property("message")
        .eql("Group or user not found");
    });
  });

  // Test for PUT /api/groups/:id/approve
  describe("/PUT /api/groups/:id/approve", () => {
    it("route path is accessible", async () => {
      const res = await chai
        .request(app)
        .put(`/api/groups/nonExistingId/approve`)
        .send({ userId: "nonExistingUser" });
      expect(res).to.have.status(404);
      expect(res.body)
        .to.have.property("message")
        .eql("Group or user not found");
    });
  });

  // Test for PUT /api/groups/:id/admin-to-super
  describe("/PUT /api/groups/:id/admin-to-super", () => {
    it("route path is accessible'", async () => {
      const res = await chai
        .request(app)
        .put(`/api/groups/nonExistingId/admin-to-super`);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Group not found");
    });
  });

  // Test for PUT /api/groups/:id/decline
  describe("/PUT /api/groups/:id/decline", () => {
    it("route path is accessible", async () => {
      const res = await chai
        .request(app)
        .put(`/api/groups/nonExistingGroup/decline`)
        .send({ userId: "testing" });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Group not found");
    });
  });

  // Test for PUT /api/groups/:id/remove
  describe("/PUT /api/groups/:id/remove", () => {
    it("should remove a user from a group", async () => {
      const userId = users[0].id;

      const res = await chai
        .request(app)
        .put(`/api/groups/${group_id}/remove`)
        .send({ userId });

      expect(res).to.have.status(200);
    });

    it("should return 404 if group or user is not found", async () => {
      const res = await chai
        .request(app)
        .put(`/api/groups/nonExistingId/remove`)
        .send({ userId: users[1].id });

      expect(res).to.have.status(404);
      expect(res.body)
        .to.have.property("message")
        .eql("Group or user not found");
    });
  });

  // Test for PUT /api/groups/:id/report
  describe("/PUT /api/groups/:id/report", () => {
    it("route path is accessible", async () => {
      const res = await chai
        .request(app)
        .put(`/api/groups/nonExistingId/report`)
        .send({ userId: users[1].id });

      expect(res).to.have.status(404);
      expect(res.body)
        .to.have.property("message")
        .eql("Group or user not found");
    });
  });

  // Test for DELETE /api/groups/:id
  describe("/DELETE /api/groups/:id", () => {
    it("should delete a group by its ID", async () => {
      const res = await chai
        .request(app)
        .delete(`/api/groups/${group_id}?adminId=${admin_id}`);

      expect(res).to.have.status(204);
    });

    it("should return 403 if the user is not the admin", async () => {
      const groupId = groups[0].id;
      const wrongAdminId = "wrong-admin-id";

      const res = await chai
        .request(app)
        .delete(`/api/groups/${groupId}?adminId=${wrongAdminId}`);

      expect(res).to.have.status(403);
      expect(res.body)
        .to.have.property("message")
        .eql("Forbidden: You don't have permission to delete this group.");
    });
  });
});
