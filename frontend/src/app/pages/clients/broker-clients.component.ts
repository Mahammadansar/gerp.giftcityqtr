import { Component } from '@angular/core';

type BrokerClient = {
  name: string;
  phone: string;
  email: string;
  segment: 'Buyer' | 'Seller' | 'Investor';
};

@Component({
  selector: 'app-broker-clients',
  templateUrl: './broker-clients.component.html',
  styleUrls: ['./broker-clients.component.scss']
})
export class BrokerClientsComponent {
  q = '';

  clients: BrokerClient[] = [
    { name: 'Ahmed Khan', phone: '+971 50 123 4567', email: 'ahmed@example.com', segment: 'Buyer' },
    { name: 'Sara Ali', phone: '+971 55 222 3344', email: 'sara@example.com', segment: 'Investor' },
    { name: 'John Smith', phone: '+971 56 888 1122', email: 'john@example.com', segment: 'Buyer' },
    { name: 'Fatima Noor', phone: '+971 52 444 7788', email: 'fatima@example.com', segment: 'Seller' },
    { name: 'Mohammed Hassan', phone: '+971 50 999 8877', email: 'mohammed@example.com', segment: 'Investor' },
    { name: 'Layla Ahmed', phone: '+971 55 777 6655', email: 'layla@example.com', segment: 'Buyer' },
    { name: 'Omar Ibrahim', phone: '+971 56 333 2211', email: 'omar@example.com', segment: 'Seller' },
    { name: 'Noor Al-Mansoori', phone: '+971 50 111 2233', email: 'noor@example.com', segment: 'Investor' }
  ];

  get filtered(): BrokerClient[] {
    const q = this.q.trim().toLowerCase();
    return this.clients.filter(c => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q)
      );
    });
  }
}
