// events-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { EventDashboardComponent } from './pages/event-dashboard/event-dashboard.component';
import { CreateEventStepperComponent } from './components/create-event-stepper/create-event-stepper.component'; // Import the component
import { RoleGuard } from 'src/app/auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    data: { allowedPermissions: [] },
    children: [
      {
        path: '',
        component: EventDashboardComponent,
        canActivate: [RoleGuard],
        data: { allowedPermissions: ['canViewEvents'], breadcrumb: 'Eventos' },
      },
      {
        path: 'create',
        component: CreateEventStepperComponent,
        canActivate: [RoleGuard],
        data: {
          allowedPermissions: ['canCreateEvent'],
          breadcrumb: 'Crear Evento',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}
