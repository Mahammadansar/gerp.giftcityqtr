import { Component, OnInit } from '@angular/core';
import { HrApiService, HrStaff } from '../../services/hr-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.scss']
})
export class StaffDetailsComponent implements OnInit {
  title = 'Staff Details';
  subtitle = 'Employee information and roles.';
  staff: HrStaff[] = [];
  showAddForm = false;
  error = '';
  form: Partial<HrStaff> = { name: '', role: '', department: '', joinDate: '', email: '' };

  constructor(private hrApi: HrApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.hrApi.listStaff().subscribe({
      next: (res) => {
        this.staff = (res.data || []).map((s) => ({ ...s, joinDate: String(s.joinDate).slice(0, 10) }));
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to load staff');
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) this.form = { name: '', role: '', department: '', joinDate: new Date().toISOString().slice(0, 10), email: '' };
  }

  saveStaff(): void {
    this.error = '';
    this.hrApi.createStaff({
      name: this.form.name || '',
      role: this.form.role || '',
      department: this.form.department || '',
      joinDate: this.form.joinDate || new Date().toISOString().slice(0, 10),
      email: this.form.email || ''
    }).subscribe({
      next: () => {
        this.load();
        this.showAddForm = false;
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to save staff');
      }
    });
  }
}
