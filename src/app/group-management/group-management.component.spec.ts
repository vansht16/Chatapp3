// Import necessary testing modules and services
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupManagementComponent } from './group-management.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { Group } from '../models/group.model';

// Test suite for GroupManagementComponent
describe('GroupManagementComponent', () => {
  let component: GroupManagementComponent;
  let fixture: ComponentFixture<GroupManagementComponent>;
  let mockGroupService: jasmine.SpyObj<GroupService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  // Set up mock services and test environment before each test
  beforeEach(async () => {
    // Create mock services using jasmine spies
    mockGroupService = jasmine.createSpyObj('GroupService', [
      'getGroups',
      'getGroupsForSuperAdmin',
      'deleteGroup',
      'addGroup',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getUserID',
      'getUserRole',
      'getUserInfo',
      'checkLoginAndRedirect',
      'updateUserInfo',
    ]);

    // Mock return values for AuthService methods
    mockAuthService.getUserID.and.returnValue('user123');
    mockAuthService.getUserRole.and.returnValue('Super Admin');

    // Mock group data for testing
    const mockGroups: Group[] = [
      {
        id: 'group1',
        groupname: 'Test Group 1',
        adminId: 'user123',
        users: ['user123'],
        channels: [],
        pendingUsers: [],
        reported_users: [],
      },
      {
        id: 'group2',
        groupname: 'Test Group 2',
        adminId: 'super',
        users: ['user123'],
        channels: [],
        pendingUsers: [],
        reported_users: [],
      },
    ];
    mockGroupService.getGroupsForSuperAdmin.and.returnValue(of(mockGroups));

    // Configure the testing module and create the component
    await TestBed.configureTestingModule({
      imports: [GroupManagementComponent, HttpClientTestingModule],
      providers: [
        { provide: GroupService, useValue: mockGroupService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test to ensure the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test that groups are loaded on initialization if the user is a Super Admin
  it('should load groups on init if user is Super Admin', () => {
    component.ngOnInit(); // Simulate component initialization
    expect(mockGroupService.getGroupsForSuperAdmin).toHaveBeenCalledWith(
      'user123'
    ); // Verify that the groups are loaded for the Super Admin
    expect(component.groups.length).toBe(2); // Check if two groups were loaded
  });

  // Test group filtering functionality based on a search query
  it('should filter groups based on search query', () => {
    component.searchQuery = 'Test Group 1'; // Set a search query
    const filteredGroups = component.filteredGroups; // Filter groups based on the query
    expect(filteredGroups.length).toBe(1); // Verify that only one group matches the search query
  });

  // Test selecting a group in the management view
  it('should select a group', () => {
    const mockGroup = { id: 'group1', groupname: 'Test Group 1' };
    component.selectGroup(mockGroup); // Simulate selecting a group
    expect(component.selectedGroup).toEqual(mockGroup); // Verify that the selected group is correctly set
  });

  // Test adding a new group and updating the list
  it('should add a new group and reload the list', () => {
    const newGroup: Group = {
      id: 'group3',
      groupname: 'New Group',
      adminId: 'user123',
      users: ['user123'],
      channels: [],
      pendingUsers: [],
      reported_users: [],
    };
    mockGroupService.addGroup.and.returnValue(of(newGroup)); // Mock the addGroup method

    component.newGroupName = 'New Group'; // Set a new group name
    component.saveGroup(); // Simulate saving the new group

    expect(mockGroupService.addGroup).toHaveBeenCalled(); // Verify that addGroup was called
    expect(component.newGroupName).toBe(''); // Check that the input field was cleared
  });
});
