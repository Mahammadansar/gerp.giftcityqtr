import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    BrokerDashboardComponent,
    SalesComponent,
    PurchasingComponent,
    InventoryComponent,
    FinanceComponent,
    InvoicesComponent,
    QuotationsComponent,
    CreditNoteComponent,
    DamageSectionComponent,
    DailyReportsComponent,
    BalanceSheetComponent,
    BankStatementComponent,
    ProfitLossComponent,
    CashFlowComponent,
    CustomersLedgerComponent,
    SuppliersLedgerComponent,
    StaffDetailsComponent,
    LeaveEstablishmentComponent,
    ProjectsComponent,
    ApprovalsComponent,
    CollaborationComponent,
    AssetsComponent,
    VendorPortalComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbDropdownModule,
    PerfectScrollbarModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
