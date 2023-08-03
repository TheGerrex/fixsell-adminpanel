import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PrintersregisterComponent } from './printersregister/printersregister.component';

const routes: Routes = [
  {path:'login', component:LoginComponent},
  {path:'printersregister', component:PrintersregisterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
