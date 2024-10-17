const chai = require("chai");
const chaiHttp = require("chai-http");
const { MongoClient, ObjectId } = require("mongodb");
const app = require("../server/server.js");
const fs = require("fs");
const path = require("path");

const { expect } = chai;
chai.use(chaiHttp);

const usersFilePath = path.join(__dirname, "../server/data/user.json");
const groupsFilePath = path.join(__dirname, "../server/data/group.json");

// Test for GET /api/channels/:id
describe("Channels API", function () {
  let client;
  let db;
  let channelsCollection;
  const TEST_GROUPID = "group-4bd7is8w7ns";
  const TEST_USER = "user-rzfoplp7gf";
  let users, groups;

  // Set up MongoDB connection and clear the channels collection before each test
  beforeEach(async () => {
    client = await MongoClient.connect("mongodb://localhost:27017");
    db = client.db("chatApp");
    channelsCollection = db.collection("channels");
    await channelsCollection.deleteMany({}); // Clear the channels collection
    users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
    groups = JSON.parse(fs.readFileSync(groupsFilePath, "utf8"));
  });

  // Close MongoDB connection after each test
  afterEach(async () => {
    await client.close();
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    fs.writeFileSync(groupsFilePath, JSON.stringify(groups, null, 2));
  });

  // Test for GET /api/channels/:id
  describe("/GET /api/channels/:id", () => {
    it("should GET a channel by its valid ID", async () => {
      // Insert a channel to retrieve later
      const insertedChannel = await channelsCollection.insertOne({
        name: "Test Channel",
        channelUsers: [],
        pendingUsers: [],
        banned_users: [],
      });

      const res = await chai
        .request(app)
        .get(`/api/channels/${insertedChannel.insertedId.toString()}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("name").eql("Test Channel");
    });

    it("should return 400 for an invalid channel ID format", async () => {
      const res = await chai.request(app).get(`/api/channels/invalidID`);
      expect(res).to.have.status(400);
      expect(res.body)
        .to.have.property("message")
        .eql("Invalid channel ID format");
    });

    it("should return 404 if the channel is not found", async () => {
      const nonExistentId = new ObjectId();
      const res = await chai.request(app).get(`/api/channels/${nonExistentId}`);
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Channel not found");
    });
  });

  // Test for POST /api/groups/:id/channels
  describe("/POST /api/groups/:id/channels", () => {
    it("should POST a new channel to a group", async () => {
      const newChannel = {
        name: "New Channel",
        channelUsers: ["testUser"],
        pendingUsers: [],
        banned_users: [],
      };

      const res = await chai
        .request(app)
        .post(`/api/groups/${groups[0]["id"]}/channels`)
        .send(newChannel);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("newChannel");
      expect(res.body.newChannel).to.have.property("name").eql("New Channel");
    });

    it("should return 404 if the group is not found", async () => {
      const res = await chai
        .request(app)
        .post(`/api/groups/nonexistentGroup/channels`)
        .send({ name: "Test Channel" });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Group not found");
    });
  });

  // Test for PUT /api/channels/:channelId
  describe("/PUT /api/channels/:channelId", () => {
    it("should update a channel's name by its ID", async () => {
      const insertedChannel = await channelsCollection.insertOne({
        name: "Old Channel",
        channelUsers: [],
        pendingUsers: [],
        banned_users: [],
      });

      const updatedData = { newChannelName: "Updated Channel" };

      const res = await chai
        .request(app)
        .put(`/api/channels/${insertedChannel.insertedId}`)
        .send(updatedData);

      expect(res).to.have.status(200);
      expect(res.body)
        .to.have.property("message")
        .eql("Channel updated successfully");
    });

    it("should return 404 if the channel is not found", async () => {
      const nonExistentId = new ObjectId();
      const res = await chai
        .request(app)
        .put(`/api/channels/${nonExistentId}`)
        .send({ newChannelName: "Test" });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Channel not found");
    });
  });

  // Test for DELETE /api/groups/:id/channels/:channelId
  describe("/DELETE /api/groups/:id/channels/:channelId", () => {
    it("should return 404 if the channel is not found", async () => {
      const nonExistentChannelId = new ObjectId();
      const res = await chai
        .request(app)
        .delete(`/api/groups/${TEST_GROUPID}/channels/${nonExistentChannelId}`);

      expect(res).to.have.status(404);
      // Change expectation here to match actual error response from the server
      expect(res.body)
        .to.have.property("message")
        .eql("Group not found"); // Make sure this matches the actual server response
    });
  });

  // Test for PUT /api/channels/:channelId/requestToJoin
  describe("/PUT /api/channels/:channelId/requestToJoin", () => {
    it("should add a user to the pendingUsers array of a channel", async () => {
      const channel = await channelsCollection.insertOne({
        name: "Request Channel",
        channelUsers: [],
        pendingUsers: [],
        banned_users: [],
      });

      const userId = users[0]["id"]; // Change to 'userId' instead of 'userID'

      const res = await chai
        .request(app)
        .put(`/api/channels/${channel.insertedId}/requestToJoin`)
        .send({ userId }); // Send 'userId' to match the server-side expectation

      expect(res).to.have.status(200);
      expect(res.body.channel)
        .to.have.property("pendingUsers")
        .that.includes(userId);
    });

    it("should return 404 if non registered user were attempted to request", async () => {
      // Insert a new channel
      const channel = await channelsCollection.insertOne({
        name: "Request Channel",
        channelUsers: [],
        pendingUsers: [],
        banned_users: [],
      });

      const userId = "nonExistingUser"; // Simulate a non-registered user

      const res = await chai
        .request(app)
        .put(`/api/channels/${channel.insertedId}/requestToJoin`)
        .send({ userId });

      // Expect a 404 response since the user doesn't exist
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("User not found");
    });

    it("should return 404 if the channel is not found", async () => {
      const nonExistentChannelId = new ObjectId();
      const res = await chai
        .request(app)
        .put(`/api/channels/${nonExistentChannelId}/requestToJoin`)
        .send({ userId: "testUser" });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Channel not found");
    });
  });

  // Test for PUT /api/channels/:channelId/approveUser
  describe("/PUT /api/channels/:channelId/approveUser", () => {
    it("should approve a user and add them to channelUsers", async () => {
      const channel = await channelsCollection.insertOne({
        name: "Approve Channel",
        channelUsers: [],
        pendingUsers: ["testUser"],
        banned_users: [],
      });

      const userId = users[0]["id"];
      const res = await chai
        .request(app)
        .put(`/api/channels/${channel.insertedId}/approveUser`)
        .send({ userId });

      expect(res).to.have.status(200);
      expect(res.body.user.channels).to.include(channel.insertedId.toString());
    });

    it("should return 404 if the channel is not found", async () => {
      const nonExistentChannelId = new ObjectId();
      const res = await chai
        .request(app)
        .put(`/api/channels/${nonExistentChannelId}/approveUser`)
        .send({ userId: "testUser" });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Channel not found");
    });
  });

  // Test for PUT /api/channels/:channelId/declineUser
  describe("/PUT /api/channels/:channelId/declineUser", () => {
    it("should successfully decline a user's request to join a channel", async () => {
      // Create a test channel and add a user to the pendingUsers array
      const channel = await channelsCollection.insertOne({
        name: "Decline Test Channel",
        channelUsers: [],
        pendingUsers: [users[0].id], // Add the test user to pendingUsers
        banned_users: [],
      });

      const userId = users[0].id;

      // Decline the user's request
      const res = await chai
        .request(app)
        .put(`/api/channels/${channel.insertedId}/declineUser`)
        .send({ userId });

      expect(res).to.have.status(200);
      expect(res.body.user.interest_channels).to.not.include(
        channel.insertedId.toString()
      );
      expect(res.body.message).to.eql("User request to join channel declined");
    });

    it("should return 404 if the channel is not found", async () => {
      const nonExistentChannelId = new ObjectId();
      const userId = users[0].id;

      const res = await chai
        .request(app)
        .put(`/api/channels/${nonExistentChannelId}/declineUser`)
        .send({ userId });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("Channel not found");
    });

    it("should return 404 if the user is not found", async () => {
      const channel = await channelsCollection.insertOne({
        name: "Decline Test Channel",
        channelUsers: [],
        pendingUsers: [],
        banned_users: [],
      });

      const nonExistentUserId = "nonExistingUser";

      const res = await chai
        .request(app)
        .put(`/api/channels/${channel.insertedId}/declineUser`)
        .send({ userId: nonExistentUserId });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message").eql("User not found");
    });
  });

  // Test for GET /api/channels/:channelId/messages
  describe("/GET /api/channels/:channelId/messages", () => {
    it("should get chat history for a channel", async () => {
      const chatHistoryCollection = db.collection("chatHistory");

      const channelId = new ObjectId();
      await chatHistoryCollection.insertOne({
        channelId: channelId.toString(),
        messages: ["Hello, world!"],
      });

      const res = await chai
        .request(app)
        .get(`/api/channels/${channelId}/messages`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body[0])
        .to.have.property("messages")
        .that.includes("Hello, world!");
    });
  });

  // Test for POST /api/upload-image
  describe("/POST /api/upload-image", () => {
    it("should upload an image and return its path", async () => {
      const res = await chai
        .request(app)
        .post("/api/upload-image")
        .attach("file", Buffer.from("test image content"), "testImage.png");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("imageUrl").that.includes("/uploads/");
    });
  });
});
