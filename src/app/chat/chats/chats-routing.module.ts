import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';
import { ChatsListComponent } from './pages/chats-list/chats-list.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user'] },
    children: [
      {
        path: '',
        component: ChatsListComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'leads' },
      },
      //   {
      //     path: 'create',
      //     component: LeadsCreateComponent,
      //     canActivate: [RoleGuard],
      //     data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Crear' },
      //   },
      //   {
      //     path: ':id',
      //     component: LeadsDetailComponent,
      //     canActivate: [RoleGuard],
      //     data: { allowedRoles: ['admin', 'user'], breadcrumb: 'leads' },
      //   },
      //   {
      //     path: ':id/edit',
      //     component: LeadsEditComponent,
      //     canActivate: [RoleGuard],
      //     data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Editar' },
      //   },
      //   {
      //     path: 'communication/:id',
      //     component: CommunicationDetailComponent,
      //     canActivate: [RoleGuard],
      //     data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Comunicación' },
      //   },
      //   {
      //     path: ':id/communication/create',
      //     component: CommunicationCreateComponent,
      //     canActivate: [RoleGuard],
      //     data: {
      //       allowedRoles: ['admin', 'user'],
      //       breadcrumb: 'Crear Comunicación',
      //     },
      //   },
      //   {
      //     path: 'communication/:id/edit',
      //     component: CommunicationEditComponent,
      //     canActivate: [RoleGuard],
      //     data: {
      //       allowedRoles: ['admin', 'user'],
      //       breadcrumb: 'Editar Comunicación',
      //     },
      //   },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatsRoutingModule {}
