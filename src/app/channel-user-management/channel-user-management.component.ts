import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-channel-user-management',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './channel-user-management.component.html',
  styleUrl: './channel-user-management.component.css',
})
export class ChannelUserManagementComponent implements OnInit {
  @Input() selectedChannel: any;
  users: any[] = [];
  interestedUsers: any[] = [];

  constructor(
    private UserService: UserService,
    private ChannelService: ChannelService
  ) {}

  ngOnInit() {
    console.log('Selected channel', this.selectedChannel);
    this.loadUsers();
  }

  loadUsers() {
    this.UserService.getUsers().subscribe((users) => {
      this.users = users;
      this.matchUsers();
    });
  }

  matchUsers() {
    // Map pendingUsers with their full user objects (including id and username)
    this.interestedUsers = this.selectedChannel.pendingUsers.map(
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
    this.selectedChannel.users = this.selectedChannel.channelUsers.map(
      (userId: string) => {
        const user = this.users.find((user) => user.id === userId);
        return user
          ? {
              id: user.id,
              username: user.username,
              banned_channels: user.banned_channels || [], // Ensure banned_channels is always an array
            }
          : {
              id: userId,
              username: 'Unknown',
              banned_channels: [],
            };
      }
    );
  }

  // Approve a user to join a channel
  approveUser(user: any) {
    console.log(this.selectedChannel.id);
    this.ChannelService.approveUserForChannel(
      this.selectedChannel.id,
      user.id
    ).subscribe((response) => {
      console.log('approved users');
      const approvedUser = response.user;
      console.log(approvedUser);

      // Add the approved user to the selectedChannel.users array
      this.selectedChannel.users.push({
        id: approvedUser.id,
        username: approvedUser.username,
      });

      console.log(this.selectedChannel);

      // Remove the user from the interestedUsers array
      this.interestedUsers = this.interestedUsers.filter(
        (u) => u.id !== user.id
      );

      console.log('User approved and data updated for:', approvedUser);
    });
  }

  declineUser(user: any) {
    // Call the API route to decline the user
    this.ChannelService.declineUserForChannel(
      this.selectedChannel.id,
      user.id
    ).subscribe((response) => {
      const declinedUser = response.user;

      // Remove the user from pendingUsers on the frontend
      this.interestedUsers = this.interestedUsers.filter(
        (u) => u.id !== declinedUser.id
      );

      console.log('User declined and data updated for:', declinedUser);
    });
  }

  banUser(user: any) {
    // Call the API route to ban the user
    this.ChannelService.banUserFromChannel(
      this.selectedChannel.id,
      user.id
    ).subscribe((response) => {
      const bannedUser = response.user;

      // Remove the user from users and add to banned_users on the frontend
      this.selectedChannel.users = this.selectedChannel.users.filter(
        (u: any) => u.id !== bannedUser.id
      );
      this.selectedChannel.banned_users.push(bannedUser.id);

      console.log('User banned and data updated for:', bannedUser);
    });
  }
}
