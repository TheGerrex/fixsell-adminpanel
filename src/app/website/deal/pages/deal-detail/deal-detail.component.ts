import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Deal, Printer } from '../../../interfaces/printer.interface';
import { DealService } from '../../services/deal.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { startWith, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  deal: Deal | null = null;
  isLoadingForm = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private dealService: DealService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.dealService.getDeal(id).subscribe((deal) => {
          this.deal = deal;
        });
      }
    });
  }

  navigateToEditDeal(deal: Deal) {
    this.router.navigate(['/website', 'deals', deal.id, 'edit']);
  }
  navigateToCreatePrinter() {
    this.router.navigate(['/website', 'printers', 'create']);
  }
  navigateToSeePrinter(id: string) {
    this.router.navigate(['/website/printers', id]);
  }
  navigateToEditPrinter(id: string) {
    this.router.navigate([`/website/printers/${id}/edit`]);
  }
  
  // openConfirmDialog(consumableId: string): void {
  //   const dialogConfig = new MatDialogConfig();

  //   dialogConfig.disableClose = true;
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.data = {
  //     title: 'Estas seguro de querer eliminar esta consumible?',
  //     message: 'El consumible sera eliminado permanentemente.',
  //     buttonText: {
  //       ok: 'Eliminar',
  //       cancel: 'Cancelar',
  //     },
  //   };

  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  //   dialogRef.afterClosed().subscribe((result: any) => {
  //     if (result) {
  //       this.deletePrinter(consumableId)
  //     }
  //   });
  // }

  // deletePrinter(id: string): void {
  //   this.consumiblesService.deleteConsumible(id).subscribe(
  //     (response) => {
  //       // this.product.consumibles = this.product.consumibles.filter((consumible: Consumible) => consumible.id !== id);
  //       this.toastService.showSuccess('Consumible eliminado con exito', 'Aceptar');
  //     },
  //     (error) => {
  //       this.toastService.showError(error.error.message, 'Cerrar');
  //     }
  //   );
    
  // }
}
