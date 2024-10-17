import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { NgClass } from '@angular/common';
import { GroupService } from '../services/group.service';

@Component({
  selector: 'app-group-user-management',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, NgClass],
  templateUrl: './group-user-management.component.html',
  styleUrls: ['./group-user-management.component.css'],
})
export class GroupUserManagementComponent implements OnInit {
  @Input() selectedGroup: any; // Receive selectedGroup from parent component

  users: any[] = [];
  interestedUsers: any[] = [];
  selectedUser: any; // The user being banned
  selectedChannel: string = 'Select Channel to Ban';

  constructor(
    private userService: UserService,
    private groupService: GroupService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      this.matchUsers();
    });
  }

  matchUsers() {
    // Map pendingUsers with their full user objects (including id and username)
    this.interestedUsers = this.selectedGroup.pendingUsers.map(
      (userId: string) => {
        const user = this.users.find((user) => user.id === userId);
        return user
          ? {
              id: user.id,
              username: user.username,
            }
          : { id: userId, username: 'Unknown' };
      }
    );

    // Map users with their full user objects (including id and username)
    this.selectedGroup.users = this.selectedGroup.users.map(
      (userId: string) => {
        const user = this.users.find((user) => user.id === userId);
        return user
          ? {
              id: user.id,
              username: user.username,
              banned_channels: user.banned_channels || [], // Ensure banned_channels is always an array
              isReported: this.selectedGroup.reported_users.includes(user.id), // Check if the user has been reported
            }
          : {
              id: userId,
              username: 'Unknown',
              banned_channels: [],
              isReported: false,
            };
      }
    );

    console.log('this.interestedUsers', this.interestedUsers);
    console.log('this.selectedGroup', this.selectedGroup);
  }

  approveInterest(group: any, interest: any) {
    this.groupService
      .approveInterest(group.id, interest.id)
      .subscribe((updatedGroup) => {
        this.selectedGroup = updatedGroup;
        this.matchUsers();
      });
  }

  declineInterest(group: any, interest: any) {
    this.groupService
      .declineInterest(group.id, interest.id)
      .subscribe((updatedGroup) => {
        this.selectedGroup = updatedGroup;
        this.matchUsers();
      });
  }

  removeUserFromGroup(group: any, user: any): void {
    if (
      confirm(
        `Are you sure you want to remove ${user.username} from ${group.groupname}?`
      )
    ) {
      this.groupService.removeUserFromGroup(group.id, user.id).subscribe(
        (updatedGroup) => {
          console.log('User removed from group:', updatedGroup);

          // Update the selectedGroup with the new data
          this.selectedGroup = { ...updatedGroup };

          // Refresh the list of users
          this.matchUsers();
        },
        (error) => {
          console.error('Error removing user from group:', error);
        }
      );
    }
  }

  reportToSuperAdmin(group: any, user: any): void {
    if (
      confirm(
        `Are you sure you want to report ${user.username} to the Super Admin?`
      )
    ) {
      this.groupService.reportUserToSuperAdmin(group.id, user.id).subscribe(
        (updatedGroup) => {
          console.log('User reported to Super Admin:', updatedGroup);

          this.selectedGroup = { ...updatedGroup };

          this.matchUsers();

          // Optionally, you might want to update the UI or show a success message
          alert(`${user.username} has been reported to the Super Admin.`);
        },
        (error) => {
          console.error('Error reporting user to Super Admin:', error);
          alert(`Failed to report ${user.username} to the Super Admin.`);
        }
      );
    }
  }

  // Update the selected channel from the select element
  onChannelSelect(event: Event) {
    const target = event.target as HTMLSelectElement; // Cast EventTarget to HTMLSelectElement
    this.selectedChannel = target.value;
  }
}
