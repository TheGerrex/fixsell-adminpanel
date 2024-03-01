import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';
import { UserCreateComponent } from './pages/user-create/user-create.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user'] },
    children: [
      {
        path: '',
        component: UserListComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'usuario' },
      },
      {
        path: 'create',
        component: UserCreateComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin'], breadcrumb: 'crear' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
