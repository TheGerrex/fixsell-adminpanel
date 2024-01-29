import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ConsumiblesListComponent } from './pages/consumibles-list/consumibles-list.component';
// import { PrinterDetailComponent } from './pages/printer-detail/printer-detail.component';
// import { PrinterCreateComponent } from './pages/printer-create/printer-create.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';
import { ConsumiblesCreateComponent } from './pages/consumibles-create/consumibles-create.component';
import { ConsumiblesEditComponent } from './pages/consumibles-edit/consumibles-edit.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user'] },
    children: [
      {
        path: '',
        component: ConsumiblesListComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Consumibles' },
      },
      {
        path: 'create',
        component: ConsumiblesCreateComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Crear' },
      },
      //   {
      //     path: ':id',
      //     component: PrinterDetailComponent,
      //     canActivate: [RoleGuard],
      //     data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Multifuncional' },
      //   },
      {
        path: ':id/edit',
        component: ConsumiblesEditComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Editar' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsumiblesRoutingModule {}
