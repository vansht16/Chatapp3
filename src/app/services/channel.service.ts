import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Get channel details by its ID
  getChannelById(channelId: string): Observable<Channel> {
    return this.http.get<Channel>(`${this.URL}/channels/${channelId}`);
  }

  // Add a new channel
  addChannel(
    groupId: string,
    channel: {
      id: string;
      name: string;
      channelUsers: string[];
      pendingUsers: string[];
      banned_users: string[];
    }
  ): Observable<{ group: Group; newChannel: Channel }> {
    return this.http.post<{ group: Group; newChannel: Channel }>(
      `${this.URL}/groups/${groupId}/channels`,
      channel
    );
  }

  // Update channel name
  updateChannelName(
    channelId: string,
    newChannelName: string
  ): Observable<Channel> {
    return this.http.put<Channel>(`${this.URL}/channels/${channelId}`, {
      newChannelName,
    });
  }

  // Delete channel
  deleteChannel(groupId: string, channelId: string): Observable<Channel> {
    return this.http.delete<Channel>(
      `${this.URL}/groups/${groupId}/channels/${channelId}`
    );
  }

  // Request to join a channel
  requestToJoinChannel(channelId: string, userId: string): Observable<any> {
    return this.http.put<any>(
      `${this.URL}/channels/${channelId}/requestToJoin`,
      { userId }
    );
  }

  // Approve user to join channel
  approveUserForChannel(channelId: string, userId: string): Observable<any> {
    return this.http.put<any>(`${this.URL}/channels/${channelId}/approveUser`, {
      userId,
    });
  }

  // Decline user request to join channel
  declineUserForChannel(channelId: string, userId: string): Observable<any> {
    return this.http.put<any>(`${this.URL}/channels/${channelId}/declineUser`, {
      userId,
    });
  }

  // Ban user from channel
  banUserFromChannel(channelId: string, userId: string): Observable<any> {
    return this.http.put<any>(`${this.URL}/channels/${channelId}/banUser`, {
      userId,
    });
  }
}
