import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { IntroScreenComponent } from './components/intro-screen/intro-screen.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RoleGuard } from '../auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: IntroScreenComponent },
      // {
      //   path: 'users',
      //   component: UsersComponent,
      //   canActivate: [RoleGuard],
      //   data: { allowedRoles: ['admin'] },
      // },
      { path: 'settings', component: SettingsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
