import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ClientsListComponent } from './pages/clients-list/clients-list.component';
import { ClientDetailComponent } from './pages/client-detail/client-detail.component';
import { ClientCreateComponent } from './pages/client-create/client-create.component';
import { ClientEditComponent } from './pages/client-edit/client-edit.component';
import { RoleGuard } from '../auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user', 'sales'] },
    children: [
      {
        path: '',
        component: ClientsListComponent,
        canActivate: [RoleGuard],
        data: {
          allowedRoles: ['admin', 'user', 'sales'],
          breadcrumb: 'Clientes',
        },
      },
      {
        path: 'create',
        component: ClientCreateComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'sales'], breadcrumb: 'Crear' },
      },
      {
        path: ':id',
        component: ClientDetailComponent,
        canActivate: [RoleGuard],
        data: {
          allowedRoles: ['admin', 'user', 'sales'],
          breadcrumb: 'Cliente',
        },
      },
      {
        path: ':id/edit',
        component: ClientEditComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'sales'], breadcrumb: 'Editar' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientsRoutingModule {}
