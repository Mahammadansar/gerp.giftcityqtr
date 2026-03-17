import { Injectable } from '@angular/core';

export interface InvoiceLine {
  description: string;
  size: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: string;
  taxPercent?: number;
  notes?: string;
  lines?: InvoiceLine[];
}

export interface QuoteLine {
  description: string;
  size: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Quotation {
  id: string;
  quoteNo: string;
  client: string;
  date: string;
  validUntil: string;
  amount: number;
  currency: string;
  status: string;
  notes?: string;
  lines?: QuoteLine[];
}

export interface PurchaseOrder {
  id?: string;
  poNo: string;
  date: string;
  deliveryDate?: string;
  vendor: string;
  items: string;
  total: number;
  currency: string;
  status: string;
  notes?: string;
  lines?: { description: string; size: string; qty: number; unitPrice: number; amount: number }[];
}

export interface CreditNote {
  id: string;
  cnNo: string;
  invoiceNo: string;
  client: string;
  date: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
}

export interface DamageEntry {
  id: string;
  refNo: string;
  date: string;
  itemName: string;
  sku: string;
  size: string;
  qty: number;
  reason: string;
  reportedBy: string;
  status: string;
}

export interface SalesOrder {
  id: string;
  orderNo: string;
  date: string;
  client: string;
  items: string;
  total: number;
  currency: string;
  status: string;
}

export interface PriceList {
  id: string;
  name: string;
  type: string;
  validFrom: string;
  items: number;
  status: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  size: string;
  qty: number;
  unit: string;
  reorderLevel: number;
  status: string;
}

export interface Retainer {
  id: string;
  client: string;
  amount: number;
  currency: string;
  startDate: string;
  status: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  joinDate: string;
  email: string;
}

export interface LeaveType {
  id: string;
  name: string;
  daysPerYear: number;
  carryOver: number;
  description: string;
}

export interface LeaveRequest {
  id: string;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: string;
}

export interface BankEntry {
  id: string;
  type: 'cheque' | 'deposit' | 'withdrawal' | 'transfer';
  date: string;
  ref: string;
  description: string;
  amount: number;
  toFrom?: string;
  status?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  value: number;
  status: string;
}

export interface TimesheetEntry {
  id: string;
  project: string;
  date: string;
  hours: number;
  task: string;
  billable: boolean;
}

export interface ProjectProfit {
  id: string;
  project: string;
  client: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  time: string;
}

export interface AppSettings {
  companyName: string;
  currency: string;
}

const STORAGE_KEYS = {
  invoices: 'gcerp_invoices',
  quotations: 'gcerp_quotations',
  purchaseOrders: 'gcerp_purchaseOrders',
  creditNotes: 'gcerp_creditNotes',
  damageEntries: 'gcerp_damageEntries',
  salesOrders: 'gcerp_salesOrders',
  priceLists: 'gcerp_priceLists',
  inventory: 'gcerp_inventory',
  retainers: 'gcerp_retainers',
  staff: 'gcerp_staff',
  leaveTypes: 'gcerp_leaveTypes',
  leaveRequests: 'gcerp_leaveRequests',
  bankEntries: 'gcerp_bankEntries',
  assets: 'gcerp_assets',
  timesheets: 'gcerp_timesheets',
  projectProfit: 'gcerp_projectProfit',
  collaboration: 'gcerp_collaboration',
  settings: 'gcerp_settings'
};

@Injectable({ providedIn: 'root' })
export class AppDataService {
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

  constructor() {
    this.loadAll();
    this.seedIfEmpty();
  }

  private loadAll(): void {
    try {
      const parse = (key: string, def: any) => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; };
      this.invoices = parse(STORAGE_KEYS.invoices, []);
      this.quotations = parse(STORAGE_KEYS.quotations, []);
      this.purchaseOrders = parse(STORAGE_KEYS.purchaseOrders, []);
      this.creditNotes = parse(STORAGE_KEYS.creditNotes, []);
      this.damageEntries = parse(STORAGE_KEYS.damageEntries, []);
      this.salesOrders = parse(STORAGE_KEYS.salesOrders, []);
      this.priceLists = parse(STORAGE_KEYS.priceLists, []);
      this.inventory = parse(STORAGE_KEYS.inventory, []);
      this.retainers = parse(STORAGE_KEYS.retainers, []);
      this.staff = parse(STORAGE_KEYS.staff, []);
      this.leaveTypes = parse(STORAGE_KEYS.leaveTypes, []);
      this.leaveRequests = parse(STORAGE_KEYS.leaveRequests, []);
      this.bankEntries = parse(STORAGE_KEYS.bankEntries, []);
      this.assets = parse(STORAGE_KEYS.assets, []);
      this.timesheets = parse(STORAGE_KEYS.timesheets, []);
      this.projectProfit = parse(STORAGE_KEYS.projectProfit, []);
      this.collaboration = parse(STORAGE_KEYS.collaboration, []);
      this.settings = parse(STORAGE_KEYS.settings, { companyName: 'Gift City Qatar', currency: 'AED' });
    } catch {
      this.invoices = []; this.quotations = []; this.purchaseOrders = []; this.creditNotes = []; this.damageEntries = [];
      this.salesOrders = []; this.priceLists = []; this.inventory = []; this.retainers = []; this.staff = [];
      this.leaveTypes = []; this.leaveRequests = []; this.bankEntries = []; this.assets = [];
      this.timesheets = []; this.projectProfit = []; this.collaboration = [];
      this.settings = { companyName: 'Gift City Qatar', currency: 'AED' };
    }
  }

  private seedIfEmpty(): void {
    if (this.invoices.length === 0) {
      this.invoices = [
        { id: '1', invoiceNo: 'INV-GCQ-2026-001', client: 'Al Raha Events', date: '2026-02-20', dueDate: '2026-03-22', amount: 18500, currency: 'AED', status: 'Paid', lines: [] },
        { id: '2', invoiceNo: 'INV-GCQ-2026-002', client: 'Gulf Advertising LLC', date: '2026-02-22', dueDate: '2026-03-24', amount: 42000, currency: 'AED', status: 'Sent', lines: [] },
        { id: '3', invoiceNo: 'INV-GCQ-2026-003', client: 'Corporate Gifts Co', date: '2026-02-24', dueDate: '2026-03-26', amount: 12500, currency: 'AED', status: 'Draft', lines: [] }
      ];
      this.persistInvoices();
    }
    if (this.quotations.length === 0) {
      this.quotations = [
        { id: '1', quoteNo: 'QT-GCQ-2026-001', client: 'Al Raha Events', date: '2026-02-20', validUntil: '2026-03-20', amount: 18500, currency: 'AED', status: 'Accepted', lines: [] },
        { id: '2', quoteNo: 'QT-GCQ-2026-002', client: 'Gulf Advertising LLC', date: '2026-02-22', validUntil: '2026-03-22', amount: 42000, currency: 'AED', status: 'Sent', lines: [] }
      ];
      this.persistQuotations();
    }
    if (this.purchaseOrders.length === 0) {
      this.purchaseOrders = [
        { poNo: 'PO-2026-001', date: '2026-02-26', vendor: 'Global Gifts Supplies', items: 'Promo items, packaging', total: 8500, currency: 'AED', status: 'Pending' },
        { poNo: 'PO-2026-002', date: '2026-02-25', vendor: 'Print Masters LLC', items: 'Brochures, flyers', total: 12000, currency: 'AED', status: 'Approved' }
      ];
      this.persistPO();
    }
    if (this.creditNotes.length === 0) {
      this.creditNotes = [
        { id: '1', cnNo: 'CN-GCQ-2026-001', invoiceNo: 'INV-GCQ-2026-001', client: 'Al Raha Events', date: '2026-02-21', amount: 2500, currency: 'AED', reason: 'Return - damaged items', status: 'Applied' }
      ];
      this.persistCreditNotes();
    }
    if (this.damageEntries.length === 0) {
      this.damageEntries = [
        { id: '1', refNo: 'DMG-2026-001', date: '2026-02-24', itemName: 'Promo Tote Bag', sku: 'GFT-003', size: 'Large', qty: 5, reason: 'Print defect', reportedBy: 'Warehouse', status: 'Written off' }
      ];
      this.persistDamage();
    }
    if (this.salesOrders.length === 0) {
      this.salesOrders = [
        { id: '1', orderNo: 'SO-2026-001', date: '2026-02-25', client: 'Al Raha Events', items: 'Promo gifts', total: 18500, currency: 'AED', status: 'Confirmed' },
        { id: '2', orderNo: 'SO-2026-002', date: '2026-02-24', client: 'Gulf Advertising LLC', items: 'Banners', total: 42000, currency: 'AED', status: 'Delivered' }
      ];
      this.persistSalesOrders();
    }
    if (this.priceLists.length === 0) {
      this.priceLists = [
        { id: '1', name: 'Standard Gift Catalog 2026', type: 'Gifts', validFrom: '2026-01-01', items: 120, status: 'Active' },
        { id: '2', name: 'Advertisement Print Rates', type: 'Print', validFrom: '2026-01-01', items: 45, status: 'Active' }
      ];
      this.persistPriceLists();
    }
    if (this.inventory.length === 0) {
      this.inventory = [
        { id: '1', sku: 'GFT-001', name: 'Branded Pen Set', category: 'Gifts', size: 'Standard', qty: 1250, unit: 'pcs', reorderLevel: 200, status: 'In Stock' },
        { id: '2', sku: 'GFT-002', name: 'Corporate Diary 2026', category: 'Gifts', size: 'A5', qty: 890, unit: 'pcs', reorderLevel: 300, status: 'In Stock' },
        { id: '3', sku: 'PRM-001', name: 'Roll-up Banner', category: 'Print', size: '85x200 cm', qty: 45, unit: 'pcs', reorderLevel: 20, status: 'In Stock' }
      ];
      this.persistInventory();
    }
    if (this.retainers.length === 0) {
      this.retainers = [
        { id: '1', client: 'Al Raha Events', amount: 5000, currency: 'AED', startDate: '2026-01-01', status: 'Active' },
        { id: '2', client: 'Gulf Advertising LLC', amount: 10000, currency: 'AED', startDate: '2025-06-01', status: 'Active' }
      ];
      this.persistRetainers();
    }
    if (this.staff.length === 0) {
      this.staff = [
        { id: 'EMP001', name: 'Ahmed Hassan', role: 'Sales Manager', department: 'Sales', joinDate: '2024-01-15', email: 'ahmed@giftcity.qa' },
        { id: 'EMP002', name: 'Sara Mohammed', role: 'Accountant', department: 'Finance', joinDate: '2024-03-01', email: 'sara@giftcity.qa' }
      ];
      this.persistStaff();
    }
    if (this.leaveTypes.length === 0) {
      this.leaveTypes = [
        { id: '1', name: 'Annual Leave', daysPerYear: 22, carryOver: 5, description: 'Paid annual leave' },
        { id: '2', name: 'Sick Leave', daysPerYear: 15, carryOver: 0, description: 'Medical leave' }
      ];
      this.persistLeaveTypes();
    }
    if (this.leaveRequests.length === 0) {
      this.leaveRequests = [
        { id: '1', employee: 'Ahmed Hassan', type: 'Annual Leave', from: '2026-03-10', to: '2026-03-15', days: 5, status: 'Approved' }
      ];
      this.persistLeaveRequests();
    }
    if (this.bankEntries.length === 0) {
      this.bankEntries = [
        { id: '1', type: 'cheque', date: '2026-02-26', ref: 'CHQ-1001', description: 'Print Masters LLC', amount: 12000, status: 'Cleared' },
        { id: '2', type: 'deposit', date: '2026-02-27', ref: 'DEP-001', description: 'Al Raha Events', amount: 18500 }
      ];
      this.persistBankEntries();
    }
    if (this.assets.length === 0) {
      this.assets = [
        { id: '1', name: 'Office Equipment', category: 'IT', purchaseDate: '2024-01-01', value: 25000, status: 'Active' }
      ];
      this.persistAssets();
    }
    if (this.timesheets.length === 0) {
      this.timesheets = [
        { id: '1', project: 'Expo 2026 Campaign', date: '2026-02-26', hours: 8, task: 'Design', billable: true }
      ];
      this.persistTimesheets();
    }
    if (this.projectProfit.length === 0) {
      this.projectProfit = [
        { id: '1', project: 'Expo 2026 Campaign', client: 'Expo 2026 Pavilion', revenue: 68000, cost: 42000, profit: 26000, margin: '38%' }
      ];
      this.persistProjectProfit();
    }
    if (this.collaboration.length === 0) {
      this.collaboration = [
        { id: '1', from: 'Admin', text: 'Welcome to Gift City Qatar ERP.', time: new Date().toISOString() }
      ];
      this.persistCollaboration();
    }
  }

  private persistInvoices(): void { localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(this.invoices)); }
  private persistQuotations(): void { localStorage.setItem(STORAGE_KEYS.quotations, JSON.stringify(this.quotations)); }
  private persistPO(): void { localStorage.setItem(STORAGE_KEYS.purchaseOrders, JSON.stringify(this.purchaseOrders)); }
  private persistCreditNotes(): void { localStorage.setItem(STORAGE_KEYS.creditNotes, JSON.stringify(this.creditNotes)); }
  private persistDamage(): void { localStorage.setItem(STORAGE_KEYS.damageEntries, JSON.stringify(this.damageEntries)); }
  private persistSalesOrders(): void { localStorage.setItem(STORAGE_KEYS.salesOrders, JSON.stringify(this.salesOrders)); }
  private persistPriceLists(): void { localStorage.setItem(STORAGE_KEYS.priceLists, JSON.stringify(this.priceLists)); }
  private persistInventory(): void { localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(this.inventory)); }
  private persistRetainers(): void { localStorage.setItem(STORAGE_KEYS.retainers, JSON.stringify(this.retainers)); }
  private persistStaff(): void { localStorage.setItem(STORAGE_KEYS.staff, JSON.stringify(this.staff)); }
  private persistLeaveTypes(): void { localStorage.setItem(STORAGE_KEYS.leaveTypes, JSON.stringify(this.leaveTypes)); }
  private persistLeaveRequests(): void { localStorage.setItem(STORAGE_KEYS.leaveRequests, JSON.stringify(this.leaveRequests)); }
  private persistBankEntries(): void { localStorage.setItem(STORAGE_KEYS.bankEntries, JSON.stringify(this.bankEntries)); }
  private persistAssets(): void { localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(this.assets)); }
  private persistTimesheets(): void { localStorage.setItem(STORAGE_KEYS.timesheets, JSON.stringify(this.timesheets)); }
  private persistProjectProfit(): void { localStorage.setItem(STORAGE_KEYS.projectProfit, JSON.stringify(this.projectProfit)); }
  private persistCollaboration(): void { localStorage.setItem(STORAGE_KEYS.collaboration, JSON.stringify(this.collaboration)); }
  private persistSettings(): void { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.settings)); }

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
  saveSettings(s: AppSettings): void { this.settings = s; this.persistSettings(); }

  addInvoice(inv: Invoice): void {
    this.invoices.unshift(inv);
    this.persistInvoices();
  }

  updateInvoiceStatus(id: string, status: string): void {
    const i = this.invoices.find(x => x.id === id);
    if (i) { i.status = status; this.persistInvoices(); }
  }

  addQuotation(q: Quotation): void {
    this.quotations.unshift(q);
    this.persistQuotations();
  }

  updateQuotationStatus(id: string, status: string): void {
    const q = this.quotations.find(x => x.id === id);
    if (q) { q.status = status; this.persistQuotations(); }
  }

  addPurchaseOrder(po: PurchaseOrder): void {
    this.purchaseOrders.unshift(po);
    this.persistPO();
  }

  updatePOStatus(poNo: string, status: string): void {
    const p = this.purchaseOrders.find(x => x.poNo === poNo);
    if (p) { p.status = status; this.persistPO(); }
  }

  addCreditNote(cn: CreditNote): void {
    this.creditNotes.unshift(cn);
    this.persistCreditNotes();
  }

  addDamageEntry(d: DamageEntry): void {
    this.damageEntries.unshift(d);
    this.persistDamage();
  }

  getNextInvoiceNumber(): string {
    const max = this.invoices.reduce((m, i) => {
      const n = parseInt((i.invoiceNo || '').replace(/\D/g, ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const next = max + 1;
    const year = new Date().getFullYear();
    return `INV-GCQ-${year}-${String(next).padStart(3, '0')}`;
  }

  getNextQuotationNumber(): string {
    const max = this.quotations.reduce((m, q) => {
      const n = parseInt((q.quoteNo || '').replace(/\D/g, ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const next = max + 1;
    const year = new Date().getFullYear();
    return `QT-GCQ-${year}-${String(next).padStart(3, '0')}`;
  }

  getNextPONumber(): string {
    const max = this.purchaseOrders.reduce((m, p) => {
      const n = parseInt((p.poNo || '').replace(/\D/g, ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const next = max + 1;
    const year = new Date().getFullYear();
    return `PO-${year}-${String(next).padStart(3, '0')}`;
  }

  getNextCreditNoteNumber(): string {
    const max = this.creditNotes.reduce((m, c) => {
      const n = parseInt((c.cnNo || '').replace(/\D/g, ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const next = max + 1;
    const year = new Date().getFullYear();
    return `CN-GCQ-${year}-${String(next).padStart(3, '0')}`;
  }

  getNextDamageRef(): string {
    const max = this.damageEntries.reduce((m, d) => {
      const n = parseInt((d.refNo || '').replace(/\D/g, ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const next = max + 1;
    const year = new Date().getFullYear();
    return `DMG-${year}-${String(next).padStart(3, '0')}`;
  }

  addSalesOrder(so: SalesOrder): void { this.salesOrders.unshift(so); this.persistSalesOrders(); }
  updateSalesOrderStatus(id: string, status: string): void {
    const s = this.salesOrders.find(x => x.id === id);
    if (s) { s.status = status; this.persistSalesOrders(); }
  }
  addPriceList(pl: PriceList): void { this.priceLists.unshift(pl); this.persistPriceLists(); }
  addInventoryItem(item: InventoryItem): void { this.inventory.unshift(item); this.persistInventory(); }
  updateInventoryItem(id: string, qty: number): void {
    const i = this.inventory.find(x => x.id === id);
    if (i) { i.qty = qty; i.status = qty <= i.reorderLevel ? 'Low Stock' : 'In Stock'; this.persistInventory(); }
  }
  addRetainer(r: Retainer): void { this.retainers.unshift(r); this.persistRetainers(); }
  addStaff(s: StaffMember): void { this.staff.unshift(s); this.persistStaff(); }
  addLeaveType(lt: LeaveType): void { this.leaveTypes.unshift(lt); this.persistLeaveTypes(); }
  addLeaveRequest(lr: LeaveRequest): void { this.leaveRequests.unshift(lr); this.persistLeaveRequests(); }
  updateLeaveRequestStatus(id: string, status: string): void {
    const l = this.leaveRequests.find(x => x.id === id);
    if (l) { l.status = status; this.persistLeaveRequests(); }
  }
  addBankEntry(be: BankEntry): void { this.bankEntries.unshift(be); this.persistBankEntries(); }
  addAsset(a: Asset): void { this.assets.unshift(a); this.persistAssets(); }
  addTimesheet(t: TimesheetEntry): void { this.timesheets.unshift(t); this.persistTimesheets(); }
  addProjectProfit(p: ProjectProfit): void { this.projectProfit.unshift(p); this.persistProjectProfit(); }
  addChatMessage(m: ChatMessage): void { this.collaboration.push(m); this.persistCollaboration(); }
}
