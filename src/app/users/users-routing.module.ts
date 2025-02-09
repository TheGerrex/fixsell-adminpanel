import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'logs',
    loadChildren: () => import('./logs/logs.module').then((m) => m.LogsModule),
  },
  {
    path: 'config',
    loadChildren: () =>
      import('./config/config.module').then((m) => m.ConfigModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
