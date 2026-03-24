import { Component, OnInit } from '@angular/core';
import { AppDataService, StaffMember } from '../../services/app-data.service';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.scss']
})
export class StaffDetailsComponent implements OnInit {
  title = 'Staff Details';
  subtitle = 'Employee information and roles.';
  staff: StaffMember[] = [];
  showAddForm = false;
  form: Partial<StaffMember> = { name: '', role: '', department: '', joinDate: '', email: '' };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.staff = this.data.getStaff();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) this.form = { name: '', role: '', department: '', joinDate: new Date().toISOString().slice(0, 10), email: '' };
  }

  saveStaff(): void {
    const s: StaffMember = {
      id: 'EMP' + String(this.staff.length + 1).padStart(3, '0'),
      name: this.form.name || '',
      role: this.form.role || '',
      department: this.form.department || '',
      joinDate: this.form.joinDate || '',
      email: this.form.email || ''
    };
    this.data.addStaff(s);
    this.load();
    this.showAddForm = false;
  }
}
