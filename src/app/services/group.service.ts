import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private URL = 'http://localhost:3000/api/groups';

  constructor(private http: HttpClient) {}

  // Get all groups
  getGroups(adminId?: string): Observable<Group[]> {
    let params = new HttpParams();
    if (adminId) {
      params = params.set('adminId', adminId);
    }
    return this.http.get<Group[]>(this.URL, { params });
  }

  // Get groups that this current, who is a super admin can manage
  getGroupsForSuperAdmin(adminId: string): Observable<Group[]> {
    let params = new HttpParams();
    params = params.set('adminId', adminId).append('adminId', 'super');
    return this.http.get<Group[]>(this.URL, { params });
  }

  // Get a specific group
  getGroupById(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${this.URL}/${groupId}`);
  }

  // Add a new group
  addGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(this.URL, group);
  }

  // Update group name
  updateGroupName(groupId: string, newGroupName: string): Observable<Group> {
    return this.http.put<Group>(`${this.URL}/${groupId}/name`, {
      newGroupName,
    });
  }

  // Delete group
  deleteGroup(id: string, adminId: string): Observable<void> {
    const params = new HttpParams().set('adminId', adminId);
    return this.http.delete<void>(`${this.URL}/${id}`, { params });
  }

  // User request to join a group
  registerInterest(groupId: string, userId: string): Observable<any> {
    return this.http.put(`${this.URL}/${groupId}/register-interest`, {
      userId,
    });
  }

  // Approve user to join a group
  approveInterest(groupId: string, userId: string): Observable<Group> {
    return this.http.put<Group>(`${this.URL}/${groupId}/approve`, {
      userId,
    });
  }

  // Decline user to join a group
  declineInterest(groupId: string, userId: string): Observable<Group> {
    return this.http.put<Group>(`${this.URL}/${groupId}/decline`, {
      userId,
    });
  }

  // Update group admin to super
  updateGroupAdminToSuper(groupId: string): Observable<void> {
    return this.http.put<void>(`${this.URL}/${groupId}/admin-to-super`, {});
  }

  // Report user to super admin
  reportUserToSuperAdmin(groupId: string, userId: string): Observable<Group> {
    return this.http.put<Group>(`${this.URL}/${groupId}/report`, {
      userId,
    });
  }

  // Remove user from a group
  removeUserFromGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.put<Group>(`${this.URL}/${groupId}/remove`, {
      userId,
    });
  }
}
