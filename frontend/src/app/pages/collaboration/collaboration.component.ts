import { Component, OnInit } from '@angular/core';
import { OpsApiService, ChatMessage } from '../../services/ops-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';
import { AuthService } from '../../auth/auth.service';

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
  loading = false;
  submitting = false;

  constructor(private opsApi: OpsApiService, public auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.opsApi.listChatMessages().subscribe({
      next: (res) => { this.messages = res.data || []; this.loading = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load messages'); this.loading = false; }
    });
  }

  sendMessage(): void {
    if (this.submitting) return;
    if (!this.newText.trim()) return;
    this.submitting = true;
    this.opsApi.createChatMessage({
      from: this.newFrom || 'You',
      text: this.newText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }).subscribe({
      next: () => { this.newText = ''; this.load(); this.submitting = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to send message'); this.submitting = false; }
    });
  }
}
