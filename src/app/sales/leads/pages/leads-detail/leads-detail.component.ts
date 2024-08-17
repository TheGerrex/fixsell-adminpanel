import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { Lead } from 'src/app/sales/interfaces/leads.interface';
import { Communication } from 'src/app/sales/interfaces/leads.interface';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
export interface Product {
  // other properties...
  consumibles?: Consumible[]; // consumibles is optional and is an array of Consumible objects
}

@Component({
  selector: 'app-leads-detail',
  templateUrl: './leads-detail.component.html',
  styleUrls: ['./leads-detail.component.scss'],
})
export class LeadsDetailComponent implements OnInit, AfterViewInit {
  printer: Printer | null = null;
  consumable: Consumible | null = null;
  product: Product | null = null;
  lead!: Lead;
  typeOfProduct: string | null = null; // add this line
  displayedColumns: string[] = ['date', 'message', 'type', 'notes', 'action']; // add 'actions'
  isLoading = false;
  leadId: string = '';

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Communication>();

  constructor(
    private leadsService: LeadsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService
  ) { }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => this.loadData());
  }

  ngOnInit(): void {
    Promise.resolve().then(() => this.loadData());
  }


  loadData() {
    this.isLoading = true; // Set isLoading to true before fetching the data

    //get lead id from url
    this.leadId = this.route.snapshot.paramMap.get('id') ?? '';

    this.leadsService.getLead(this.leadId).subscribe((lead) => {
      // set lead
      this.lead = lead;
      this.dataSource = new MatTableDataSource(lead.communications);
      this.dataSource.paginator = this.paginator;
      //store type_of_product and product_interested
      this.typeOfProduct = lead.type_of_product;
      const productInterested = lead.product_interested;
      //search for product and get product details by name
      if (this.typeOfProduct) {
        this.leadsService
          .getProductByName(this.typeOfProduct, productInterested)
          .subscribe((product: Consumible) => {
            console.log(product);
            if (this.typeOfProduct === 'consumible') {
              this.product = { consumibles: [product] };
              this.consumable = product; // set consumable to a truthy value
            }
            if (this.typeOfProduct === 'printer') {
              this.product = {
                consumibles: [
                  {
                    id: '',
                    name: '',
                    brand: '',
                    price: 0,
                    currency: '',
                    sku: '',
                    origen: '',
                    volume: 0,
                    longDescription: '',
                    shortDescription: '',
                    compatibleModels: [],
                    color: '',
                    yield: 0,
                    img_url: [],
                    category: '',
                    printers: [product as unknown as Printer],
                    orderDetails: [],
                    counterparts: [],
                    counterpart: {} as Consumible,
                    deals: [],
                  },
                ],
              };
            }
            this.isLoading = false; // Set isLoading to false after receiving the data
          });
      } else {
        this.isLoading = false; // Set isLoading to false if there is no typeOfProduct
      }
    });
  }

  addCommunication(): void {
    // code to add a communication
    console.log(
      'navigating to: ',
      `sales/leads/${this.lead?.id}/communication/create`
    );
    this.router.navigate([`sales/leads/${this.lead?.id}/communication/create`]);
  }

  viewCommunication(communication: Communication) {
    // code to view the communication with the given id
    console.log(communication);
    console.log(communication.id);
    console.log(
      'navigating to: ',
      `sales/leads/communication/${communication.id}`
    );
    this.router.navigate([`sales/leads/communication/${communication.id}`]);
  }

  editCommunication(communication: Communication) {
    // code to edit the communication with the given id
    console.log(communication);
    console.log(communication.id);
    console.log(
      'navigating to: ',
      `sales/leads/communication/${communication.id}/edit`
    );
    this.router.navigate([
      `sales/leads/communication/${communication.id}/edit`,
    ]);
  }

  openConfirmDialogComunication(communication: Communication): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar esta comunicación?',
      message: 'La comunicación será eliminada permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (communication.id) {
          this.deleteCommunication(communication);
        }
      }
    });
  }

  deleteCommunication(communication: Communication) {
    if (communication.id) {
      this.leadsService.deleteCommunication(String(communication.id)).subscribe(
        (response) => {
          // Update communications
          if (this.lead && this.lead.communications) {
            this.lead.communications = this.lead.communications.filter(
              (c) => c.id !== communication.id
            );
          }

          this.toastService.showSuccess(
            'Comunicación eliminada con exito',
            'Aceptar'
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    }
  }

  openConfirmDialogLead(lead: Lead): void {
    console.log("entre!", lead);
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar este cliente potencial?',
      message: 'El cliente potencial será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (lead.id) {
          this.deleteLead(lead);
        }
      }
    });
  }

  deleteLead(lead: Lead) {
    if (lead.id) {
      this.leadsService.deleteLead(String(lead.id)).subscribe(
        (response) => {
          this.router.navigate(['/sales/leads']);
          this.toastService.showSuccess(
            'Cliente potencial eliminado con éxito',
            'Aceptar'
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    }
  }

  editLead(id: string) {
    this.router.navigate(['/sales/leads/', id, 'edit']);
  }

}
