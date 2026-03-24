import { Component, OnInit } from '@angular/core';
import { AppDataService, TimesheetEntry, ProjectProfit } from '../../services/app-data.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  activeTab: 'timesheets' | 'profitability' = 'timesheets';
  title = 'Projects & Timesheets';
  subtitle = 'Bill timesheets and track project profitability.';

  timesheets: TimesheetEntry[] = [];
  profitability: ProjectProfit[] = [];
  showLogTime = false;
  showAddProject = false;
  tsForm: Partial<TimesheetEntry> = { project: '', date: '', hours: 0, task: '', billable: true };
  projectForm: Partial<ProjectProfit> = { project: '', client: '', revenue: 0, cost: 0, profit: 0, margin: '' };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.timesheets = this.data.getTimesheets();
    this.profitability = this.data.getProjectProfit();
  }

  toggleLogTime(): void {
    this.showLogTime = !this.showLogTime;
    if (this.showLogTime) this.tsForm = { project: '', date: new Date().toISOString().slice(0, 10), hours: 0, task: '', billable: true };
  }

  saveTimesheet(): void {
    const t: TimesheetEntry = {
      id: String(Date.now()),
      project: this.tsForm.project || '',
      date: this.tsForm.date || '',
      hours: this.tsForm.hours || 0,
      task: this.tsForm.task || '',
      billable: this.tsForm.billable ?? true
    };
    this.data.addTimesheet(t);
    this.load();
    this.showLogTime = false;
  }

  toggleAddProject(): void {
    this.showAddProject = !this.showAddProject;
    if (this.showAddProject) this.projectForm = { project: '', client: '', revenue: 0, cost: 0, profit: 0, margin: '' };
  }

  saveProject(): void {
    const rev = this.projectForm.revenue || 0;
    const cost = this.projectForm.cost || 0;
    const profit = rev - cost;
    const margin = rev > 0 ? Math.round((profit / rev) * 100) + '%' : '0%';
    const p: ProjectProfit = {
      id: String(Date.now()),
      project: this.projectForm.project || '',
      client: this.projectForm.client || '',
      revenue: rev,
      cost,
      profit,
      margin
    };
    this.data.addProjectProfit(p);
    this.load();
    this.showAddProject = false;
  }
}
