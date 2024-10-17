import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExploreComponent } from './explore.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Group } from '../models/group.model';

describe('ExploreComponent', () => {
  let component: ExploreComponent;
  let fixture: ComponentFixture<ExploreComponent>;
  let mockGroupService: jasmine.SpyObj<GroupService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create mock services using jasmine's createSpyObj
    mockGroupService = jasmine.createSpyObj('GroupService', ['getGroups']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserInfo']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Mock GroupService to return an array of groups
    const mockGroups: Group[] = [
      {
        id: 'group1',
        groupname: 'Group 1',
        adminId: 'admin1',
        users: ['user1'],
        channels: [],
        pendingUsers: [],
        reported_users: [],
      },
    ];
    mockGroupService.getGroups.and.returnValue(of(mockGroups));

    await TestBed.configureTestingModule({
      imports: [ExploreComponent, HttpClientTestingModule],
      providers: [
        { provide: GroupService, useValue: mockGroupService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreComponent);
    component = fixture.componentInstance;

    // Mock window.alert as a spy
    spyOn(window, 'alert');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load groups on init', () => {
    component.ngOnInit();
    expect(mockAuthService.getUserInfo).toHaveBeenCalled(); // Check if user info is retrieved
    expect(mockGroupService.getGroups).toHaveBeenCalled(); // Check if groups are loaded
    expect(component.groups.length).toBe(1); // One group should be loaded
    expect(component.groups[0].groupname).toBe('Group 1'); // Verify the group name
  });

  it('should redirect to login if no user is logged in', () => {
    // Simulate no user logged in
    mockAuthService.getUserInfo.and.returnValue(null);

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']); // Check if redirected to login
    expect(window.alert).toHaveBeenCalledWith(
      'You need to be logged in to see this page'
    ); // Check if alert was called
  });
});
