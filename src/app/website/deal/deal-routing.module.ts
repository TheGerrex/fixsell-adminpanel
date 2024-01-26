import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { DealListComponent } from './pages/deal-list/deal-list.component';
import { DealDetailComponent } from './pages/deal-detail/deal-detail.component';
import { DealCreateComponent } from './pages/deal-create/deal-create.component';
import { DealEditComponent } from './pages/deal-edit/deal-edit.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user'] },
    children: [
      {
        path: '',
        component: DealListComponent,
        canActivate: [RoleGuard],
        data: {
          allowedRoles: ['admin', 'user'],
          breadcrumb: 'Deals',
        },
      },
      {
        path: 'create',
        component: DealCreateComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Crear' },
      },
      {
        path: 'create/:id',
        component: DealCreateComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Crear' },
      },
      {
        path: ':id',
        component: DealDetailComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Deals' },
      },
      {
        path: ':id/edit',
        component: DealEditComponent,
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
export class DealRoutingModule {}
