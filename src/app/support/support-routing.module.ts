import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tickets',
    loadChildren: () =>
      import('./tickets/tickets.module').then((m) => m.TicketsModule),
  },
  //   {
  //     path: 'config',
  //   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportRoutingModule {}
