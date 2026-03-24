import { Component, OnInit } from '@angular/core';
import { ProfitabilityRow, ProjectsApiService, TimesheetRow } from '../../services/projects-api.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  activeTab: 'timesheets' | 'profitability' = 'timesheets';
  title = 'Projects & Timesheets';
  subtitle = 'Bill timesheets and track project profitability.';

  timesheets: TimesheetRow[] = [];
  profitability: ProfitabilityRow[] = [];
  showLogTime = false;
  showAddProject = false;
  error = '';
  tsForm: Partial<TimesheetRow> = { project: '', date: '', hours: 0, task: '', billable: true };
  projectForm: Partial<ProfitabilityRow> = { project: '', client: '', revenue: 0, cost: 0, profit: 0, margin: '' };

  constructor(private projectsApi: ProjectsApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.projectsApi.listTimesheets().subscribe({
      next: (res) => {
        this.timesheets = (res.data || []).map((t) => ({ ...t, date: String(t.date).slice(0, 10) }));
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to load timesheets';
      }
    });

    this.projectsApi.listProfitability().subscribe({
      next: (res) => {
        this.profitability = res.data || [];
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to load project profitability';
      }
    });
  }

  toggleLogTime(): void {
    this.showLogTime = !this.showLogTime;
    if (this.showLogTime) this.tsForm = { project: '', date: new Date().toISOString().slice(0, 10), hours: 0, task: '', billable: true };
  }

  saveTimesheet(): void {
    this.error = '';
    this.projectsApi.createTimesheet({
      project: this.tsForm.project || '',
      date: this.tsForm.date || new Date().toISOString().slice(0, 10),
      hours: Number(this.tsForm.hours || 0),
      task: this.tsForm.task || '',
      billable: this.tsForm.billable ?? true
    }).subscribe({
      next: () => {
        this.load();
        this.showLogTime = false;
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to save timesheet';
      }
    });
  }

  toggleAddProject(): void {
    this.showAddProject = !this.showAddProject;
    if (this.showAddProject) this.projectForm = { project: '', client: '', revenue: 0, cost: 0, profit: 0, margin: '' };
  }

  saveProject(): void {
    this.error = '';
    this.projectsApi.createProfitability({
      project: this.projectForm.project || '',
      client: this.projectForm.client || '',
      revenue: Number(this.projectForm.revenue || 0),
      cost: Number(this.projectForm.cost || 0)
    }).subscribe({
      next: () => {
        this.load();
        this.showAddProject = false;
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to save project';
      }
    });
  }
}
