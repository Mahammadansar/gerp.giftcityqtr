import { Component } from '@angular/core';

interface TimesheetEntry {
  project: string;
  date: string;
  hours: number;
  task: string;
  billable: boolean;
}

interface ProjectProfit {
  project: string;
  client: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  activeTab: 'timesheets' | 'profitability' = 'timesheets';
  title = 'Projects & Timesheets';
  subtitle = 'Bill timesheets and track project profitability.';

  timesheets: TimesheetEntry[] = [
    { project: 'Expo 2026 Campaign', date: '2026-02-26', hours: 8, task: 'Design & layout', billable: true },
    { project: 'Al Raha Branding', date: '2026-02-25', hours: 6, task: 'Client meeting', billable: true },
    { project: 'Corporate Gifts Q1', date: '2026-02-24', hours: 4, task: 'Sourcing', billable: true },
    { project: 'Internal', date: '2026-02-23', hours: 2, task: 'Training', billable: false }
  ];

  profitability: ProjectProfit[] = [
    { project: 'Expo 2026 Campaign', client: 'Expo 2026 Pavilion', revenue: 68000, cost: 42000, profit: 26000, margin: '38%' },
    { project: 'Al Raha Branding', client: 'Al Raha Events', revenue: 18500, cost: 9200, profit: 9300, margin: '50%' },
    { project: 'Gulf Ad Campaign', client: 'Gulf Advertising LLC', revenue: 42000, cost: 28500, profit: 13500, margin: '32%' }
  ];
}
