// Import necessary testing modules and services
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDetailComponent } from './group-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GroupService } from '../services/group.service';
import { of } from 'rxjs';
import { Group } from '../models/group.model'; // Group model

// Test suite for the GroupDetailComponent
describe('GroupDetailComponent', () => {
  let component: GroupDetailComponent;
  let fixture: ComponentFixture<GroupDetailComponent>;
  let mockGroupService: jasmine.SpyObj<GroupService>;

  // Set up mock services and test environment before each test
  beforeEach(async () => {
    // Mock GroupService with jasmine spy objects
    mockGroupService = jasmine.createSpyObj('GroupService', [
      'getGroupById',
      'updateGroupName',
    ]);

    // Mock group data
    const mockGroup: Group = {
      id: 'group1',
      groupname: 'Test Group',
      adminId: 'admin1',
      users: [],
      channels: [],
      pendingUsers: [],
      reported_users: [],
    };

    // Mock GroupService methods to return observable data
    mockGroupService.getGroupById.and.returnValue(of(mockGroup));
    mockGroupService.updateGroupName.and.returnValue(
      of({ ...mockGroup, groupname: 'Updated Group' })
    );

    // Set up the test module and create the component
    await TestBed.configureTestingModule({
      imports: [GroupDetailComponent, HttpClientTestingModule],
      providers: [{ provide: GroupService, useValue: mockGroupService }],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetailComponent);
    component = fixture.componentInstance;

    // Set initial data in the component
    component.selectedGroup = mockGroup;

    fixture.detectChanges();
  });

  // Test to ensure the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test that group data is loaded when a specific tab is selected
  it('should load group data on tab selection', () => {
    component.selectChannelManagement(); // Simulate selecting a management tab
    expect(mockGroupService.getGroupById).toHaveBeenCalledWith('group1'); // Verify the correct method is called
  });

  // Test that the user management tab is selected correctly
  it('should switch to user management tab', () => {
    component.selectUserManagement();
    expect(component.selectedTab).toBe('user_management'); // Verify the correct tab is selected
  });

  // Test that the group name is updated correctly
  it('should change group name', () => {
    component.newGroupName = 'Updated Group';
    component.changeGroupName(); // Simulate changing the group name
    expect(mockGroupService.updateGroupName).toHaveBeenCalledWith(
      'group1',
      'Updated Group'
    ); // Verify the service call
    expect(component.selectedGroup.groupname).toBe('Updated Group'); // Check if the group name is updated
  });

  // Test that channel user management tab is selected correctly
  it('should switch to channel user management tab when a channel is selected', () => {
    const mockChannel = { id: 'channel1', name: 'Channel 1' };
    component.selectChannelUserManagement(mockChannel);
    expect(component.selectedTab).toBe('channel_user_management'); // Verify the correct tab is selected
    expect(component.activeChannel).toEqual(mockChannel); // Check if the correct channel is selected
  });
});
