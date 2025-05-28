import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConfigRoutingModule } from './config-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ClientClassificationComponent } from './pages/client-classification/client-classification.component';
import { ClientBranchOfficeCRUDComponent } from './components/client-branch-office-crud/client-branch-office-crud.component';
import { ClientBusinessGroupCRUDComponent } from './components/client-business-group-crud/client-business-group-crud.component';
import { ClientBusinessLineCRUDComponent } from './components/client-business-line-crud/client-business-line-crud.component';
import { ClientCategoryCRUDComponent } from './components/client-category-crud/client-category-crud.component';
import { ClientCollectionZoneCRUDComponent } from './components/client-collection-zone-crud/client-collection-zone-crud.component';
import { SalesModule } from '../sales.module';
import { AddClientCategoryDialogComponent } from './components/dialogs/add-client-category-dialog/add-client-category-dialog.component';
import { EditClientCategoryDialogComponent } from './components/dialogs/edit-client-category-dialog/edit-client-category-dialog.component';
@NgModule({
  declarations: [
    LayoutPageComponent,
    ClientClassificationComponent,
    ClientBranchOfficeCRUDComponent,
    ClientBusinessGroupCRUDComponent,
    ClientBusinessLineCRUDComponent,
    ClientCategoryCRUDComponent,
    ClientCollectionZoneCRUDComponent,
    AddClientCategoryDialogComponent,
    EditClientCategoryDialogComponent,
  ],
  imports: [
    CommonModule,
    ConfigRoutingModule,
    SharedModule,
    SalesModule,
  ],
})
export class ConfigModule { }
