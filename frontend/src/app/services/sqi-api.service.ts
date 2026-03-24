import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Invoice, Quotation, SalesOrder } from './app-data.service';

@Injectable({ providedIn: 'root' })
export class SqiApiService {
  private readonly api = `${environment.apiBaseUrl}/sqi`;

  constructor(private http: HttpClient) {}

  listSalesOrders(): Observable<{ data: SalesOrder[] }> { return this.http.get<{ data: SalesOrder[] }>(`${this.api}/sales-orders`); }
  createSalesOrder(payload: { client: string; items: string; total: number; currency: string; date: string; status?: string }): Observable<{ data: SalesOrder }> {
    return this.http.post<{ data: SalesOrder }>(`${this.api}/sales-orders`, payload);
  }
  updateSalesOrderStatus(id: string, status: string): Observable<{ data: SalesOrder }> {
    return this.http.patch<{ data: SalesOrder }>(`${this.api}/sales-orders/${id}/status`, { status });
  }

  listQuotations(): Observable<{ data: Quotation[] }> { return this.http.get<{ data: Quotation[] }>(`${this.api}/quotations`); }
  createQuotation(payload: { client: string; date: string; validUntil: string; currency: string; notes?: string; lines: any[] }): Observable<{ data: Quotation }> {
    return this.http.post<{ data: Quotation }>(`${this.api}/quotations`, payload);
  }
  updateQuotationStatus(id: string, status: string): Observable<{ data: Quotation }> {
    return this.http.patch<{ data: Quotation }>(`${this.api}/quotations/${id}/status`, { status });
  }
  convertQuotationToInvoice(id: string): Observable<{ data: Invoice }> {
    return this.http.post<{ data: Invoice }>(`${this.api}/quotations/${id}/convert-to-invoice`, {});
  }

  listInvoices(): Observable<{ data: Invoice[] }> { return this.http.get<{ data: Invoice[] }>(`${this.api}/invoices`); }
  createInvoice(payload: { client: string; date: string; dueDate: string; currency: string; taxPercent?: number; notes?: string; lines: any[] }): Observable<{ data: Invoice }> {
    return this.http.post<{ data: Invoice }>(`${this.api}/invoices`, payload);
  }
  updateInvoiceStatus(id: string, status: string): Observable<{ data: Invoice }> {
    return this.http.patch<{ data: Invoice }>(`${this.api}/invoices/${id}/status`, { status });
  }
}
