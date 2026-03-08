import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
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
    ProjectsComponent,
    ApprovalsComponent,
    CollaborationComponent,
    AssetsComponent,
    VendorPortalComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
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
