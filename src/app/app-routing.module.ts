import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isNotAuthenticatedGuard, isAuthenticatedGuard } from './auth/guards';

const routes: Routes = [
  
  {
    path:'auth',
    //guards
    canActivate:[ isNotAuthenticatedGuard ],
    loadChildren:()=>import('./auth/auth.module').then(m=>m.AuthModule)
  },
  {
    path:'dashboard',
    canActivate:[ isAuthenticatedGuard ],

    loadChildren:()=>import('./dashboard/dashboard.module').then(m=>m.DashboardModule)
  },
  {
    path:'website',
    canActivate:[ isAuthenticatedGuard ],
    loadChildren:()=>import('./website/website.module').then(m=>m.WebsiteModule)
  },
  {
    path:'**',
    redirectTo:'auth'
  },
  
  //{path:'login', component:LoginComponent},
  //{path:'printersregister', component:PrintersregisterComponent}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
