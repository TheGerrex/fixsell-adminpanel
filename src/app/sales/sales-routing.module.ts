import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'leads',
    loadChildren: () =>
      import('./leads/leads.module').then((m) => m.LeadsModule),
  },
  {
    path: 'clients',
    data: { allowedPermissions: ['canViewClient'] },
    loadChildren: () =>
      import('./clients/clients.module').then((m) => m.ClientsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesRoutingModule { }
