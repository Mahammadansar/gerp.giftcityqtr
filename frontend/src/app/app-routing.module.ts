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
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: BrokerDashboardComponent, canActivate: [AuthGuard], data: { permission: 'read:dashboard' } },
  { path: 'sales', component: SalesComponent, canActivate: [AuthGuard], data: { permission: 'read:sales' } },
  { path: 'purchasing', component: PurchasingComponent, canActivate: [AuthGuard], data: { permission: 'read:purchasing' } },
  { path: 'quotations', component: QuotationsComponent, canActivate: [AuthGuard], data: { permission: 'read:sales' } },
  { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard], data: { permission: 'read:inventory' } },
  { path: 'finance', component: FinanceComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'invoices', component: InvoicesComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'credit-note', component: CreditNoteComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'damage-section', component: DamageSectionComponent, canActivate: [AuthGuard], data: { permission: 'read:inventory' } },
  { path: 'daily-reports', component: DailyReportsComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'balance-sheet', component: BalanceSheetComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'bank-statement', component: BankStatementComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'profit-loss', component: ProfitLossComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'cash-flow', component: CashFlowComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'customers-ledger', component: CustomersLedgerComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'suppliers-ledger', component: SuppliersLedgerComponent, canActivate: [AuthGuard], data: { permission: 'read:finance' } },
  { path: 'staff-details', component: StaffDetailsComponent, canActivate: [AuthGuard], data: { permission: 'read:hr' } },
  { path: 'leave-establishment', component: LeaveEstablishmentComponent, canActivate: [AuthGuard], data: { permission: 'read:hr' } },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard], data: { permission: 'read:projects' } },
  { path: 'approvals', component: ApprovalsComponent, canActivate: [AuthGuard], data: { permission: 'read:approvals' } },
  { path: 'collaboration', component: CollaborationComponent, canActivate: [AuthGuard], data: { permission: 'read:projects' } },
  { path: 'assets', component: AssetsComponent, canActivate: [AuthGuard], data: { permission: 'read:settings' } },
  { path: 'vendor-portal', component: VendorPortalComponent, canActivate: [AuthGuard], data: { permission: 'read:purchasing' } },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { permission: 'read:settings' } },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
