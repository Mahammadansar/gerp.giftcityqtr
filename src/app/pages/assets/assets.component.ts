import { Component } from '@angular/core';

interface FixedAsset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  value: number;
  depreciation: string;
  status: string;
}

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent {
  title = 'Fixed Assets';
  subtitle = 'Manage long-term assets (Professional +).';

  assets: FixedAsset[] = [
    { id: 'FA-001', name: 'Printing Press', category: 'Equipment', purchaseDate: '2024-01-15', value: 125000, depreciation: '10%', status: 'Active' },
    { id: 'FA-002', name: 'Office Building', category: 'Property', purchaseDate: '2020-06-01', value: 850000, depreciation: '2.5%', status: 'Active' },
    { id: 'FA-003', name: 'Delivery Van', category: 'Vehicle', purchaseDate: '2023-03-20', value: 45000, depreciation: '20%', status: 'Active' },
    { id: 'FA-004', name: 'Design Workstations', category: 'IT', purchaseDate: '2025-08-10', value: 32000, depreciation: '25%', status: 'Active' }
  ];
}
