import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isNotAuthenticatedGuard, isAuthenticatedGuard } from './auth/guards';
import { NavigationGuard } from './auth/guards/navigation.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [NavigationGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'website',
    canActivate: [NavigationGuard, isAuthenticatedGuard],
    loadChildren: () =>
      import('./website/website.module').then((m) => m.WebsiteModule),
  },
  {
    path: 'auth',
    canActivate: [NavigationGuard, isNotAuthenticatedGuard],
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'users',
    canActivate: [NavigationGuard, isAuthenticatedGuard],
    loadChildren: () =>
      import('./users/users.module').then((m) => m.UsersModule),
  },
  {
    path: '**',
    redirectTo: 'auth',
  },

  //{path:'login', component:LoginComponent},
  //{path:'printersregister', component:PrintersregisterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
