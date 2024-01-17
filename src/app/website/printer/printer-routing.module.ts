import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { PrinterListComponent } from './pages/printer-list/printer-list.component';
import { PrinterDetailComponent } from './pages/printer-detail/printer-detail.component';
import { PrinterCreateComponent } from './pages/printer-create/printer-create.component';
import { PrinterEditComponent } from './pages/printer-edit/printer-edit.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user'] },
    children: [
      {
        path: '',
        component: PrinterListComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'] },
      },
      {
        path: 'create',
        component: PrinterCreateComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'] },
      },
      {
        path: ':id',
        component: PrinterDetailComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'] },
      },
      {
        path: ':id/edit',
        component: PrinterEditComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'] },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrinterRoutingModule { }
