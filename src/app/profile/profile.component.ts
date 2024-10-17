import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { GroupService } from '../services/group.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any | null = null;
  username: string = '';
  email: string = '';
  role: string = '';
  isEditing: boolean = false;
  groups: any[] = [];
  profilePicture: File | null = null; // File to store the uploaded image
  profilePictureUrl: string = ''; // For preview or current image URL
  private originalUsername: string = '';
  private originalEmail: string = '';
  private originalProfilePictureUrl: string = ''; // Store original profile picture URL
  private BASE_URL = 'http://localhost:3000/images/';

  constructor(
    private AuthService: AuthService,
    private groupService: GroupService,
    private UserService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.AuthService.getUserInfo();
    console.log(this.user);

    if (this.user != null) {
      this.username = this.user.username;
      this.email = this.user.email;
      this.role = this.user.roles;
      // Set profile picture URL, assuming it's served from your backend
      this.profilePictureUrl =
        `${this.BASE_URL}${this.user.profile_img_path}` || '';

      // Store original values for comparison
      this.originalUsername = this.username;
      this.originalEmail = this.email;
      this.originalProfilePictureUrl = this.profilePictureUrl;

      this.user.groups.forEach((groupId: string) => {
        this.groupService.getGroupById(groupId).subscribe((group) => {
          this.groups.push(group); // Add group to the list
        });
      });
    }

    if (!this.user) {
      this.router.navigate(['/login']);
      alert('You need to be logged in to see this page');
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.saveProfile();
    }
  }

  onFileSelected(event: any) {
    this.profilePicture = event.target.files[0]; // Store the selected file
    if (this.profilePicture) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result; // For image preview
      };
      reader.readAsDataURL(this.profilePicture);
    }
  }

  validateProfileInput(): boolean {
    if (!this.username) {
      alert('Username are required.');
      return false;
    }

    // Check for username uniqueness
    let isValid = true;
    this.UserService.getUsers().subscribe((users) => {
      const existingUser = users.find(
        (u) => u.username === this.username && u.id !== this.user.id
      );
      console.log(existingUser);
      if (existingUser) {
        alert('Username already exists. Please choose a different one.');
        isValid = false;
      }
    });

    return isValid;
  }

  saveProfile() {
    if (!this.validateProfileInput()) {
      this.resetProfileFields();
      return; // If validation fails, return early
    }

    // Check if the username, email, or profile picture has changed
    const isUsernameChanged = this.username !== this.originalUsername;
    const isEmailChanged = this.email !== this.originalEmail;
    const isProfilePictureChanged =
      this.profilePictureUrl !== this.originalProfilePictureUrl;

    if (!isUsernameChanged && !isEmailChanged && !isProfilePictureChanged) {
      // No changes, close the edit mode
      this.isEditing = false;
      return;
    }

    if (confirm('Are you sure you want to save the changes to your profile?')) {
      const formData = new FormData();
      formData.append('username', this.username);
      formData.append('email', this.email);

      if (isProfilePictureChanged && this.profilePicture) {
        formData.append('profilePicture', this.profilePicture); // Add the profile picture to form data
      }

      this.UserService.updateUserProfileWithImage(
        this.user.id,
        formData
      ).subscribe(
        (updatedUser) => {
          alert('Profile updated successfully.');
          this.user = updatedUser;
          this.AuthService.updateUserInfo(this.user); // Update the user info in local storage
          this.profilePictureUrl = `${this.BASE_URL}${updatedUser.profile_img_path}`; // Update the profile image URL with the new path
          this.isEditing = false; // Close edit mode
        },
        (error) => {
          console.error('Error updating profile:', error);
          alert('Failed to update profile. Please try again.');
        }
      );
    }
  }

  leaveGroup(groupId: string) {
    if (confirm('Are you sure you want to leave this group?')) {
      this.groupService.getGroupById(groupId).subscribe((group) => {
        const isAdmin = group.adminId === this.user.id;

        this.groupService.removeUserFromGroup(groupId, this.user.id).subscribe(
          () => {
            if (isAdmin) {
              this.groupService.updateGroupAdminToSuper(groupId).subscribe(
                () => {
                  console.log('Group adminId updated to "super".');
                },
                (error) => {
                  console.error('Error updating group adminId:', error);
                }
              );
            }

            alert('You have left the group.');
            this.groups = this.groups.filter((group) => group.id !== groupId);
            this.user.groups = this.user.groups.filter(
              (id: string) => id !== groupId
            );
            this.AuthService.updateUserInfo(this.user); // Update local user info
          },
          (error) => {
            console.error('Error leaving group:', error);
            alert('Failed to leave the group. Please try again.');
          }
        );
      });
    }
  }

  deleteAccount() {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      this.UserService.deleteUser(this.user.id).subscribe(
        () => {
          alert('Account deleted successfully.');
          this.AuthService.logout();
        },
        (error) => {
          console.error('Error deleting account:', error);
          alert('Failed to delete account. Please try again.');
        }
      );
    }
  }

  private resetProfileFields() {
    this.username = this.originalUsername;
    this.email = this.originalEmail;
    this.profilePictureUrl = this.originalProfilePictureUrl;
  }
}
