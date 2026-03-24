import { Component, OnInit } from '@angular/core';
import { HrApiService, HrLeaveRequest, HrLeaveType } from '../../services/hr-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-leave-establishment',
  templateUrl: './leave-establishment.component.html',
  styleUrls: ['./leave-establishment.component.scss']
})
export class LeaveEstablishmentComponent implements OnInit {
  title = 'Leave Establishment';
  subtitle = 'Leave types, entitlements and policy.';

  leaveTypes: HrLeaveType[] = [];
  recentRequests: HrLeaveRequest[] = [];
  showAddType = false;
  showAddRequest = false;
  error = '';
  typeForm: Partial<HrLeaveType> = { name: '', daysPerYear: 0, carryOver: 0, description: '' };
  requestForm: Partial<HrLeaveRequest> = { employee: '', type: '', from: '', to: '', days: 0 };

  constructor(private hrApi: HrApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.hrApi.listLeaveTypes().subscribe({
      next: (res) => {
        this.leaveTypes = res.data || [];
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to load leave types');
      }
    });

    this.hrApi.listLeaveRequests().subscribe({
      next: (res) => {
        this.recentRequests = (res.data || []).map((r) => ({
          ...r,
          from: String(r.from).slice(0, 10),
          to: String(r.to).slice(0, 10)
        }));
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to load leave requests');
      }
    });
  }

  toggleAddType(): void {
    this.showAddType = !this.showAddType;
    if (this.showAddType) this.typeForm = { name: '', daysPerYear: 0, carryOver: 0, description: '' };
  }

  saveLeaveType(): void {
    this.error = '';
    this.hrApi.createLeaveType({
      name: this.typeForm.name || '',
      daysPerYear: Number(this.typeForm.daysPerYear || 0),
      carryOver: Number(this.typeForm.carryOver || 0),
      description: this.typeForm.description || ''
    }).subscribe({
      next: () => {
        this.load();
        this.showAddType = false;
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to save leave type');
      }
    });
  }

  toggleAddRequest(): void {
    this.showAddRequest = !this.showAddRequest;
    if (this.showAddRequest) this.requestForm = { employee: '', type: '', from: '', to: '', days: 0 };
  }

  saveLeaveRequest(): void {
    this.error = '';
    this.hrApi.createLeaveRequest({
      employee: this.requestForm.employee || '',
      type: this.requestForm.type || '',
      from: this.requestForm.from || '',
      to: this.requestForm.to || '',
      days: Number(this.requestForm.days || 0)
    }).subscribe({
      next: () => {
        this.load();
        this.showAddRequest = false;
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to save leave request');
      }
    });
  }

  approveRequest(r: HrLeaveRequest): void {
    this.error = '';
    this.hrApi.updateLeaveRequestStatus(r.id, 'Approved').subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to approve leave request');
      }
    });
  }

  rejectRequest(r: HrLeaveRequest): void {
    this.error = '';
    this.hrApi.updateLeaveRequestStatus(r.id, 'Rejected').subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to reject leave request');
      }
    });
  }
}
