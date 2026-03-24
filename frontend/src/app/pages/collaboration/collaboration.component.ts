import { Component, OnInit } from '@angular/core';
import { OpsApiService, ChatMessage } from '../../services/ops-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

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
  error = '';

  constructor(private opsApi: OpsApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.opsApi.listChatMessages().subscribe({
      next: (res) => { this.messages = res.data || []; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load messages'); }
    });
  }

  sendMessage(): void {
    if (!this.newText.trim()) return;
    this.opsApi.createChatMessage({
      from: this.newFrom || 'You',
      text: this.newText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }).subscribe({
      next: () => { this.newText = ''; this.load(); },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to send message'); }
    });
  }
}
