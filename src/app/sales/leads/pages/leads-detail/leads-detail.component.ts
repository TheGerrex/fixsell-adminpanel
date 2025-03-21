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
import { Software } from 'src/app/website/interfaces/software.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Product {
  printers?: Printer[];
  softwares?: Software[];
  consumibles?: Consumible[];
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
  typeOfProduct: string | null = null;
  displayedColumns: string[] = ['date', 'message', 'type', 'action'];
  isLoading = false;
  leadId: string = '';

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Communication>();

  constructor(
    private leadsService: LeadsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    // We already load data in ngOnInit, no need for duplicate calls
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    // Get lead id from url
    this.leadId = this.route.snapshot.paramMap.get('id') ?? '';

    this.leadsService.getLead(this.leadId).subscribe({
      next: (lead) => {
        // Set lead
        this.lead = lead;
        this.dataSource = new MatTableDataSource(lead.communications);

        // Set paginator after data is loaded
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });

        // Store type_of_product and product_interested
        this.typeOfProduct = lead.type_of_product;
        const productInterested = lead.product_interested;

        // Search for product and get product details by name
        if (this.typeOfProduct && productInterested) {
          this.leadsService
            .getProductByName(this.typeOfProduct, productInterested)
            .pipe(
              catchError((error) => {
                console.error(
                  `Error loading ${this.typeOfProduct} product:`,
                  error,
                );

                // Create a fallback based on product type
                if (this.typeOfProduct === 'software') {
                  return of({
                    id: '0',
                    name: productInterested,
                    img_url: [],
                    description: 'No additional details available',
                    price: 0,
                    currency: 'MXN',
                    category: '',
                    tags: [],
                  });
                } else if (this.typeOfProduct === 'consumible') {
                  return of({
                    id: '0',
                    name: productInterested,
                    brand: '',
                    price: 0,
                    currency: 'MXN',
                    sku: '',
                    origen: '',
                    volume: 0,
                    longDescription: 'No additional details available',
                    shortDescription: '',
                    compatibleModels: [],
                    color: '',
                    yield: 0,
                    img_url: [],
                    category: '',
                    orderDetails: [],
                    counterparts: [],
                    counterpart: {} as Consumible,
                    deals: [],
                  });
                } else if (this.typeOfProduct === 'printer') {
                  return of({
                    id: '0',
                    model: productInterested,
                    brand: '',
                    price: 0,
                    currency: 'MXN',
                    longDescription: 'No additional details available',
                    shortDescription: '',
                    speed: '',
                    maxPrintSize: '',
                    paperSizes: [],
                    functions: [],
                    network: false,
                    wireless: false,
                    scan: false,
                    copy: false,
                    fax: false,
                    duplex: false,
                    color: false,
                    img_url: [],
                    category: '',
                    deals: [],
                  });
                } else {
                  this.toastService.showWarning(
                    `Producto no encontrado: ${productInterested}`,
                    'Aceptar',
                  );
                  return of(null);
                }
              }),
            )
            .subscribe({
              next: (product: any) => {
                if (!product) {
                  this.isLoading = false;
                  return;
                }

                console.log('Product details:', product);

                if (this.typeOfProduct === 'consumible') {
                  this.product = { consumibles: [product] };
                  this.consumable = product;
                } else if (this.typeOfProduct === 'printer') {
                  this.product = {
                    printers: [product],
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
                } else if (this.typeOfProduct === 'software') {
                  this.product = {
                    softwares: [
                      {
                        id: product.id || '0',
                        name: product.name || productInterested,
                        img_url: product.img_url || [],
                        description:
                          product.description || 'No description available',
                        price: product.price || 0,
                        currency: product.currency || 'MXN',
                        category: product.category || '',
                        tags: product.tags || [],
                      },
                    ],
                  };
                }

                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error processing product:', error);
                this.toastService.showError(
                  `Error cargando el producto ${productInterested}`,
                  'Cerrar',
                );
                this.isLoading = false;
              },
            });
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading lead:', error);
        this.toastService.showError(
          'Error cargando el cliente potencial',
          'Cerrar',
        );
        this.isLoading = false;
      },
    });
  }

  addCommunication(): void {
    console.log(
      'navigating to: ',
      `sales/leads/${this.lead?.id}/communication/create`,
    );
    this.router.navigate([`sales/leads/${this.lead?.id}/communication/create`]);
  }

  viewCommunication(communication: Communication) {
    console.log(communication);
    console.log(communication.id);
    console.log(
      'navigating to: ',
      `sales/leads/communication/${communication.id}`,
    );
    this.router.navigate([`sales/leads/communication/${communication.id}`]);
  }

  editCommunication(communication: Communication) {
    console.log(communication);
    console.log(communication.id);
    console.log(
      'navigating to: ',
      `sales/leads/communication/${communication.id}/edit`,
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
              (c) => c.id !== communication.id,
            );
            this.dataSource = new MatTableDataSource(this.lead.communications);
            this.dataSource.paginator = this.paginator;
          }

          this.toastService.showSuccess(
            'Comunicación eliminada con éxito',
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        },
      );
    }
  }

  openConfirmDialogLead(lead: Lead): void {
    console.log('opening delete dialog for lead:', lead);
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
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        },
      );
    }
  }

  editLead(id: string) {
    this.router.navigate(['/sales/leads/', id, 'edit']);
  }
}
