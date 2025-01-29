import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { LogsListComponent } from './pages/logs-list/logs-list.component';
import { RoleGuard } from 'src/app/auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedPermissions: [] },
    children: [
      {
        path: '',
        component: LogsListComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canViewLogs'], // Specify required permissions
          breadcrumb: 'Activity Logs',
        },
      },
      // Add more routes related to logs if needed
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogsRoutingModule {}
