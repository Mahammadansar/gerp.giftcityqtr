// Legacy shared interfaces retained for compatibility.
// Runtime data is now sourced from backend APIs.

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
