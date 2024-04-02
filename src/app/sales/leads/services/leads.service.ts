import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ConsumiblesService } from '../../../website/consumibles/services/consumibles.service';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  constructor(
    private http: HttpClient,
    private consumiblesService: ConsumiblesService,
    private printerService: PrinterService
  ) {}
  // Get all leads by vendor
  getLeadsbyVendor(vendorId: string): Observable<any> {
    return this.http
      .get(`${environment.baseUrl}/leads/vendor/${vendorId}`)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  // get all leads
  getAllLeads(): Observable<any> {
    return this.http
      .get(`${environment.baseUrl}/leads`)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  //get lead by id
  getLead(id: string): Observable<any> {
    return this.http
      .get(`${environment.baseUrl}/leads/${id}`)
      .pipe(map((leadsResponse) => leadsResponse));
  }
  // create lead
  createLead(data: any): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/leads`, data)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  // create sales communication
  createSalesCommunication(data: any): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/sale-communication`, data)
      .pipe(map((leadsResponse) => leadsResponse));
  }
  //delete lead {{baseURL}}/leads/:id
  deleteLead(id: string): Observable<any> {
    return this.http
      .delete(`${environment.baseUrl}/leads/${id}`)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  //"product_interested": "TN612C",
  //"type_of_product": "consumible",
  //search for product and get product details by name
  getProductByName(productType: string, productName: string): Observable<any> {
    //if product type is consumible
    if (productType === 'consumible') {
      return this.consumiblesService.getConsumibleIdByName(productName).pipe(
        switchMap((id: string) => {
          if (id) {
            return this.consumiblesService.getConsumible(id);
          } else {
            throw new Error('Consumible not found');
          }
        })
      );
    }
    //if product type is multifuncional
    else if (productType === 'printer') {
      return this.printerService.getPrinterIdByName(productName).pipe(
        switchMap((id: string) => {
          if (id) {
            return this.printerService.getPrinter(id);
          } else {
            throw new Error('Printer not found');
          }
        })
      );
    }
    //if product type is neither consumible nor multifuncional
    else {
      throw new Error(`Invalid product type: ${productType}`);
    }
  }
}
