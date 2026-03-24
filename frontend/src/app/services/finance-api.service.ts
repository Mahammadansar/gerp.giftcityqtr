import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FinanceRetainer {
  id: string;
  client: string;
  amount: number;
  currency: string;
  startDate: string;
  status: string;
}

export interface FinanceOverview {
  vendorBills: { ref: string; vendor: string; date: string; dueDate: string; amount: number; currency: string; status: string }[];
  retainers: FinanceRetainer[];
  cashflowMonths: { month: string; inflow: number; outflow: number }[];
  currencies: { code: string; name: string; rate: number }[];
}

export interface BalanceSheetData {
  asOfDate: string;
  assets: { label: string; amount: number }[];
  liabilities: { label: string; amount: number }[];
  equity: { label: string; amount: number }[];
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
}

export interface ProfitLossData {
  period: string;
  revenue: { label: string; amount: number }[];
  expenses: { label: string; amount: number }[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface CashFlowData {
  period: string;
  operating: { label: string; amount: number }[];
  investing: { label: string; amount: number }[];
  financing: { label: string; amount: number }[];
  netOperating: number;
  netInvesting: number;
  netFinancing: number;
  netChange: number;
  openingBalance: number;
  closingBalance: number;
}

@Injectable({ providedIn: 'root' })
export class FinanceApiService {
  private readonly api = `${environment.apiBaseUrl}/finance`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<{ data: FinanceOverview }> { return this.http.get<{ data: FinanceOverview }>(`${this.api}/overview`); }
  getBalanceSheet(): Observable<{ data: BalanceSheetData }> { return this.http.get<{ data: BalanceSheetData }>(`${this.api}/balance-sheet`); }
  getProfitLoss(): Observable<{ data: ProfitLossData }> { return this.http.get<{ data: ProfitLossData }>(`${this.api}/profit-loss`); }
  getCashFlow(): Observable<{ data: CashFlowData }> { return this.http.get<{ data: CashFlowData }>(`${this.api}/cash-flow`); }
  getCustomersLedger(): Observable<{ data: { name: string; opening: number; sales: number; receipts: number; balance: number }[] }> { return this.http.get<{ data: { name: string; opening: number; sales: number; receipts: number; balance: number }[] }>(`${this.api}/ledgers/customers`); }
  getSuppliersLedger(): Observable<{ data: { name: string; opening: number; purchases: number; payments: number; balance: number }[] }> { return this.http.get<{ data: { name: string; opening: number; purchases: number; payments: number; balance: number }[] }>(`${this.api}/ledgers/suppliers`); }
  createRetainer(payload: { client: string; amount: number; currency: string; startDate: string; status?: string }): Observable<{ data: FinanceRetainer }> {
    return this.http.post<{ data: FinanceRetainer }>(`${this.api}/retainers`, payload);
  }
}
