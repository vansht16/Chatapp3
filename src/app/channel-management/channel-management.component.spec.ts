import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChannelManagementComponent } from './channel-management.component';
import { ChannelService } from '../services/channel.service';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

// Mock services to simulate the behavior of the real services used in the component
class MockChannelService {
  getChannelById() {
    // Simulate a backend response with observable data for a channel
    return of({
      _id: '123',
      name: 'Test Channel',
      banned_users: [],
      channelUsers: [],
      pendingUsers: [],
    });
  }
}

class MockGroupService {}

class MockAuthService {
  getUserID() {
    // Simulate getting a mock user ID
    return 'mockUserId';
  }
}

describe('ChannelManagementComponent', () => {
  let component: ChannelManagementComponent;
  let fixture: ComponentFixture<ChannelManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelManagementComponent], // Import the standalone component
      providers: [
        { provide: ChannelService, useClass: MockChannelService }, // Provide mock version of ChannelService
        { provide: GroupService, useClass: MockGroupService }, // Provide mock version of GroupService
        { provide: AuthService, useClass: MockAuthService }, // Provide mock version of AuthService
      ],
    }).compileComponents();

    // Create component instance and fixture (wrapper for the component)
    fixture = TestBed.createComponent(ChannelManagementComponent);
    component = fixture.componentInstance;

    // Mock initial data for selectedGroup to simulate actual group data
    component.selectedGroup = {
      id: '1',
      groupname: 'Test Group',
      adminId: 'admin1',
      channels: ['channel1', 'channel2'], // Channels to test loading functionality
      users: [],
      pendingUsers: [],
      reported_users: [],
    };

    fixture.detectChanges(); // Trigger change detection to update the UI
  });

  it('should create', () => {
    // Ensure that the component is created successfully
    expect(component).toBeTruthy();
  });

  it('should load channel details on initialization', () => {
    // Spy on the 'loadChannelDetails' method to ensure it gets called
    const loadChannelSpy = spyOn(
      component,
      'loadChannelDetails'
    ).and.callThrough();

    // Call the component's ngOnInit to simulate component initialization
    component.ngOnInit();

    // Expect 'loadChannelDetails' to have been called during initialization
    expect(loadChannelSpy).toHaveBeenCalled();
  });

  it('should set current user ID on initialization', () => {
    // Call ngOnInit to trigger initialization logic, including setting the user ID
    component.ngOnInit();

    // Expect the current_user_id to be set to the mock value provided by MockAuthService
    expect(component.current_user_id).toEqual('mockUserId');
  });

  it('should manage a channel when manageChannel is called', () => {
    // Mock a channel object to test channel management functionality
    const mockChannel = { id: '1', name: 'Test Channel' };

    // Spy on the 'manageChannelEvent.emit' to ensure the event gets emitted when managing a channel
    const manageChannelSpy = spyOn(component.manageChannelEvent, 'emit');

    // Call the component's 'manageChannel' method with the mock channel data
    component.manageChannel(mockChannel);

    // Expect the event emitter to have been called with the mock channel data
    expect(manageChannelSpy).toHaveBeenCalledWith(mockChannel);
  });
});
