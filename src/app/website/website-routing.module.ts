import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'printers',
    loadChildren: () =>
      import('./printer/printer.module').then((m) => m.PrinterModule),
  },
  {
    path: 'deals',
    loadChildren: () => import('./deal/deal.module').then((m) => m.DealModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebsiteRoutingModule {}
