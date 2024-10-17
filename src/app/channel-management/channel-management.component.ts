import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../services/group.service';
import { ChannelService } from '../services/channel.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-channel-management',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, NgClass],
  templateUrl: './channel-management.component.html',
  styleUrl: './channel-management.component.css',
})
export class ChannelManagementComponent implements OnInit {
  @Input() selectedGroup: any; // Receive selectedGroup from parent component
  @Output() manageChannelEvent = new EventEmitter<any>();

  @ViewChild('channelNameInput', { static: false })
  channelNameInput!: ElementRef;

  isEditing: boolean[] = []; // Track which channels are being edited
  addingChannel: boolean = false; // State for whether a new channel is being added
  newChannelName: string = ''; // Holds the new channel name
  current_user_id: any = '';
  originalChannels: {
    id: string;
    name: string;
    banned_users: string[];
    channelUsers: string[];
    pendingUsers: string[];
  }[] = []; // Store original channel objects
  channels: {
    id: string;
    name: string;
    banned_users: string[];
    channelUsers: string[];
    pendingUsers: string[];
  }[] = []; // Temporary storage for editing channel objects

  constructor(
    private GroupService: GroupService,
    private ChannelService: ChannelService,
    private AuthService: AuthService
  ) {}

  ngOnInit() {
    this.loadChannelDetails();
    this.current_user_id = this.AuthService.getUserID();
  }

  // Get the channel name and details within the selected group
  loadChannelDetails() {
    // Clear the editingChannels array
    this.channels = [];

    // Fetch each channel by its ID from the group
    this.selectedGroup.channels.forEach((channelId: string) => {
      this.ChannelService.getChannelById(channelId).subscribe({
        next: (channelData) => {
          // Store the entire channelData object in channels
          this.channels.push({
            id: channelData._id,
            name: channelData.name,
            banned_users: channelData.banned_users,
            channelUsers: channelData.channelUsers,
            pendingUsers: channelData.pendingUsers,
          });

          this.isEditing.push(false); // Initialize isEditing array for each channel
          console.log('Channel Data:', channelData);
          console.log(this.channels);
        },
        error: (error) => {
          console.error('Error fetching channel:', error);
          alert(
            `Failed to load channel with ID: ${channelId}. Please try again.`
          );
        },
        complete: () => {
          console.log(
            `Channel details for ID ${channelId} fetched successfully.`
          );
        },
      });
    });
  }

  manageChannel(channel: any) {
    this.manageChannelEvent.emit(channel); // Emit the event with channel data
  }

  cancelEdit(index: number) {
    this.isEditing[index] = false;
    this.channels[index] = { ...this.originalChannels[index] }; // Restore original channel data
  }

  // Enable mode to edit channels
  editChannel(index: number, inputRef: HTMLInputElement) {
    this.isEditing[index] = true;
    this.originalChannels[index] = { ...this.channels[index] }; // Store original object
    setTimeout(() => {
      inputRef.focus();
      const length = inputRef.value.length;
      inputRef.setSelectionRange(length, length); // Set cursor at the end
    }, 0);
  }

  // Update channel name
  saveChannelName(index: number) {
    this.isEditing[index] = false;
    const updatedChannelName = this.channels[index].name; // Get the updated channel name from the editing array
    const channelId = this.channels[index].id; // Get the channel ID

    console.log('Updating channel name:', updatedChannelName);

    this.ChannelService.updateChannelName(
      channelId, // Pass only the channel ID
      updatedChannelName // Pass the new channel name
    ).subscribe({
      next: () => {
        console.log('Channel name saved to server:');
      },
      error: (error) => {
        this.channels[index] = { ...this.originalChannels[index] };
        console.error('Error updating channel name:', error);
        alert('Failed to update channel name. Please try again.');
      },
      complete: () => {
        console.log('Channel name update process completed.');
      },
    });
  }

  // Frontend: Deleting a channel
  deleteChannel(group: any, channel: any, index: number) {
    console.log(group.id, channel.id);
    this.ChannelService.deleteChannel(group.id, channel.id).subscribe({
      next: () => {
        this.selectedGroup.channels.splice(index, 1); // Remove channel from group
        this.channels.splice(index, 1); // Remove channel from editing storage
        console.log('Channel deleted:', channel.name);
      },
      error: (error) => {
        console.error('Error deleting channel:', error);
        alert('Failed to delete channel. Please try again.');
      },
    });
  }

  AddfocusInputField(event: MouseEvent) {
    if (this.channelNameInput) {
      this.channelNameInput.nativeElement.focus();
    }
  }

  // Create a new channel
  saveChannel() {
    if (this.newChannelName.trim()) {
      const newChannel = {
        id: '',
        name: this.newChannelName.trim(),
        channelUsers: [this.current_user_id],
        pendingUsers: [],
        banned_users: [],
      };

      // Call the ChannelService to add the new channel
      this.ChannelService.addChannel(
        this.selectedGroup.id,
        newChannel
      ).subscribe({
        next: (response) => {
          this.selectedGroup = response.group;
          newChannel.id = response.newChannel._id.toString();
          this.channels.push(newChannel);
          console.log('New channel added:', newChannel.name);
          this.newChannelName = '';
          this.addingChannel = false;
        },
        error: (error) => {
          console.error('Error adding channel:', error);
          alert('Failed to add channel. Please try again.');
        },
        complete: () => {
          console.log('Channel addition process completed.');
        },
      });
    }
  }

  // Cancel the creation of new channel
  cancelChannel() {
    this.newChannelName = '';
    this.addingChannel = false;
  }

  // Start the process to add new channel
  startAddingChannel() {
    this.addingChannel = true;
    setTimeout(() => {
      if (this.channelNameInput) {
        this.channelNameInput.nativeElement.focus();
      }
    }, 0);
  }
}
