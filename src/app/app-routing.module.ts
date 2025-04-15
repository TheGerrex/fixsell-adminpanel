// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isNotAuthenticatedGuard, isAuthenticatedGuard } from './auth/guards';
import { NavigationGuard } from './auth/guards/navigation.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [NavigationGuard, isAuthenticatedGuard],
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
    path: 'sales',
    canActivate: [NavigationGuard, isAuthenticatedGuard],
    data: { allowedPermissions: ['canViewLead'] },
    loadChildren: () =>
      import('./sales/sales.module').then((m) => m.SalesModule),
  },
  {
    path: 'clients',
    canActivate: [NavigationGuard, isAuthenticatedGuard],
    data: { allowedPermissions: ['canViewClient'] },
    loadChildren: () =>
      import('./sales/clients/clients.module').then((m) => m.ClientsModule),
  },
  {
    path: 'support',
    canActivate: [NavigationGuard, isAuthenticatedGuard],
    data: { allowedPermissions: ['canViewTicket'] },
    loadChildren: () =>
      import('./support/support.module').then((m) => m.SupportModule),
  },
  {
    path: 'users',
    canActivate: [NavigationGuard, isAuthenticatedGuard],
    data: { allowedPermissions: ['canViewUser'] },
    loadChildren: () =>
      import('./users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'chat',
    canActivate: [NavigationGuard, isAuthenticatedGuard],
    data: { allowedPermissions: ['canViewChat'] },
    loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
