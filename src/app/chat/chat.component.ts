import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Group } from '../models/group.model';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChannelService } from '../services/channel.service';
import { SocketService } from '../services/socket.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, NgClass, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedGroup: Group | null = null;
  selectedChannel: any | null = null;
  currentUser: any;
  groups: Group[] = [];
  channels: any[] = [];
  isUserInChannel: boolean = false;
  isUserPendingApproval: boolean = false;
  chatMessages: any[] = [];
  messageContent: string = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  private BASE_URL = 'http://localhost:3000/images/';

  // Create a cache (map) to store userId -> { username, profile_img_path }
  userCache: { [key: string]: { username: string; profile_img_path: string } } =
    {};

  constructor(
    private GroupService: GroupService,
    private AuthService: AuthService,
    private UserService: UserService,
    private router: Router,
    private ChannelService: ChannelService,
    private SocketService: SocketService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.AuthService.getUserInfo();
    this.loadGroups();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      alert('You need to be logged in to see this page');
    }
    this.initSocketConnection();
  }

  // Detect if the user closes the tab or navigates away
  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    if (this.selectedChannel) {
      this.SocketService.leaveChannel(
        this.selectedChannel._id,
        this.currentUser.username
      );
    }
  }

  ngOnDestroy(): void {
    if (this.selectedChannel) {
      this.SocketService.leaveChannel(
        this.selectedChannel._id,
        this.currentUser.username
      );
    }
  }

  loadGroups() {
    this.GroupService.getGroups().subscribe((data: Group[]) => {
      this.groups = data.filter((group) =>
        group.users.includes(this.currentUser.id)
      );
      // No automatic group/channel selection
      this.selectedGroup = null;
      this.selectedChannel = null;
    });
  }

  selectGroup(groupId: string) {
    this.selectedGroup = this.groups.find((g) => g.id === groupId) || null;

    if (this.selectedGroup) {
      this.channels = [];
      this.selectedGroup.channels.forEach((channelId: string) => {
        this.ChannelService.getChannelById(channelId).subscribe(
          (channel) => {
            this.channels.push(channel);
          },
          (error) => {
            console.error(
              `Error fetching channel with ID: ${channelId}`,
              error
            );
          }
        );
      });
      this.selectedChannel = null;
      this.isUserInChannel = false;
      this.isUserPendingApproval = false;
    }
  }

  selectChannel(channel: any) {
    if (this.selectedChannel) {
      this.SocketService.leaveChannel(
        this.selectedChannel._id,
        this.currentUser.username
      );
    }
    this.selectedChannel = channel;
    this.isUserInChannel = channel.channelUsers.includes(this.currentUser.id);
    this.isUserPendingApproval = channel.pendingUsers.includes(
      this.currentUser.id
    );
    this.loadChatMessages(channel._id);
    this.SocketService.joinChannel(channel._id, this.currentUser.username);
  }

  loadChatMessages(channelId: string) {
    this.SocketService.getChatMessages(channelId).subscribe((messages) => {
      this.chatMessages = messages;
      console.log(messages);
      this.chatMessages.forEach((msg) => {
        this.getUserInfo(msg.userId);
      });
    });
  }

  getUserInfo(userId: string) {
    console.log('this.userCache', this.userCache);
    if (this.userCache[userId]) {
      this.chatMessages.forEach((msg) => {
        if (msg.userId === userId) {
          console.log(this.userCache[userId].username);
          msg.username = this.userCache[userId].username;
          msg.profile_img_path = this.userCache[userId].profile_img_path;
        }
      });
    } else {
      this.UserService.getUserById(userId).subscribe((user) => {
        console.log('THis is user', user);
        this.userCache[user.id] = {
          username: user.username,
          profile_img_path: user.profile_img_path,
        };

        this.chatMessages.forEach((msg) => {
          if (msg.userId === user.id) {
            msg.username = user.username;
            msg.profile_img_path = user.profile_img_path;
          }
        });
      });
    }
  }

  requestToJoinChannel() {
    this.ChannelService.requestToJoinChannel(
      this.selectedChannel._id,
      this.currentUser.id
    ).subscribe(
      (response) => {
        alert('Request sent to join the channel.');
        this.isUserPendingApproval = true;
      },
      (error) => {
        console.error('Error requesting to join the channel:', error);
        alert('Failed to send request to join the channel.');
      }
    );
  }

  initSocketConnection() {
    this.SocketService.initSocket();

    this.SocketService.getMessages().subscribe((message: any) => {
      this.chatMessages.push(message);
      this.getUserInfo(message.userId);
    });

    this.SocketService.getSystemMessages().subscribe((systemMessage: any) => {
      this.chatMessages.push({
        message: systemMessage.message,
        system: true, // Mark it as a system message
      });
    });
  }

  // Trigger the hidden file input when the icon is clicked
  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  // Handle image selection and create preview
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  clearImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.fileInput.nativeElement.value = ''; // Clear file input
  }

  sendMessage() {
    console.log('jajaja');
    console.log(this.selectedImage);
    if (this.selectedImage) {
      // If an image is selected, upload it first
      this.SocketService.uploadImage(this.selectedImage).subscribe(
        (response) => {
          console.log(response);
          // Once the image is uploaded, send the message with the image URL
          const imageUrl = response.imageUrl; // Assume server returns the image URL
          const message = {
            channelId: this.selectedChannel._id,
            userId: this.currentUser.id,
            message: this.messageContent.trim(),
            imageUrl: imageUrl, // Include the image URL in the message object
          };
          this.SocketService.sendMessage(message); // Send message to the server
          this.clearMessage(); // Clear the message input and image preview
        },
        (error) => {
          console.error('Error uploading image:', error);
        }
      );
    } else if (this.messageContent.trim() && this.selectedChannel) {
      // If no image is selected, just send the text message
      const message = {
        channelId: this.selectedChannel._id,
        userId: this.currentUser.id,
        message: this.messageContent.trim(),
        imageUrl: '',
      };
      this.SocketService.sendMessage(message);
      this.clearMessage();
    }
  }

  // Helper method to clear the message input and image preview
  clearMessage() {
    this.messageContent = '';
    this.clearImage(); // Reset image input
  }

  // Helper method to check if two messages were sent on the same day
  isSameDay(timestamp1: string, timestamp2: string): boolean {
    const date1 = new Date(timestamp1).toDateString();
    const date2 = new Date(timestamp2).toDateString();
    return date1 === date2;
  }
}
