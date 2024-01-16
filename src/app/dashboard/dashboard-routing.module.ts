import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
//import printerregister
import { PrintersRegisterComponent } from './components/printers-register/printers-register.component';
import { IntroScreenComponent } from './components/intro-screen/intro-screen.component';
import { PrinterscrudComponent } from './components/printerscrud/printerscrud.component';
import { EditPrinterComponent } from './components/edit-printer/edit-printer.component';
import { UsersComponent } from './components/users/users.component';
import { UsersTableComponent } from './components/users-create/users-table.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RoleGuard } from '../auth/guards/role.guard';

const routes: Routes = [

  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: IntroScreenComponent },
      {
        path: 'printerscrud',
        component: PrinterscrudComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin', 'user'] },
      },
      {
        path: 'printers-register',
        component: PrintersRegisterComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin'] },
      },
      {
        path: 'edit-printer',
        component: EditPrinterComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin'] },
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin'] },
      },
      {
        path: 'users-table',
        component: UsersTableComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin'] },
      },
      {
        path: 'users-edit',
        component: UserEditComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin'] },
      },
      { path: 'settings', component: SettingsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
