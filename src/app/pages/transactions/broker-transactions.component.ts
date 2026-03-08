import { Component } from '@angular/core';

type BrokerTxn = {
  ref_number: string;
  deal_date: string;
  client: string;
  project: string;
  unit_number: string;
  price: number;
  commission: number;
  status: 'PENDING' | 'CLOSED' | 'CANCELLED';
};

@Component({
  selector: 'app-broker-transactions',
  templateUrl: './broker-transactions.component.html',
  styleUrls: ['./broker-transactions.component.scss']
})
export class BrokerTransactionsComponent {
  q = '';
  status: '' | BrokerTxn['status'] = '';

  rows: BrokerTxn[] = [
    { ref_number: 'BR-2026-TRN-0001', deal_date: '2026-01-02', client: 'Ahmed Khan', project: 'Marina View', unit_number: 'A-1204', price: 1850000, commission: 55500, status: 'PENDING' },
    { ref_number: 'BR-2026-TRN-0002', deal_date: '2026-01-08', client: 'Sara Ali', project: 'Downtown Heights', unit_number: 'B-0411', price: 2400000, commission: 72000, status: 'CLOSED' },
    { ref_number: 'BR-2026-TRN-0003', deal_date: '2026-01-11', client: 'John Smith', project: 'Palm Residences', unit_number: 'V-0007', price: 5600000, commission: 168000, status: 'PENDING' },
    { ref_number: 'BR-2026-TRN-0004', deal_date: '2026-01-15', client: 'Fatima Noor', project: 'Creek Gate', unit_number: 'C-0901', price: 1320000, commission: 39600, status: 'CANCELLED' },
    { ref_number: 'BR-2026-TRN-0005', deal_date: '2026-01-18', client: 'Mohammed Hassan', project: 'Ocean Towers', unit_number: 'D-2205', price: 3200000, commission: 96000, status: 'CLOSED' },
    { ref_number: 'BR-2026-TRN-0006', deal_date: '2026-01-20', client: 'Layla Ahmed', project: 'Sky Gardens', unit_number: 'E-1503', price: 2100000, commission: 63000, status: 'PENDING' }
  ];

  get filtered(): BrokerTxn[] {
    const q = this.q.trim().toLowerCase();
    return this.rows.filter(r => {
      const matchesQ =
        !q ||
        r.ref_number.toLowerCase().includes(q) ||
        r.client.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.unit_number.toLowerCase().includes(q);
      const matchesStatus = !this.status || r.status === this.status;
      return matchesQ && matchesStatus;
    });
  }

  exportData() {
    // Demo function - would export data in real implementation
    console.log('Exporting data...');
  }
}
