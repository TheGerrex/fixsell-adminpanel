import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Deal } from 'src/app/website/interfaces/printer.interface';
import { DealService } from '../../services/deal.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-deal-edit',
  templateUrl: './deal-edit.component.html',
  styleUrls: ['./deal-edit.component.scss'],
})
export class DealEditComponent implements OnInit {
  deal: Deal | null = null;

  public editDealForm!: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private dealService: DealService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getDeal();
  }

  initializeForm() {
    this.editDealForm = this.fb.group({
      dealEndDate: [
        this.deal ? this.deal.dealEndDate : '',
        Validators.required,
      ],
      dealStartDate: [
        this.deal ? this.deal.dealStartDate : '',
        Validators.required,
      ],
      dealPrice: [this.deal ? this.deal.dealPrice : '', Validators.required],
      dealDiscountPercentage: [
        this.deal ? this.deal.dealDiscountPercentage : '',
        Validators.required,
      ],
      dealDescription: [
        this.deal ? this.deal.dealDescription : '',
        Validators.required,
      ],
    });
  }

  getDeal(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dealService.getDeal(id).subscribe((dealResponse) => {
        this.deal = dealResponse;
        this.initializeForm();
        console.log(this.editDealForm);
        this.sharedService.changeDealName(dealResponse.dealName);
      });
    }
  }

  logFormData() {
    console.log(this.editDealForm.value);
  }

  submitForm() {
    if (this.editDealForm.invalid) {
      this.editDealForm.markAllAsTouched();
      return;
    }
    const formData = this.editDealForm.value;
    const dealId = this.route.snapshot.paramMap.get('id');
    if (dealId === null) {
      console.error('Deal id is null');
      return;
    }
    this.dealService.submitDealEditForm(formData, dealId).subscribe(
      (response) => {
        console.log('Response:', response);
        this.router.navigate(['deal-detail', dealId]);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
}
