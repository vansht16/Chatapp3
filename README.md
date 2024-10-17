# Application Overview

**Vansh Tyagi(s5304286)**

## 1. Version Control Strategy

### 1.1 Repository Structure

- **Production Branch:**  
  This branch holds the most stable version of the application. It contains thoroughly tested and bug-free code. Changes are pushed to this branch only after successful testing.

- **Feature-Specific Branches:**  
  For every key feature (like login, chat, profile), a new branch is created. This keeps the development process modular and ensures that features are developed in isolation. Branch names include `feature-login`, `feature-profile`, and `feature-chat`.

- **Experimental Branch:**  
  This branch was created to integrate MongoDB and Socket.io for real-time communication. The feature was kept separate in this branch until tested and merged into the main branch.

### 1.2 Update Cycle

- **Commits:**  
  Changes are committed frequently to feature branches, capturing each major update like component creation, bug fixing, or backend updates.

- **Merging:**  
  Once features are developed and tested, branches are merged back into the production branch.

---

## 2. Database Structure

### 2.1 User Schema

The user schema includes details about the user and the groups they belong to. Each user is associated with a unique ID.

- **id:** Unique string identifier  
- **username:** The user's display name  
- **email:** Email address for communication  
- **password:** Encrypted password  
- **roles:** Defines the role (e.g., "Admin" or "User")  
- **groups:** List of group IDs the user is part of  

### 2.2 Group Schema

The group schema captures all necessary data related to each group.

- **id:** Unique group ID  
- **groupname:** Name of the group  
- **adminId:** Admin user ID for the group  
- **users:** List of user IDs belonging to the group  

### 2.3 Channel Schema

The channel schema represents a group communication channel.

- **id:** Channel ID  
- **name:** Name of the communication channel  
- **users:** List of users connected to the channel  

---

## 3. Frontend Structure (Angular)

### 3.1 Components Breakdown

Angular components are key to organizing the frontend of this Single Page Application. Each component is responsible for a section of the interface:

- **Login Component:** Manages user authentication.  
- **Chat Component:** Displays chat messages in real-time using socket communication.  
- **Profile Component:** Allows users to manage their personal profiles.  
- **Admin Component:** Provides admin-specific functionalities.  

### 3.2 Shared Services

Angular services provide shared functionalities across components:

- **AuthService:** Handles login/logout and session management.  
- **UserService:** Manages user-related activities, like fetching and updating user data.  
- **GroupService:** Facilitates group management, including joining/leaving groups and managing members.  

### 3.3 Routing Setup

Routing is defined in `app.routes.ts`, where the root route is redirected to `/login`. Other routes include paths for chat, profile, and admin functionalities, ensuring users have restricted access based on their role.

---

## 4. Backend Logic (Node.js)

### 4.1 Key Libraries

- **Express:** Provides the core framework for building the server-side REST API.  
- **Cors:** Enables cross-origin resource sharing, allowing the frontend to communicate with the backend.  
- **MongoDB:** Handles data storage, using collections for users, groups, and channels.

### 4.2 Core Functions

- **loadUsers():** Fetches user data from `user.json`.  
- **saveUsers(users):** Updates user data in the `user.json` file.  
- **loadGroups():** Retrieves group data from `group.json`.  
- **saveGroups(groups):** Saves the updated group data.

### 4.3 File Structure

- **server.js:** Main server file, handling requests and connecting with MongoDB.  
- **routes/user.js:** Manages user-related API requests like profile updates and user authentication.  
- **routes/group.js:** Handles group operations, including group creation and membership management.  

---

## 5. API Endpoints

### 5.1 User Endpoints

- **GET /api/users:** Returns a list of all users.  
- **PUT /api/users/:id:** Updates a user's profile.  
- **POST /api/users:** Creates a new user.  
- **DELETE /api/users/:id:** Deletes a user from the system.  

### 5.2 Group Endpoints

- **GET /api/groups:** Retrieves all groups.  
- **POST /api/groups:** Creates a new group.  
- **PUT /api/groups/:id:** Updates a group by its ID.  

### 5.3 Channel Endpoints

- **POST /api/groups/:id/channels:** Adds a channel to a group.  
- **GET /api/channels/:id:** Retrieves the details of a channel.  
- **PUT /api/channels/:id:** Updates channel information.  

---

## 6. Setup & Installation Instructions

### 6.1 Prerequisites

Ensure you have the following installed on your system before proceeding:

- **Node.js**  
- **npm**  
- **MongoDB**

### 6.2 Steps to Set Up the Project

1. **Clone the Repository:**  
   ```bash
   git clone https://github.com/your-repository.git
   cd your-repository
   ```

2. **Install Dependencies:**  
   Navigate to both frontend and backend directories, and run:  
   ```bash
   npm install
   ```

3. **Start MongoDB:**  
   Ensure MongoDB is running:  
   ```bash
   mongod
   ```

4. **Start Backend Server:**  
   From the backend directory:  
   ```bash
   npm start
   ```

5. **Run Frontend Application:**  
   From the frontend directory, run:  
   ```bash
   ng serve
   ```

6. **Access the Application:**  
   Visit `http://localhost:4200` to view the app and make sure the server runs on `http://localhost:3000`.  

---

## 7. Client-Server Interaction

The Angular frontend interacts with the Node.js backend using RESTful APIs. Data is sent and received in JSON format, with the backend processing client requests and sending responses accordingly.

---

## 8. Testing

### 8.1 Backend Testing

To run tests for the backend, execute the following commands:

```bash
npm run test-backend
```

### 8.2 Frontend Testing

To run tests for the Angular frontend, use the command:

```bash
ng test