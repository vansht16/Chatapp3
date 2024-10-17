export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profile_img_path: string;
  roles: string[]; // e.g., ['Super_Admin', 'Group_Admin', 'Chat_user']
  groups: string[];
  interest_groups: string[];
  channels: string[];
  interest_channels: string[];
  banned_channels: string[];
  reported_in_groups: string[];
}
