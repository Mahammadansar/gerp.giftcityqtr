import { Component, OnInit } from '@angular/core';
import { AppDataService, ChatMessage } from '../../services/app-data.service';

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss']
})
export class CollaborationComponent implements OnInit {
  title = 'Collaboration';
  subtitle = 'Chat and messages with your team.';

  messages: ChatMessage[] = [];
  newFrom = '';
  newText = '';

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.messages = this.data.getCollaboration();
  }

  sendMessage(): void {
    if (!this.newText.trim()) return;
    this.data.addChatMessage({
      id: String(Date.now()),
      from: this.newFrom || 'You',
      text: this.newText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.newText = '';
    this.load();
  }
}
