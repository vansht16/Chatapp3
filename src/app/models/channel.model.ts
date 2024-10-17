export interface Channel {
  _id: string;
  name: string;
  channelUsers: string[];
  pendingUsers: string[];
  banned_users: string[];
}
