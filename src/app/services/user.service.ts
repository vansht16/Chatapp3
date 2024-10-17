import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  private URL = 'http://localhost:3000/api';

  // Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.URL}/users`);
  }

  // Get user by ID
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.URL}/users/${userId}`);
  }

  // Add a new user
  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.URL}/users`, user);
  }

  // Update user role
  updateUserRole(userId: string, newRole: string): Observable<User> {
    return this.http.put<User>(`${this.URL}/users/${userId}/role`, {
      role: newRole,
    });
  }

  // Update user profile
  updateUserProfile(
    userId: string,
    updatedInfo: { username: string; email: string }
  ): Observable<User> {
    return this.http.put<User>(`${this.URL}/users/${userId}`, updatedInfo);
  }

  // Delete a user
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.URL}/users/${userId}`);
  }

  // Update user profile
  updateUserProfileWithImage(
    userId: string,
    formData: FormData
  ): Observable<User> {
    return this.http.put<User>(`${this.URL}/users/${userId}`, formData);
  }
}
