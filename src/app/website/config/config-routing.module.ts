import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';
import { ConfigTabsComponent } from './components/config-tabs/config-tabs.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedPermissions: ['canConfigureWebsite'] },
    children: [
      {
        path: '',
        component: ConfigTabsComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canConfigureWebsite'],
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
export class ConfigRoutingModule {}
