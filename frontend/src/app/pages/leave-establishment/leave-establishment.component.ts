import { Component, OnInit } from '@angular/core';
import { AppDataService, LeaveType, LeaveRequest } from '../../services/app-data.service';

@Component({
  selector: 'app-leave-establishment',
  templateUrl: './leave-establishment.component.html',
  styleUrls: ['./leave-establishment.component.scss']
})
export class LeaveEstablishmentComponent implements OnInit {
  title = 'Leave Establishment';
  subtitle = 'Leave types, entitlements and policy.';

  leaveTypes: LeaveType[] = [];
  recentRequests: LeaveRequest[] = [];
  showAddType = false;
  showAddRequest = false;
  typeForm: Partial<LeaveType> = { name: '', daysPerYear: 0, carryOver: 0, description: '' };
  requestForm: Partial<LeaveRequest> = { employee: '', type: '', from: '', to: '', days: 0 };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.leaveTypes = this.data.getLeaveTypes();
    this.recentRequests = this.data.getLeaveRequests();
  }

  toggleAddType(): void {
    this.showAddType = !this.showAddType;
    if (this.showAddType) this.typeForm = { name: '', daysPerYear: 0, carryOver: 0, description: '' };
  }

  saveLeaveType(): void {
    const lt: LeaveType = {
      id: String(Date.now()),
      name: this.typeForm.name || '',
      daysPerYear: this.typeForm.daysPerYear || 0,
      carryOver: this.typeForm.carryOver || 0,
      description: this.typeForm.description || ''
    };
    this.data.addLeaveType(lt);
    this.load();
    this.showAddType = false;
  }

  toggleAddRequest(): void {
    this.showAddRequest = !this.showAddRequest;
    if (this.showAddRequest) this.requestForm = { employee: '', type: '', from: '', to: '', days: 0 };
  }

  saveLeaveRequest(): void {
    const lr: LeaveRequest = {
      id: String(Date.now()),
      employee: this.requestForm.employee || '',
      type: this.requestForm.type || '',
      from: this.requestForm.from || '',
      to: this.requestForm.to || '',
      days: this.requestForm.days || 0,
      status: 'Pending'
    };
    this.data.addLeaveRequest(lr);
    this.load();
    this.showAddRequest = false;
  }

  approveRequest(r: LeaveRequest): void {
    this.data.updateLeaveRequestStatus(r.id, 'Approved');
    this.load();
  }

  rejectRequest(r: LeaveRequest): void {
    this.data.updateLeaveRequestStatus(r.id, 'Rejected');
    this.load();
  }
}
