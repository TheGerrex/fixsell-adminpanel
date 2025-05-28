import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';
import { ClientClassificationComponent } from './pages/client-classification/client-classification.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedPermissions: ['canConfigureSales'] },
    children: [
      {
        path: '',
        component: ClientClassificationComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canConfigureSales'],
          breadcrumb: 'Configuración',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigRoutingModule { }
