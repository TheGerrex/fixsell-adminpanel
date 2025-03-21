import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ConsumiblesService } from '../../../website/consumibles/services/consumibles.service';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
import { SoftwareService } from 'src/app/website/software/services/software.service';
@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  constructor(
    private http: HttpClient,
    private consumiblesService: ConsumiblesService,
    private printerService: PrinterService,
    private softwareService: SoftwareService,
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

  // update lead
  updateLead(data: any, id: string): Observable<any> {
    return this.http
      .patch(`${environment.baseUrl}/leads/${id}`, data)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  //delete lead {{baseURL}}/leads/:id
  deleteLead(id: string): Observable<any> {
    return this.http
      .delete(`${environment.baseUrl}/leads/${id}`)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  // create sales communication
  createSalesCommunication(data: any): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/sale-communication`, data)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  // update sales communication
  updateSalesCommunication(data: any, id: any): Observable<any> {
    console.log('Data:', data);
    console.log('ID:', id);
    console.log('ID Type:', typeof id);

    const url = environment.baseUrl + '/sale-communication/' + id;
    console.log('URL:', url);

    return this.http
      .patch(url, data)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  deleteCommunication(id: string): Observable<any> {
    return this.http
      .delete(`${environment.baseUrl}/sale-communication/${id}`)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  //"product_interested": "TN612C",
  //"type_of_product": "consumible",
  //search for product and get product details by name
  getProductByName(productType: string, productName: string): Observable<any> {
    // Handle rent_package as printer
    const effectiveType =
      productType === 'rent_package' ? 'printer' : productType;

    // if product type is consumible
    if (effectiveType === 'consumible') {
      return this.consumiblesService.getConsumibleIdByName(productName).pipe(
        catchError((error) => {
          console.warn(
            `Could not find exact match for consumible: ${productName}`,
            error,
          );
          // Try to get all consumibles and find a case-insensitive match
          return this.consumiblesService.getAllConsumibles().pipe(
            map((consumibles) => {
              const searchNameLower = productName.toLowerCase();
              const match = consumibles.find(
                (c) =>
                  c.name.toLowerCase() === searchNameLower ||
                  c.name.toLowerCase().includes(searchNameLower) ||
                  searchNameLower.includes(c.name.toLowerCase()),
              );

              if (match) {
                return match.id;
              } else {
                throw new Error('Consumible no encontrado');
              }
            }),
          );
        }),
        switchMap((id: string) => {
          if (id) {
            return this.consumiblesService.getConsumible(id);
          } else {
            throw new Error('Consumible no encontrado');
          }
        }),
      );
    }
    // if product type is printer or rent_package
    else if (effectiveType === 'printer') {
      return this.printerService.getPrinterIdByName(productName).pipe(
        catchError((error) => {
          console.warn(
            `Could not find exact match for printer: ${productName}`,
            error,
          );
          // Try to get all printers and find a case-insensitive match
          return this.printerService.getAllPrinters().pipe(
            map((printers) => {
              const searchNameLower = productName.toLowerCase();
              const match = printers.find(
                (p) =>
                  (p.model && p.model.toLowerCase() === searchNameLower) ||
                  (p.model &&
                    p.model.toLowerCase().includes(searchNameLower)) ||
                  (p.model && searchNameLower.includes(p.model.toLowerCase())),
              );

              if (match) {
                return match.id;
              } else {
                throw new Error('Multifuncional no encontrado');
              }
            }),
          );
        }),
        switchMap((id: string) => {
          if (id) {
            return this.printerService.getPrinter(id);
          } else {
            throw new Error('Multifuncional no encontrado');
          }
        }),
      );
    }
    // if product type is software
    else if (effectiveType === 'software') {
      return this.softwareService.getSoftwareIdByName(productName).pipe(
        catchError((error) => {
          console.warn(
            `Could not find exact match for software: ${productName}`,
            error,
          );
          // Try to get all software and find a case-insensitive match
          return this.softwareService.getAllSoftware().pipe(
            map((allSoftware) => {
              const searchNameLower = productName.toLowerCase();
              const match = allSoftware.find(
                (s) =>
                  s.name.toLowerCase() === searchNameLower ||
                  s.name.toLowerCase().includes(searchNameLower) ||
                  searchNameLower.includes(s.name.toLowerCase()),
              );

              if (match) {
                return match.id;
              } else {
                throw new Error('Software no encontrado');
              }
            }),
          );
        }),
        switchMap((id: string) => {
          if (id) {
            return this.softwareService.getSoftware(id);
          } else {
            throw new Error('Software no encontrado');
          }
        }),
      );
    }
    // Handle other types including rent_package
    else {
      // For rent_package, we've already handled it by treating it as a printer
      if (productType === 'rent_package') {
        return this.printerService.getPrinterIdByName(productName).pipe(
          switchMap((id: string) => {
            if (id) {
              return this.printerService.getPrinter(id).pipe(
                map((printer) => ({
                  ...printer,
                  isRentPackage: true,
                  monthlyFee: 0, // Default value, could be updated later
                  currency: 'MXN',
                  rentDescription: `Paquete de renta: ${
                    printer.model || productName
                  }`,
                })),
              );
            } else {
              throw new Error('Paquete de renta no encontrado');
            }
          }),
          catchError((error) => {
            console.error(`Error loading rent package: ${error}`);
            throw new Error(`Invalid product type: ${productType}`);
          }),
        );
      } else {
        throw new Error(`Invalid product type: ${productType}`);
      }
    }
  }

  getCommunicationById(id: string): Observable<any> {
    return this.http
      .get(`${environment.baseUrl}/sale-communication/${id}`)
      .pipe(map((communicationResponse) => communicationResponse));
  }
}
