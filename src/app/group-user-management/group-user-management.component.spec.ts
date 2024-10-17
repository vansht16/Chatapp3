// Import necessary testing modules and services
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupUserManagementComponent } from './group-user-management.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '../services/user.service';
import { GroupService } from '../services/group.service';
import { of } from 'rxjs';
import { User } from '../models/user.model';

// Test suite for GroupUserManagementComponent
describe('GroupUserManagementComponent', () => {
  let component: GroupUserManagementComponent;
  let fixture: ComponentFixture<GroupUserManagementComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockGroupService: jasmine.SpyObj<GroupService>;

  // Set up mock services and test environment before each test
  beforeEach(async () => {
    // Create mock services using jasmine spies
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockGroupService = jasmine.createSpyObj('GroupService', [
      'approveInterest',
      'declineInterest',
      'removeUserFromGroup',
      'reportUserToSuperAdmin',
    ]);

    // Configure the testing module and create the component
    await TestBed.configureTestingModule({
      imports: [GroupUserManagementComponent, HttpClientTestingModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: GroupService, useValue: mockGroupService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupUserManagementComponent);
    component = fixture.componentInstance;

    // Mock selected group data for the component
    component.selectedGroup = {
      id: 'group1',
      groupname: 'Test Group',
      users: ['user1', 'user2'],
      pendingUsers: ['user3'],
      reported_users: ['user1'],
    };

    // Mock user data for testing
    const mockUsers: User[] = [
      {
        id: 'user1',
        username: 'User 1',
        email: 'user1@example.com',
        password: 'password1',
        profile_img_path: 'path/to/image1.jpg',
        roles: ['Chat_user'],
        groups: [],
        interest_groups: [],
        channels: [],
        interest_channels: [],
        banned_channels: [],
        reported_in_groups: [],
      },
      {
        id: 'user2',
        username: 'User 2',
        email: 'user2@example.com',
        password: 'password2',
        profile_img_path: 'path/to/image2.jpg',
        roles: ['Chat_user'],
        groups: [],
        interest_groups: [],
        channels: [],
        interest_channels: [],
        banned_channels: [],
        reported_in_groups: [],
      },
      {
        id: 'user3',
        username: 'User 3',
        email: 'user3@example.com',
        password: 'password3',
        profile_img_path: 'path/to/image3.jpg',
        roles: ['Chat_user'],
        groups: [],
        interest_groups: [],
        channels: [],
        interest_channels: [],
        banned_channels: [],
        reported_in_groups: [],
      },
    ];

    // Mock the getUsers method to return the mock users
    mockUserService.getUsers.and.returnValue(of(mockUsers));

    fixture.detectChanges();
  });

  // Test that users are correctly loaded and matched with the selected group
  it('should load users and match them with selected group', () => {
    component.loadUsers(); // Simulate loading users
    expect(mockUserService.getUsers).toHaveBeenCalled(); // Ensure getUsers was called
    expect(component.selectedGroup.users.length).toBe(2); // Verify that the correct number of users are loaded for the group
  });

  // Test approving a user and updating the group
  it('should approve a user and update the group', () => {
    const updatedGroup = { ...component.selectedGroup, pendingUsers: [] }; // Simulate updated group data after approval
    mockGroupService.approveInterest.and.returnValue(of(updatedGroup)); // Mock the approveInterest method

    component.approveInterest(component.selectedGroup, { id: 'user3' }); // Simulate approving a user

    expect(mockGroupService.approveInterest).toHaveBeenCalledWith(
      'group1',
      'user3'
    ); // Ensure the service method was called
    expect(component.selectedGroup.pendingUsers.length).toBe(0); // Verify that the user is no longer pending
  });

  // Test declining a user and updating the group
  it('should decline a user and update the group', () => {
    const updatedGroup = { ...component.selectedGroup, pendingUsers: [] }; // Simulate updated group data after declining
    mockGroupService.declineInterest.and.returnValue(of(updatedGroup)); // Mock the declineInterest method

    component.declineInterest(component.selectedGroup, { id: 'user3' }); // Simulate declining a user

    expect(mockGroupService.declineInterest).toHaveBeenCalledWith(
      'group1',
      'user3'
    ); // Ensure the service method was called
    expect(component.selectedGroup.pendingUsers.length).toBe(0); // Verify that the user is no longer pending
  });

  // Test removing a user from the group
  it('should remove a user from the group', () => {
    const updatedGroup = { ...component.selectedGroup, users: ['user2'] }; // Simulate updated group data after removing a user
    mockGroupService.removeUserFromGroup.and.returnValue(of(updatedGroup)); // Mock the removeUserFromGroup method

    component.removeUserFromGroup(component.selectedGroup, {
      id: 'user1',
      username: 'User 1',
    }); // Simulate removing a user

    expect(mockGroupService.removeUserFromGroup).toHaveBeenCalledWith(
      'group1',
      'user1'
    ); // Ensure the service method was called
    expect(component.selectedGroup.users.length).toBe(1); // Verify that the user was removed
  });

  // Test reporting a user to the super admin
  it('should report a user to the super admin', () => {
    const updatedGroup = {
      ...component.selectedGroup,
      reported_users: ['user1', 'user2'],
    }; // Simulate updated group data after reporting a user
    mockGroupService.reportUserToSuperAdmin.and.returnValue(of(updatedGroup)); // Mock the reportUserToSuperAdmin method

    component.reportToSuperAdmin(component.selectedGroup, {
      id: 'user2',
      username: 'User 2',
    }); // Simulate reporting a user

    expect(mockGroupService.reportUserToSuperAdmin).toHaveBeenCalledWith(
      'group1',
      'user2'
    ); // Ensure the service method was called
    expect(component.selectedGroup.reported_users.length).toBe(2); // Verify that the user was added to the reported users list
  });
});
