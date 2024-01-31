import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { PackageListComponent } from './pages/package-list/package-list.component';
import { PackageCreateComponent } from './pages/package-create/package-create.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedRoles: ['admin', 'user'] },
    children: [
      {
        path: '',
        component: PackageListComponent,
        canActivate: [RoleGuard],
        data: {
          allowedRoles: ['admin', 'user'],
          breadcrumb: 'paquetes',
        },
      },
      {
        path: 'create',
        component: PackageCreateComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Crear' },
      },
      {
        path: 'create/:id',
        component: PackageCreateComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Crear' },
      },
      //   {
      //     path: ':id',
      //     component: DealDetailComponent,
      //     canActivate: [RoleGuard],
      //     data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Deals' },
      //   },
      //   {
      //     path: ':id/edit',
      //     component: DealEditComponent,
      //     canActivate: [RoleGuard],
      //     data: { allowedRoles: ['admin', 'user'], breadcrumb: 'Editar' },
      //   },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackageRoutingModule {}
