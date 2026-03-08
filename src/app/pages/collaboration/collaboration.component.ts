import { Component } from '@angular/core';

interface ChatThread {
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
}

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss']
})
export class CollaborationComponent {
  title = 'Collaboration';
  subtitle = 'Chat, voice, video and screen sharing with users.';

  threads: ChatThread[] = [
    { name: 'Ahmed Khan', role: 'Sales', lastMessage: 'Can we schedule a call for the Expo proposal?', time: '10 min ago', unread: 2 },
    { name: 'Sara Ali', role: 'Finance', lastMessage: 'Invoice approved. Thanks!', time: '1 hour ago', unread: 0 },
    { name: 'Project Alpha Team', role: 'Group', lastMessage: 'Design review at 3 PM', time: '2 hours ago', unread: 1 }
  ];
}
