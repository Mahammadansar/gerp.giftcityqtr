import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrokerDashboardComponent } from './pages/dashboard/broker-dashboard.component';
import { SalesComponent } from './pages/sales/sales.component';
import { PurchasingComponent } from './pages/purchasing/purchasing.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { FinanceComponent } from './pages/finance/finance.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ApprovalsComponent } from './pages/approvals/approvals.component';
import { CollaborationComponent } from './pages/collaboration/collaboration.component';
import { AssetsComponent } from './pages/assets/assets.component';
import { VendorPortalComponent } from './pages/vendor-portal/vendor-portal.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { QuotationsComponent } from './pages/quotations/quotations.component';
import { CreditNoteComponent } from './pages/credit-note/credit-note.component';
import { DamageSectionComponent } from './pages/damage-section/damage-section.component';
import { DailyReportsComponent } from './pages/daily-reports/daily-reports.component';
import { BalanceSheetComponent } from './pages/balance-sheet/balance-sheet.component';
import { BankStatementComponent } from './pages/bank-statement/bank-statement.component';
import { ProfitLossComponent } from './pages/profit-loss/profit-loss.component';
import { CashFlowComponent } from './pages/cash-flow/cash-flow.component';
import { CustomersLedgerComponent } from './pages/customers-ledger/customers-ledger.component';
import { SuppliersLedgerComponent } from './pages/suppliers-ledger/suppliers-ledger.component';
import { StaffDetailsComponent } from './pages/staff-details/staff-details.component';
import { LeaveEstablishmentComponent } from './pages/leave-establishment/leave-establishment.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: BrokerDashboardComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'purchasing', component: PurchasingComponent },
  { path: 'quotations', component: QuotationsComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'finance', component: FinanceComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'credit-note', component: CreditNoteComponent },
  { path: 'damage-section', component: DamageSectionComponent },
  { path: 'daily-reports', component: DailyReportsComponent },
  { path: 'balance-sheet', component: BalanceSheetComponent },
  { path: 'bank-statement', component: BankStatementComponent },
  { path: 'profit-loss', component: ProfitLossComponent },
  { path: 'cash-flow', component: CashFlowComponent },
  { path: 'customers-ledger', component: CustomersLedgerComponent },
  { path: 'suppliers-ledger', component: SuppliersLedgerComponent },
  { path: 'staff-details', component: StaffDetailsComponent },
  { path: 'leave-establishment', component: LeaveEstablishmentComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'approvals', component: ApprovalsComponent },
  { path: 'collaboration', component: CollaborationComponent },
  { path: 'assets', component: AssetsComponent },
  { path: 'vendor-portal', component: VendorPortalComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
