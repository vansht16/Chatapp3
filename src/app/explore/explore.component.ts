import { Component, OnInit } from '@angular/core';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { Group } from '../models/group.model';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent implements OnInit {
  groups: Group[] = [];
  currentUser: any;

  constructor(
    private GroupService: GroupService,
    private AuthService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.AuthService.getUserInfo();
    this.loadGroups();
    if (!this.currentUser) {
      // Redirect to the login page
      this.router.navigate(['/login']);
      alert('You need to be logged in to see this page');
    }
  }

  loadGroups() {
    this.GroupService.getGroups().subscribe((data) => {
      this.groups = data;
    });
  }

  // Method to handle interest registration
  registerInterest(groupId: string) {
    if (!this.currentUser) {
      alert('You need to be logged in to register interest in a group.');
      return;
    }

    this.GroupService.registerInterest(groupId, this.currentUser.id).subscribe(
      (response) => {
        alert('Interest registered successfully!');
        this.updateGroupPendingStatus(groupId);
        console.log(response);
      },
      (error) => {
        console.error('Error registering interest:', error);
        alert('Failed to register interest. Please try again.');
      }
    );
  }

  private updateGroupPendingStatus(groupId: string) {
    const group = this.groups.find((g) => g.id === groupId);
    if (group && !group.pendingUsers.includes(this.currentUser.id)) {
      group.pendingUsers.push(this.currentUser.id);
    }
  }

  // Helper method to check if the user is a member of the group
  isMemberOfGroup(group: Group): boolean {
    return group.users.includes(this.currentUser.id);
  }

  // Helper method to check if the user's request is pending
  isPendingInGroup(group: Group): boolean {
    return group.pendingUsers.includes(this.currentUser.id);
  }
}
