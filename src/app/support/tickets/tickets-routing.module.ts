import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';
import { TicketsDashboardComponent } from './pages/tickets-dashboard/tickets-dashboard.component';
import { TicketsListComponent } from './pages/tickets-list/tickets-list.component';
import { TicketsViewComponent } from './pages/tickets-view/tickets-view.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user'] },
    children: [
      {
        path: '',
        component: TicketsDashboardComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'usuario' },
      },
      {
        path: 'list',
        component: TicketsListComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'mi-tickets' },
      },
      //   {
      //     path: ':id/edit',
      //     component: UserEditComponent,
      //     canActivate: [RoleGuard],
      //     data: { allowedRoles: ['admin'], breadcrumb: 'editar' },
      //   },
      {
        path: ':id',
        component: TicketsViewComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'usuario' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketRoutingModule {}
