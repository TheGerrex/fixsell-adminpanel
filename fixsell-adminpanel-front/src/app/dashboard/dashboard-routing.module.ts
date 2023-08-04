import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
//import printerregister
import { PrintersRegisterComponent } from './components/printers-register/printers-register.component';

const routes: Routes = [
  {
  path: '',
  component: DashboardLayoutComponent,
  
  children: [
     {path: 'printers-register', component: PrintersRegisterComponent}
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
