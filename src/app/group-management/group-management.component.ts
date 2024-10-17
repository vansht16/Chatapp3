import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../services/group.service';
import { GroupDetailComponent } from '../group-detail/group-detail.component';
import { Group } from '../models/group.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, GroupDetailComponent],
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.css'],
})
export class GroupManagementComponent implements OnInit {
  @ViewChild('groupNameInput', { static: false }) groupNameInput!: ElementRef;

  selectedGroup: any = null; // Placeholder for selected group
  searchQuery: string = ''; // To hold the search input
  addingGroup: boolean = false; // State for whether a new group is being added
  newGroupName: string = ''; // Holds the new group name

  groups: any[] = []; // Array to store groups
  current_user_id: any = '';

  constructor(
    private GroupService: GroupService,
    private AuthService: AuthService
  ) {}

  ngOnInit(): void {
    this.AuthService.checkLoginAndRedirect();
    this.current_user_id = this.AuthService.getUserID();
    this.loadGroups();
    console.log(this.current_user_id);
  }

  // Load groups from the service
  loadGroups() {
    if (this.AuthService.getUserRole() === 'Super Admin') {
      // If the current user is a Super Admin, get all groups where adminId is either the user's ID or "super"
      this.GroupService.getGroupsForSuperAdmin(this.current_user_id).subscribe(
        (data) => {
          this.groups = data;
        }
      );
    } else {
      // Otherwise, just get the groups where the current user is the admin
      this.GroupService.getGroups(this.current_user_id).subscribe((data) => {
        this.groups = data;
      });
    }
  }

  // Filtering the groups based on search input
  get filteredGroups() {
    if (!this.searchQuery) {
      return this.groups;
    }
    return this.groups.filter((group) =>
      group.groupname.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Search Method
  updateSearchQuery(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    console.log(this.searchQuery);
  }

  // Group Management
  selectGroup(group: any) {
    this.selectedGroup = group;
  }

  deleteGroup(group: any) {
    this.GroupService.deleteGroup(group.id, this.current_user_id).subscribe(
      () => {
        console.log('Group deleted:', group);
        this.loadGroups(); // Reload the group list after deletion
      }
    );
  }

  // Adding Group
  saveGroup() {
    if (this.newGroupName.trim()) {
      const newGroup: Group = {
        id: 'group-' + Math.random().toString(36).substring(2, 15), // Generate a random ID
        groupname: this.newGroupName.trim(),
        adminId: this.current_user_id,
        channels: [],
        users: [this.current_user_id],
        pendingUsers: [],
        reported_users: [],
      };
      this.GroupService.addGroup(newGroup).subscribe((group) => {
        console.log('New group added:', group);
        this.loadGroups(); // Reload the group list after adding
        this.newGroupName = '';
        this.addingGroup = false;
        const currentUser = this.AuthService.getUserInfo();
        if (currentUser) {
          currentUser.groups.push(group.id);
          this.AuthService.updateUserInfo(currentUser);
        }
      });
    }
  }

  cancelGroup() {
    this.newGroupName = '';
    this.addingGroup = false;
  }

  startAddingGroup() {
    this.addingGroup = true;
    setTimeout(() => {
      if (this.groupNameInput) {
        this.groupNameInput.nativeElement.focus();
      }
    }, 0);
  }

  // Focus on the input field when clicking the list item
  focusInputField(event: MouseEvent) {
    if (this.groupNameInput) {
      this.groupNameInput.nativeElement.focus();
    }
  }
}
