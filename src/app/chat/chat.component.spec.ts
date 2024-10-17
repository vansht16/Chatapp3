import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ChannelService } from '../services/channel.service';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';
import { ElementRef } from '@angular/core';

// The `describe` block defines the test suite for ChatComponent
describe('ChatComponent', () => {
  // Declare variables for the component and fixture (a wrapper around the component for testing)
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let mockGroupService: jasmine.SpyObj<GroupService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  // This `beforeEach` function sets up the component and its environment before each test runs
  beforeEach(async () => {
    // Create mock versions of the GroupService and AuthService for testing
    mockGroupService = jasmine.createSpyObj('GroupService', ['getGroups']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserInfo']);

    // Mock data that simulates the behavior of GroupService and AuthService
    const mockGroups: Group[] = [
      {
        id: 'group1',
        groupname: 'Group 1',
        adminId: 'admin1',
        users: ['user1'],
        channels: ['channel1'],
        pendingUsers: [],
        reported_users: [],
      },
    ];
    mockGroupService.getGroups.and.returnValue(of(mockGroups)); // Mock response for getting groups

    const mockUser: User = {
      id: 'user1',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      profile_img_path: '',
      roles: ['Chat_user'],
      groups: [],
      interest_groups: [],
      channels: [],
      interest_channels: [],
      banned_channels: [],
      reported_in_groups: [],
    };
    mockAuthService.getUserInfo.and.returnValue(mockUser); // Mock response for getting user info

    // Configure the testing module, declaring the component and injecting the mock services
    await TestBed.configureTestingModule({
      imports: [ChatComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: GroupService, useValue: mockGroupService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    // Create the component instance for testing
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
  });

  // A simple test to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Verify that the component is created
  });

  // Test to check if groups are loaded correctly when the component initializes
  it('should load groups on init', () => {
    component.ngOnInit(); // Call the ngOnInit method to trigger component initialization

    // Verify that the correct methods were called and the data was loaded as expected
    expect(mockAuthService.getUserInfo).toHaveBeenCalled(); // Ensure user info was retrieved
    expect(mockGroupService.getGroups).toHaveBeenCalled(); // Ensure groups were retrieved
    expect(component.groups.length).toBe(1); // Verify that one group was loaded
    expect(component.groups[0].groupname).toBe('Group 1'); // Check if the group name matches the expected value
  });
});
