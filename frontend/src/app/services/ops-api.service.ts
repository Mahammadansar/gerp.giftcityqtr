import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreditNote { id: string; cnNo: string; invoiceNo: string; client: string; date: string; amount: number; currency: string; reason: string; status: string; }
export interface DamageEntry { id: string; refNo: string; date: string; itemName: string; sku: string; size: string; qty: number; reason: string; reportedBy: string; status: string; }
export interface BankEntry { id: string; type: 'cheque' | 'deposit' | 'withdrawal' | 'transfer'; date: string; ref: string; description: string; amount: number; toFrom?: string; status?: string; }
export interface Asset { id: string; name: string; category: string; purchaseDate: string; value: number; status: string; }
export interface ChatMessage { id: string; from: string; text: string; time: string; }
export interface AppSettings { companyName: string; currency: string; }
export type CreateCreditNotePayload = Omit<CreditNote, 'id' | 'cnNo'> & { cnNo?: string };
export type CreateDamageEntryPayload = Omit<DamageEntry, 'id' | 'refNo'> & { refNo?: string };

@Injectable({ providedIn: 'root' })
export class OpsApiService {
  private readonly api = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  listCreditNotes(): Observable<{ data: CreditNote[] }> { return this.http.get<{ data: CreditNote[] }>(`${this.api}/creditNotes`); }
  createCreditNote(payload: CreateCreditNotePayload): Observable<{ data: CreditNote }> { return this.http.post<{ data: CreditNote }>(`${this.api}/creditNotes`, payload); }

  listDamageEntries(): Observable<{ data: DamageEntry[] }> { return this.http.get<{ data: DamageEntry[] }>(`${this.api}/damageEntries`); }
  createDamageEntry(payload: CreateDamageEntryPayload): Observable<{ data: DamageEntry }> { return this.http.post<{ data: DamageEntry }>(`${this.api}/damageEntries`, payload); }

  listBankEntries(): Observable<{ data: BankEntry[] }> { return this.http.get<{ data: BankEntry[] }>(`${this.api}/bankEntries`); }
  createBankEntry(payload: Omit<BankEntry, 'id'>): Observable<{ data: BankEntry }> { return this.http.post<{ data: BankEntry }>(`${this.api}/bankEntries`, payload); }

  listAssets(): Observable<{ data: Asset[] }> { return this.http.get<{ data: Asset[] }>(`${this.api}/assets`); }
  createAsset(payload: Omit<Asset, 'id'>): Observable<{ data: Asset }> { return this.http.post<{ data: Asset }>(`${this.api}/assets`, payload); }

  listChatMessages(): Observable<{ data: ChatMessage[] }> { return this.http.get<{ data: ChatMessage[] }>(`${this.api}/chatMessages`); }
  createChatMessage(payload: Omit<ChatMessage, 'id'>): Observable<{ data: ChatMessage }> { return this.http.post<{ data: ChatMessage }>(`${this.api}/chatMessages`, payload); }

  getCompanySettings(): Observable<{ data: AppSettings }> { return this.http.get<{ data: AppSettings }>(`${this.api}/settings/company`); }
  saveCompanySettings(payload: AppSettings): Observable<{ data: AppSettings }> { return this.http.put<{ data: AppSettings }>(`${this.api}/settings/company`, payload); }
}
