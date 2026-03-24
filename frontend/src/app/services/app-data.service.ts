import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvoiceLine { description: string; size: string; qty: number; unitPrice: number; amount: number; }
export interface Invoice { id: string; invoiceNo: string; client: string; date: string; dueDate: string; amount: number; currency: string; status: string; taxPercent?: number; notes?: string; lines?: InvoiceLine[]; orgId?: string; }
export interface QuoteLine { description: string; size: string; qty: number; unitPrice: number; amount: number; }
export interface Quotation { id: string; quoteNo: string; client: string; date: string; validUntil: string; amount: number; currency: string; status: string; notes?: string; lines?: QuoteLine[]; orgId?: string; }
export interface PurchaseOrder { id?: string; poNo: string; date: string; deliveryDate?: string; vendor: string; items: string; total: number; currency: string; status: string; notes?: string; lines?: { description: string; size: string; qty: number; unitPrice: number; amount: number }[]; orgId?: string; }
export interface CreditNote { id: string; cnNo: string; invoiceNo: string; client: string; date: string; amount: number; currency: string; reason: string; status: string; }
export interface DamageEntry { id: string; refNo: string; date: string; itemName: string; sku: string; size: string; qty: number; reason: string; reportedBy: string; status: string; }
export interface SalesOrder { id: string; orderNo: string; date: string; client: string; items: string; total: number; currency: string; status: string; }
export interface PriceList { id: string; name: string; type: string; validFrom: string; items: number; status: string; }
export interface InventoryItem { id: string; sku: string; name: string; category: string; size: string; qty: number; unit: string; reorderLevel: number; status: string; orgId?: string; }
export interface Retainer { id: string; client: string; amount: number; currency: string; startDate: string; status: string; }
export interface StaffMember { id: string; name: string; role: string; department: string; joinDate: string; email: string; orgId?: string; }
export interface LeaveType { id: string; name: string; daysPerYear: number; carryOver: number; description: string; }
export interface LeaveRequest { id: string; employee: string; type: string; from: string; to: string; days: number; status: string; orgId?: string; }
export interface BankEntry { id: string; type: 'cheque' | 'deposit' | 'withdrawal' | 'transfer'; date: string; ref: string; description: string; amount: number; toFrom?: string; status?: string; }
export interface Asset { id: string; name: string; category: string; purchaseDate: string; value: number; status: string; orgId?: string; }
export interface TimesheetEntry { id: string; project: string; date: string; hours: number; task: string; billable: boolean; orgId?: string; }
export interface ProjectProfit { id: string; project: string; client: string; revenue: number; cost: number; profit: number; margin: string; }
export interface ChatMessage { id: string; from: string; text: string; time: string; }
export interface AppSettings { companyName: string; currency: string; }

const STORAGE_KEYS = {
  invoices: 'gcerp_invoices', quotations: 'gcerp_quotations', purchaseOrders: 'gcerp_purchaseOrders', creditNotes: 'gcerp_creditNotes',
  damageEntries: 'gcerp_damageEntries', salesOrders: 'gcerp_salesOrders', priceLists: 'gcerp_priceLists', inventory: 'gcerp_inventory',
  retainers: 'gcerp_retainers', staff: 'gcerp_staff', leaveTypes: 'gcerp_leaveTypes', leaveRequests: 'gcerp_leaveRequests',
  bankEntries: 'gcerp_bankEntries', assets: 'gcerp_assets', timesheets: 'gcerp_timesheets', projectProfit: 'gcerp_projectProfit',
  collaboration: 'gcerp_collaboration', settings: 'gcerp_settings'
};

@Injectable({ providedIn: 'root' })
export class AppDataService {
  private api = environment.apiBaseUrl;
  private orgId = '';
  private invoices: Invoice[] = [];
  private quotations: Quotation[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private creditNotes: CreditNote[] = [];
  private damageEntries: DamageEntry[] = [];
  private salesOrders: SalesOrder[] = [];
  private priceLists: PriceList[] = [];
  private inventory: InventoryItem[] = [];
  private retainers: Retainer[] = [];
  private staff: StaffMember[] = [];
  private leaveTypes: LeaveType[] = [];
  private leaveRequests: LeaveRequest[] = [];
  private bankEntries: BankEntry[] = [];
  private assets: Asset[] = [];
  private timesheets: TimesheetEntry[] = [];
  private projectProfit: ProjectProfit[] = [];
  private collaboration: ChatMessage[] = [];
  private settings: AppSettings = { companyName: 'Gift City Qatar', currency: 'AED' };

  constructor(private http: HttpClient) {
    this.loadAllLocal();
    this.seedIfEmpty();
    this.bootstrapFromBackend();
  }

  private async bootstrapFromBackend(): Promise<void> {
    try {
      await this.ensureOrgId();
      await Promise.all([this.syncInvoices(), this.syncQuotations(), this.syncPurchaseOrders(), this.syncInventory(), this.syncAssets(), this.syncStaff(), this.syncLeaveRequests(), this.syncTimesheets()]);
    } catch {
      // keep local data fallback if backend is not yet reachable
    }
  }

  private async ensureOrgId(): Promise<void> {
    if (this.orgId) return;
    try {
      const me = await firstValueFrom(this.http.get<{ data: { orgId: string } }>(`${this.api}/auth/me`, { withCredentials: true }));
      this.orgId = me.data.orgId;
      return;
    } catch {
      // If no active session, keep empty org and rely on local fallback.
    }
  }

  private entityUrl(entity: string): string { return `${this.api}/${entity}`; }

  private async list<T>(entity: string): Promise<T[]> {
    const result = await firstValueFrom(this.http.get<{ data: T[] }>(this.entityUrl(entity), { withCredentials: true }));
    return result.data || [];
  }

  private async create<T>(entity: string, payload: any): Promise<T | null> {
    try {
      const body = this.orgId ? { ...payload, orgId: this.orgId } : payload;
      const result = await firstValueFrom(this.http.post<{ data: T }>(this.entityUrl(entity), body, { withCredentials: true }));
      return result.data;
    } catch {
      return null;
    }
  }

  private async patch<T>(entity: string, id: string, payload: any): Promise<T | null> {
    try {
      const result = await firstValueFrom(this.http.patch<{ data: T }>(`${this.entityUrl(entity)}/${id}`, payload, { withCredentials: true }));
      return result.data;
    } catch {
      return null;
    }
  }

  private loadAllLocal(): void {
    try {
      const parse = (key: string, def: any) => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; };
      this.invoices = parse(STORAGE_KEYS.invoices, []); this.quotations = parse(STORAGE_KEYS.quotations, []); this.purchaseOrders = parse(STORAGE_KEYS.purchaseOrders, []);
      this.creditNotes = parse(STORAGE_KEYS.creditNotes, []); this.damageEntries = parse(STORAGE_KEYS.damageEntries, []); this.salesOrders = parse(STORAGE_KEYS.salesOrders, []);
      this.priceLists = parse(STORAGE_KEYS.priceLists, []); this.inventory = parse(STORAGE_KEYS.inventory, []); this.retainers = parse(STORAGE_KEYS.retainers, []);
      this.staff = parse(STORAGE_KEYS.staff, []); this.leaveTypes = parse(STORAGE_KEYS.leaveTypes, []); this.leaveRequests = parse(STORAGE_KEYS.leaveRequests, []);
      this.bankEntries = parse(STORAGE_KEYS.bankEntries, []); this.assets = parse(STORAGE_KEYS.assets, []); this.timesheets = parse(STORAGE_KEYS.timesheets, []);
      this.projectProfit = parse(STORAGE_KEYS.projectProfit, []); this.collaboration = parse(STORAGE_KEYS.collaboration, []);
      this.settings = parse(STORAGE_KEYS.settings, { companyName: 'Gift City Qatar', currency: 'AED' });
    } catch {}
  }

  private seedIfEmpty(): void {
    if (this.invoices.length === 0) this.invoices = [{ id: '1', invoiceNo: 'INV-GCQ-2026-001', client: 'Al Raha Events', date: '2026-02-20', dueDate: '2026-03-22', amount: 18500, currency: 'AED', status: 'Paid', lines: [] }];
    if (this.quotations.length === 0) this.quotations = [{ id: '1', quoteNo: 'QT-GCQ-2026-001', client: 'Al Raha Events', date: '2026-02-20', validUntil: '2026-03-20', amount: 18500, currency: 'AED', status: 'Accepted', lines: [] }];
    if (this.purchaseOrders.length === 0) this.purchaseOrders = [{ id: '1', poNo: 'PO-2026-001', date: '2026-02-26', vendor: 'Global Gifts Supplies', items: 'Promo items, packaging', total: 8500, currency: 'AED', status: 'Pending' }];
    if (this.inventory.length === 0) this.inventory = [{ id: '1', sku: 'GFT-001', name: 'Branded Pen Set', category: 'Gifts', size: 'Standard', qty: 1250, unit: 'pcs', reorderLevel: 200, status: 'In Stock' }];
    if (this.staff.length === 0) this.staff = [{ id: 'EMP001', name: 'Ahmed Hassan', role: 'Sales Manager', department: 'Sales', joinDate: '2024-01-15', email: 'ahmed@giftcity.qa' }];
    if (this.leaveTypes.length === 0) this.leaveTypes = [{ id: '1', name: 'Annual Leave', daysPerYear: 22, carryOver: 5, description: 'Paid annual leave' }];
    if (this.settings.companyName === '') this.settings = { companyName: 'Gift City Qatar', currency: 'AED' };
    this.persistAll();
  }

  private persistAll(): void {
    localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(this.invoices));
    localStorage.setItem(STORAGE_KEYS.quotations, JSON.stringify(this.quotations));
    localStorage.setItem(STORAGE_KEYS.purchaseOrders, JSON.stringify(this.purchaseOrders));
    localStorage.setItem(STORAGE_KEYS.creditNotes, JSON.stringify(this.creditNotes));
    localStorage.setItem(STORAGE_KEYS.damageEntries, JSON.stringify(this.damageEntries));
    localStorage.setItem(STORAGE_KEYS.salesOrders, JSON.stringify(this.salesOrders));
    localStorage.setItem(STORAGE_KEYS.priceLists, JSON.stringify(this.priceLists));
    localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(this.inventory));
    localStorage.setItem(STORAGE_KEYS.retainers, JSON.stringify(this.retainers));
    localStorage.setItem(STORAGE_KEYS.staff, JSON.stringify(this.staff));
    localStorage.setItem(STORAGE_KEYS.leaveTypes, JSON.stringify(this.leaveTypes));
    localStorage.setItem(STORAGE_KEYS.leaveRequests, JSON.stringify(this.leaveRequests));
    localStorage.setItem(STORAGE_KEYS.bankEntries, JSON.stringify(this.bankEntries));
    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(this.assets));
    localStorage.setItem(STORAGE_KEYS.timesheets, JSON.stringify(this.timesheets));
    localStorage.setItem(STORAGE_KEYS.projectProfit, JSON.stringify(this.projectProfit));
    localStorage.setItem(STORAGE_KEYS.collaboration, JSON.stringify(this.collaboration));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.settings));
  }

  private async syncInvoices() { const d = await this.list<Invoice>('invoices'); if (d.length) { this.invoices = d.map((x) => ({ ...x, date: String(x.date).slice(0, 10), dueDate: String(x.dueDate).slice(0, 10) })); this.persistAll(); } }
  private async syncQuotations() { const d = await this.list<Quotation>('quotations'); if (d.length) { this.quotations = d.map((x) => ({ ...x, date: String(x.date).slice(0, 10), validUntil: String(x.validUntil).slice(0, 10) })); this.persistAll(); } }
  private async syncPurchaseOrders() { const d = await this.list<PurchaseOrder>('purchaseOrders'); if (d.length) { this.purchaseOrders = d.map((x) => ({ ...x, date: String(x.date).slice(0, 10), deliveryDate: x.deliveryDate ? String(x.deliveryDate).slice(0, 10) : undefined })); this.persistAll(); } }
  private async syncInventory() { const d = await this.list<InventoryItem>('inventoryItems'); if (d.length) { this.inventory = d; this.persistAll(); } }
  private async syncAssets() { const d = await this.list<Asset>('assets'); if (d.length) { this.assets = d.map((x) => ({ ...x, purchaseDate: String(x.purchaseDate).slice(0, 10) })); this.persistAll(); } }
  private async syncStaff() { const d = await this.list<any>('staff'); if (d.length) { this.staff = d.map((x) => ({ ...x, joinDate: String(x.joinDate).slice(0, 10) })); this.persistAll(); } }
  private async syncLeaveRequests() { const d = await this.list<any>('leaveRequests'); if (d.length) { this.leaveRequests = d.map((x) => ({ ...x, from: String(x.fromDate || x.from).slice(0, 10), to: String(x.toDate || x.to).slice(0, 10) })); this.persistAll(); } }
  private async syncTimesheets() { const d = await this.list<TimesheetEntry>('timesheets'); if (d.length) { this.timesheets = d.map((x) => ({ ...x, date: String(x.date).slice(0, 10) })); this.persistAll(); } }

  getInvoices(): Invoice[] { return [...this.invoices]; }
  getQuotations(): Quotation[] { return [...this.quotations]; }
  getPurchaseOrders(): PurchaseOrder[] { return [...this.purchaseOrders]; }
  getCreditNotes(): CreditNote[] { return [...this.creditNotes]; }
  getDamageEntries(): DamageEntry[] { return [...this.damageEntries]; }
  getSalesOrders(): SalesOrder[] { return [...this.salesOrders]; }
  getPriceLists(): PriceList[] { return [...this.priceLists]; }
  getInventory(): InventoryItem[] { return [...this.inventory]; }
  getRetainers(): Retainer[] { return [...this.retainers]; }
  getStaff(): StaffMember[] { return [...this.staff]; }
  getLeaveTypes(): LeaveType[] { return [...this.leaveTypes]; }
  getLeaveRequests(): LeaveRequest[] { return [...this.leaveRequests]; }
  getBankEntries(): BankEntry[] { return [...this.bankEntries]; }
  getAssets(): Asset[] { return [...this.assets]; }
  getTimesheets(): TimesheetEntry[] { return [...this.timesheets]; }
  getProjectProfit(): ProjectProfit[] { return [...this.projectProfit]; }
  getCollaboration(): ChatMessage[] { return [...this.collaboration]; }
  getSettings(): AppSettings { return { ...this.settings }; }
  saveSettings(s: AppSettings): void { this.settings = s; this.persistAll(); }

  addInvoice(inv: Invoice): void { this.invoices.unshift(inv); this.persistAll(); this.create('invoices', { ...inv, date: new Date(inv.date), dueDate: new Date(inv.dueDate), lines: inv.lines || [] }); }
  updateInvoiceStatus(id: string, status: string): void { const i = this.invoices.find((x) => x.id === id); if (i) { i.status = status; this.persistAll(); this.patch('invoices', id, { status }); } }
  addQuotation(q: Quotation): void { this.quotations.unshift(q); this.persistAll(); this.create('quotations', { ...q, date: new Date(q.date), validUntil: new Date(q.validUntil), lines: q.lines || [] }); }
  updateQuotationStatus(id: string, status: string): void { const q = this.quotations.find((x) => x.id === id); if (q) { q.status = status; this.persistAll(); this.patch('quotations', id, { status }); } }
  addPurchaseOrder(po: PurchaseOrder): void { this.purchaseOrders.unshift(po); this.persistAll(); this.create('purchaseOrders', { ...po, date: new Date(po.date), deliveryDate: po.deliveryDate ? new Date(po.deliveryDate) : null, total: po.total, lines: po.lines || [] }); }
  updatePOStatus(poNo: string, status: string): void { const p = this.purchaseOrders.find((x) => x.poNo === poNo); if (p) { p.status = status; this.persistAll(); if (p.id) this.patch('purchaseOrders', p.id, { status }); } }
  addCreditNote(cn: CreditNote): void { this.creditNotes.unshift(cn); this.persistAll(); }
  addDamageEntry(d: DamageEntry): void { this.damageEntries.unshift(d); this.persistAll(); }
  getNextInvoiceNumber(): string { const max = this.invoices.reduce((m, i) => { const n = parseInt((i.invoiceNo || '').replace(/\D/g, ''), 10); return isNaN(n) ? m : Math.max(m, n); }, 0); return `INV-GCQ-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`; }
  getNextQuotationNumber(): string { const max = this.quotations.reduce((m, q) => { const n = parseInt((q.quoteNo || '').replace(/\D/g, ''), 10); return isNaN(n) ? m : Math.max(m, n); }, 0); return `QT-GCQ-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`; }
  getNextPONumber(): string { const max = this.purchaseOrders.reduce((m, p) => { const n = parseInt((p.poNo || '').replace(/\D/g, ''), 10); return isNaN(n) ? m : Math.max(m, n); }, 0); return `PO-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`; }
  getNextCreditNoteNumber(): string { const max = this.creditNotes.reduce((m, c) => { const n = parseInt((c.cnNo || '').replace(/\D/g, ''), 10); return isNaN(n) ? m : Math.max(m, n); }, 0); return `CN-GCQ-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`; }
  getNextDamageRef(): string { const max = this.damageEntries.reduce((m, d) => { const n = parseInt((d.refNo || '').replace(/\D/g, ''), 10); return isNaN(n) ? m : Math.max(m, n); }, 0); return `DMG-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`; }
  addSalesOrder(so: SalesOrder): void { this.salesOrders.unshift(so); this.persistAll(); }
  updateSalesOrderStatus(id: string, status: string): void { const s = this.salesOrders.find((x) => x.id === id); if (s) { s.status = status; this.persistAll(); } }
  addPriceList(pl: PriceList): void { this.priceLists.unshift(pl); this.persistAll(); }
  addInventoryItem(item: InventoryItem): void { this.inventory.unshift(item); this.persistAll(); this.create('inventoryItems', item); }
  updateInventoryItem(id: string, qty: number): void { const i = this.inventory.find((x) => x.id === id); if (i) { i.qty = qty; i.status = qty <= i.reorderLevel ? 'Low Stock' : 'In Stock'; this.persistAll(); this.patch('inventoryItems', id, { qty, status: i.status }); } }
  addRetainer(r: Retainer): void { this.retainers.unshift(r); this.persistAll(); }
  addStaff(s: StaffMember): void { this.staff.unshift(s); this.persistAll(); this.create('staff', { ...s, joinDate: new Date(s.joinDate) }); }
  addLeaveType(lt: LeaveType): void { this.leaveTypes.unshift(lt); this.persistAll(); }
  addLeaveRequest(lr: LeaveRequest): void { this.leaveRequests.unshift(lr); this.persistAll(); this.create('leaveRequests', { ...lr, fromDate: new Date(lr.from), toDate: new Date(lr.to) }); }
  updateLeaveRequestStatus(id: string, status: string): void { const l = this.leaveRequests.find((x) => x.id === id); if (l) { l.status = status; this.persistAll(); this.patch('leaveRequests', id, { status }); } }
  addBankEntry(be: BankEntry): void { this.bankEntries.unshift(be); this.persistAll(); }
  addAsset(a: Asset): void { this.assets.unshift(a); this.persistAll(); this.create('assets', { ...a, purchaseDate: new Date(a.purchaseDate) }); }
  addTimesheet(t: TimesheetEntry): void { this.timesheets.unshift(t); this.persistAll(); this.create('timesheets', { ...t, date: new Date(t.date) }); }
  addProjectProfit(p: ProjectProfit): void { this.projectProfit.unshift(p); this.persistAll(); this.create('projects', { name: p.project, client: p.client, revenue: p.revenue, cost: p.cost, status: 'Active' }); }
  addChatMessage(m: ChatMessage): void { this.collaboration.push(m); this.persistAll(); }
}
