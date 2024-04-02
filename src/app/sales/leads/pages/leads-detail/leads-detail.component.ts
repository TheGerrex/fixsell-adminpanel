import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { Lead } from 'src/app/sales/interfaces/leads.interface';

export interface Product {
  // other properties...
  consumibles?: Consumible[]; // consumibles is optional and is an array of Consumible objects
}

@Component({
  selector: 'app-leads-detail',
  templateUrl: './leads-detail.component.html',
  styleUrls: ['./leads-detail.component.scss'],
})
export class LeadsDetailComponent implements OnInit {
  printer: Printer | null = null;
  consumable: Consumible | null = null;
  product: Product | null = null;
  lead: Lead | null = null;
  typeOfProduct: string | null = null; // add this line
  displayedColumns: string[] = ['date', 'message', 'type', 'notes', 'action']; // add 'actions'
  constructor(
    private leadsService: LeadsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    //get lead id from url
    const leadId = this.route.snapshot.paramMap.get('id') ?? '';

    //get lead
    this.leadsService.getLead(leadId).subscribe((lead) => {
      console.log(lead);
      // set lead
      this.lead = lead;
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
          });
      }
    });
  }

  viewCommunication(id: number) {
    // code to view the communication with the given id
  }

  editCommunication(id: number) {
    // code to edit the communication with the given id
  }

  openConfirmDialog(id: number): void {
    // code to open a dialog to confirm the deletion of the communication with the given id
  }
  deleteCommunication(id: number) {
    // code to delete the communication with the given id
  }
}
