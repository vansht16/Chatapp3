import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-manegement',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './user-manegement.component.html',
  styleUrl: './user-manegement.component.css',
})
export class UserManegementComponent implements OnInit {
  searchQuery: string = ''; // To hold the search input
  users: User[] = [];
  roleChanges: { [userId: string]: string } = {}; // To track role changes
  currentUserId: string | null = null;

  constructor(
    private UserService: UserService,
    private AuthService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.currentUserId = this.AuthService.getUserID();
  }

  // Load users from the service
  loadUsers() {
    this.UserService.getUsers().subscribe((data) => {
      this.users = data;
      console.log('Loading user in ', this.users);
    });
  }

  // Filtered users based on search query
  get filteredUsers() {
    if (!this.searchQuery) {
      return this.users;
    }
    return this.users.filter(
      (user) =>
        user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.roles.some((role: string) =>
          role.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
    );
  }

  // Handle role change
  onRoleChange(userId: string, event: Event) {
    const selectedRole = (event.target as HTMLSelectElement).value;
    this.roleChanges[userId] = selectedRole; // Track the changed role
  }

  // Save the role changes after confirmation
  saveChanges() {
    if (Object.keys(this.roleChanges).length > 0) {
      if (confirm('Are you sure you want to change the user roles?')) {
        for (const userId in this.roleChanges) {
          const newRole = this.roleChanges[userId];
          this.UserService.updateUserRole(userId, newRole).subscribe(
            (updatedUser) => {
              console.log(
                `User role updated: ${updatedUser.username} to ${newRole}`
              );
              // Update the user role locally
              const user = this.users.find((u) => u.id === userId);
              if (user) {
                user.roles = [newRole];
              }
            },
            (error) => {
              console.error(`Failed to update user role for ${userId}:`, error);
            }
          );
        }
        this.roleChanges = {}; // Clear the changes after saving
      }
    } else {
      alert('No changes made.');
    }
  }

  // Handle user deletion
  deleteUser(userId: string) {
    if (userId === this.currentUserId) {
      alert('You cannot delete yourself.');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      this.UserService.deleteUser(userId).subscribe(
        () => {
          console.log(`User with ID ${userId} deleted`);
          this.users = this.users.filter((user) => user.id !== userId); // Remove the user from the local array
        },
        (error) => {
          console.error(`Failed to delete user ${userId}:`, error);
        }
      );
    }
  }

  // Search Method
  updateSearchQuery(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    console.log(this.searchQuery);
  }
}
