import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PurchaseOrder } from './app-data.service';

export interface ApprovalItem {
  type: string;
  id: string;
  ref: string;
  requester: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PqiApiService {
  private readonly api = `${environment.apiBaseUrl}/pqi`;
  constructor(private http: HttpClient) {}

  listPurchaseOrders(): Observable<{ data: PurchaseOrder[] }> {
    return this.http.get<{ data: PurchaseOrder[] }>(`${this.api}/purchase-orders`);
  }

  createPurchaseOrder(payload: any): Observable<{ data: PurchaseOrder }> {
    return this.http.post<{ data: PurchaseOrder }>(`${this.api}/purchase-orders`, payload);
  }

  updatePurchaseOrderStatus(id: string, status: string): Observable<{ data: PurchaseOrder }> {
    return this.http.patch<{ data: PurchaseOrder }>(`${this.api}/purchase-orders/${id}/status`, { status });
  }

  approvePurchaseOrder(id: string): Observable<{ data: PurchaseOrder }> {
    return this.http.patch<{ data: PurchaseOrder }>(`${this.api}/purchase-orders/${id}/approve`, {});
  }

  rejectPurchaseOrder(id: string): Observable<{ data: PurchaseOrder }> {
    return this.http.patch<{ data: PurchaseOrder }>(`${this.api}/purchase-orders/${id}/reject`, {});
  }

  listApprovals(): Observable<{ data: ApprovalItem[] }> {
    return this.http.get<{ data: ApprovalItem[] }>(`${this.api}/approvals`);
  }
}
