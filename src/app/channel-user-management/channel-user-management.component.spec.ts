import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChannelUserManagementComponent } from './channel-user-management.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '../services/user.service';
import { ChannelService } from '../services/channel.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { User } from '../models/user.model';

describe('ChannelUserManagementComponent', () => {
  let component: ChannelUserManagementComponent;
  let fixture: ComponentFixture<ChannelUserManagementComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockChannelService: jasmine.SpyObj<ChannelService>;

  beforeEach(async () => {
    // Create spy objects for the services using jasmine's createSpyObj
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockChannelService = jasmine.createSpyObj('ChannelService', [
      'approveUserForChannel',
      'declineUserForChannel',
      'banUserFromChannel',
    ]);

    // Configure the TestBed with the necessary modules and services
    await TestBed.configureTestingModule({
      imports: [
        ChannelUserManagementComponent, // Import the standalone component
        HttpClientTestingModule, // Mock HTTP requests
        FormsModule, // Needed for forms functionality in the component
        NgFor, // Required to use *ngFor in the template
      ],
      providers: [
        { provide: UserService, useValue: mockUserService }, // Provide the mocked UserService
        { provide: ChannelService, useValue: mockChannelService }, // Provide the mocked ChannelService
      ],
    }).compileComponents();

    // Create the component fixture
    fixture = TestBed.createComponent(ChannelUserManagementComponent);
    component = fixture.componentInstance;

    // Set up a mock channel for the input property `selectedChannel`
    component.selectedChannel = {
      id: 'channel1',
      channelUsers: ['user1', 'user2'], // Users in the channel
      pendingUsers: ['user3'], // Users waiting for approval
      banned_users: [], // No banned users initially
    };

    // Mock the user service response with a list of users using the User model
    const mockUsers: User[] = [
      {
        id: 'user1',
        username: 'User 1',
        email: 'user1@example.com',
        password: 'password1',
        profile_img_path: '',
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
        profile_img_path: '',
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
        profile_img_path: '',
        roles: ['Chat_user'],
        groups: [],
        interest_groups: [],
        channels: [],
        interest_channels: [],
        banned_channels: [],
        reported_in_groups: [],
      },
    ];

    // Set the mock return value for getUsers call
    mockUserService.getUsers.and.returnValue(of(mockUsers));

    fixture.detectChanges(); // Trigger ngOnInit in the component
  });

  it('should load users and match them with the selected channel', () => {
    // Verify that users are loaded from the mockUserService
    expect(mockUserService.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(3); // Mocked user data has 3 users

    // Verify that interestedUsers contains only users in `pendingUsers`
    expect(component.interestedUsers.length).toBe(1);
    expect(component.interestedUsers[0].username).toBe('User 3'); // Check the correct user

    // Verify that the selectedChannel users are correctly matched
    expect(component.selectedChannel.users.length).toBe(2); // 2 users in the channel
    expect(component.selectedChannel.users[0].username).toBe('User 1');
  });

  it('should approve a user and update the channel', () => {
    // Mock the approveUserForChannel service response
    mockChannelService.approveUserForChannel.and.returnValue(
      of({ user: { id: 'user3', username: 'User 3' } })
    );

    // Call the approveUser method in the component
    component.approveUser({ id: 'user3', username: 'User 3' });

    // Ensure the API call was made correctly
    expect(mockChannelService.approveUserForChannel).toHaveBeenCalledWith(
      'channel1', // Channel ID
      'user3' // User ID
    );

    // Verify that the user is added to selectedChannel users
    expect(component.selectedChannel.users.length).toBe(3); // User is added
    expect(component.interestedUsers.length).toBe(0); // User is removed from interestedUsers
  });

  it('should decline a user', () => {
    // Mock the declineUserForChannel service response
    mockChannelService.declineUserForChannel.and.returnValue(
      of({ user: { id: 'user3' } })
    );

    // Call the declineUser method in the component
    component.declineUser({ id: 'user3', username: 'User 3' });

    // Ensure the API call was made correctly
    expect(mockChannelService.declineUserForChannel).toHaveBeenCalledWith(
      'channel1', // Channel ID
      'user3' // User ID
    );

    // Verify that the user is removed from interestedUsers
    expect(component.interestedUsers.length).toBe(0); // User is removed from pending list
  });

  it('should ban a user', () => {
    // Mock the banUserFromChannel service response
    mockChannelService.banUserFromChannel.and.returnValue(
      of({ user: { id: 'user1' } })
    );

    // Call the banUser method in the component
    component.banUser({ id: 'user1', username: 'User 1' });

    // Ensure the API call was made correctly
    expect(mockChannelService.banUserFromChannel).toHaveBeenCalledWith(
      'channel1', // Channel ID
      'user1' // User ID
    );

    // Verify that the user is removed from the list of channel users and added to banned_users
    expect(component.selectedChannel.users.length).toBe(1); // One user is removed
    expect(component.selectedChannel.banned_users.length).toBe(1); // User is added to banned list
  });
});
