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

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: BrokerDashboardComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'purchasing', component: PurchasingComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'finance', component: FinanceComponent },
  { path: 'invoices', component: InvoicesComponent },
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
