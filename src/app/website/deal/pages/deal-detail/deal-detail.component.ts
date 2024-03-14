import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Printer } from '../../../interfaces/printer.interface';
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
import { Deal } from 'src/app/website/interfaces/deal.interface';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  deal: Deal | null = null;
  isLoadingData = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dealService: DealService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.isLoadingData = true;
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.dealService.getDeal(id).subscribe((deal) => {
          this.deal = deal;
          this.isLoadingData = false;
        });
      }
    });

    console.log(this.deal);
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

  openConfirmDialog(deal: Deal): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar esta promoción?',
      message: 'La promoción será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (deal.id){
            this.deleteDeal(deal)
        }
        
      }
    });
  }

  deleteDeal(deal: Deal) {
  if (deal.id){
    this.dealService.deleteDealById(deal.id).subscribe(
      (response) => {
        this.toastService.showSuccess('Promoción eliminado con exito', 'Aceptar');
        this.router.navigateByUrl('website/deals');
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      }
      ); 
    }
  }
}
