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
const routes: Routes = [
  {
    path: '',
    redirectTo: 'intro-screen', // Add redirect route to intro-screen
    pathMatch: 'full',
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'intro-screen', component: IntroScreenComponent },
      { path: 'printerscrud', component: PrinterscrudComponent },
      { path: 'printers-register', component: PrintersRegisterComponent },
      { path: 'edit-printer', component: EditPrinterComponent },
      { path: 'users', component: UsersComponent },
      { path: 'users-table', component: UsersTableComponent },
      { path: 'users-edit', component: UserEditComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
