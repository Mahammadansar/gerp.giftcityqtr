import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinanceApiService {
  private readonly api = `${environment.apiBaseUrl}/finance`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<any> { return this.http.get(`${this.api}/overview`); }
  getBalanceSheet(): Observable<any> { return this.http.get(`${this.api}/balance-sheet`); }
  getProfitLoss(): Observable<any> { return this.http.get(`${this.api}/profit-loss`); }
  getCashFlow(): Observable<any> { return this.http.get(`${this.api}/cash-flow`); }
  getCustomersLedger(): Observable<any> { return this.http.get(`${this.api}/ledgers/customers`); }
  getSuppliersLedger(): Observable<any> { return this.http.get(`${this.api}/ledgers/suppliers`); }
  createRetainer(payload: { client: string; amount: number; currency: string; startDate: string; status?: string }): Observable<any> {
    return this.http.post(`${this.api}/retainers`, payload);
  }
}
