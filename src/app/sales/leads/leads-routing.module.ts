import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { LeadsListComponent } from './pages/leads-list/leads-list.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user'] },
    children: [
      {
        path: '',
        component: LeadsListComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'leads' },
      },
      {
        path: 'create',
        component: LeadsListComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Crear' },
      },
      {
        path: ':id',
        component: LeadsListComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'leads' },
      },
      {
        path: ':id/edit',
        component: LeadsListComponent,
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
export class LeadsRoutingModule {}
