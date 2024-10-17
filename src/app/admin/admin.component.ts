import { Component, OnInit, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManegementComponent } from '../user-manegement/user-manegement.component';
import { GroupManagementComponent } from '../group-management/group-management.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    UserManegementComponent,
    GroupManagementComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  role: string | null = null;
  selectedSection: string = '';
  selectedGroup: any = null; // Placeholder for selected group
  selectedChannel: any = null; // Placeholder for selected channel
  selectedTab: string = 'channel_management'; // Default tab

  @ViewChild(GroupManagementComponent)
  groupManagementComponent!: GroupManagementComponent;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole(); // Get the user's role from the AuthService

    // Redirect Chat Users to the chat route
    if (this.role === 'Chat User') {
      this.router.navigate(['/chat']);
    } else if (this.role === 'Group Admin') {
      this.selectedSection = 'group_management';
    } else {
      this.selectedSection = 'user_management';
    }

    if (!this.role) {
      // Redirect to the login page
      this.router.navigate(['/login']);
      alert('You need to be logged in to see this page');
    }
  }

  selectSection(section: string) {
    this.selectedSection = section;
    this.selectedGroup = null;
    this.selectedChannel = null;

    if (
      this.selectedSection === 'group_management' &&
      this.groupManagementComponent
    ) {
      this.groupManagementComponent.loadGroups(); // Reload groups when section is selected
      this.groupManagementComponent.selectedGroup = null; // Reset selected group
    }
  }
}
