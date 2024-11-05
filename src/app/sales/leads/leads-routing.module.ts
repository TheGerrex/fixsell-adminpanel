// leads-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { LeadsListComponent } from './pages/leads-list/leads-list.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';
import { LeadsEditComponent } from './pages/leads-edit/leads-edit.component';
import { LeadsDetailComponent } from './pages/leads-detail/leads-detail.component';
import { LeadsCreateComponent } from './pages/leads-create/leads-create.component';
import { CommunicationDetailComponent } from './pages/communication-detail/communication-detail.component';
import { CommunicationCreateComponent } from './pages/communication-create/communication-create.component';
import { CommunicationEditComponent } from './pages/communication-edit/communication-edit.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    // Accessible by all authenticated users; no specific permissions required.
    data: { allowedPermissions: [] },
    children: [
      {
        path: '',
        component: LeadsListComponent,
        canActivate: [RoleGuard],
        data: { allowedPermissions: ['canViewLead'], breadcrumb: 'Leads' },
      },
      {
        path: 'create',
        component: LeadsCreateComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canCreateLead'],
          breadcrumb: 'Crear Lead',
        },
      },
      {
        path: ':id',
        component: LeadsDetailComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canViewLead'],
          breadcrumb: 'Detalle de Lead',
        },
      },
      {
        path: ':id/edit',
        component: LeadsEditComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canUpdateLead'],
          breadcrumb: 'Editar Lead',
        },
      },
      // Lead Communications Routes
      {
        path: 'communication/:id',
        component: CommunicationDetailComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canViewLeadCommunication'],
          breadcrumb: 'Detalle de Comunicación',
        },
      },
      {
        path: ':id/communication/create',
        component: CommunicationCreateComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canCreateLeadCommunication'],
          breadcrumb: 'Crear Comunicación',
        },
      },
      {
        path: 'communication/:id/edit',
        component: CommunicationEditComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canUpdateLeadCommunication'],
          breadcrumb: 'Editar Comunicación',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadsRoutingModule {}
