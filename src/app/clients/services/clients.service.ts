import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import {
  Client,
  ClientAccount,
  ClientContact,
  BillingAddress,
  ShippingAddress,
  ClientPrinter,
  CommercialConditions,
  SuspensionConfig,
  ClientClassifications,
  BusinessGroup,
  CollectionZone,
  ClientCategory,
  BusinessLine,
  BranchOffice,
  PaymentComplementInfo,
} from '../interfaces/client.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  constructor(private http: HttpClient) {}

  // Private error handling method
  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(error);
  }

  // ======== MAIN CLIENT METHODS ========

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${environment.baseUrl}/clients`).pipe(
      map((response) => response),
      catchError((error) => this.handleError(error)),
    );
  }

  getClient(id: string): Observable<Client> {
    return this.http.get<Client>(`${environment.baseUrl}/clients/${id}`).pipe(
      map((response) => response),
      catchError((error) => this.handleError(error)),
    );
  }

  createClient(data: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(`${environment.baseUrl}/clients`, data).pipe(
      map((response) => response),
      catchError((error) => this.handleError(error)),
    );
  }

  updateClient(id: string, data: Partial<Client>): Observable<Client> {
    return this.http
      .patch<Client>(`${environment.baseUrl}/clients/${id}`, data)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  deleteClient(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.baseUrl}/clients/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // ======== CLIENT ACCOUNTS METHODS ========

  getClientAccounts(clientId?: string): Observable<ClientAccount[]> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http
      .get<ClientAccount[]>(`${environment.baseUrl}/client-accounts`, {
        params,
      })
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getClientAccount(id: string): Observable<ClientAccount> {
    return this.http
      .get<ClientAccount>(`${environment.baseUrl}/client-accounts/${id}`)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createClientAccount(data: Partial<ClientAccount>): Observable<ClientAccount> {
    return this.http
      .post<ClientAccount>(`${environment.baseUrl}/client-accounts`, data)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  updateClientAccount(
    id: string,
    data: Partial<ClientAccount>,
  ): Observable<ClientAccount> {
    return this.http
      .patch<ClientAccount>(
        `${environment.baseUrl}/client-accounts/${id}`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  deleteClientAccount(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.baseUrl}/client-accounts/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // ======== PAYMENT COMPLEMENT INFO METHODS ========

  getPaymentComplementInfo(): Observable<PaymentComplementInfo[]> {
    return this.http
      .get<PaymentComplementInfo[]>(
        `${environment.baseUrl}/payment-complement-info`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getPaymentComplementInfoForAccount(
    accountId: string,
  ): Observable<PaymentComplementInfo[]> {
    return this.http
      .get<PaymentComplementInfo[]>(
        `${environment.baseUrl}/payment-complement-info/account/${accountId}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createPaymentComplementInfo(
    data: Partial<PaymentComplementInfo>,
  ): Observable<PaymentComplementInfo> {
    return this.http
      .post<PaymentComplementInfo>(
        `${environment.baseUrl}/payment-complement-info`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  // ======== CLIENT CONTACT METHODS ========

  getClientContacts(clientId?: string): Observable<ClientContact[]> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http
      .get<ClientContact[]>(`${environment.baseUrl}/client-contacts`, {
        params,
      })
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getClientContact(id: string): Observable<ClientContact> {
    return this.http
      .get<ClientContact>(`${environment.baseUrl}/client-contacts/${id}`)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createClientContact(data: Partial<ClientContact>): Observable<ClientContact> {
    return this.http
      .post<ClientContact>(`${environment.baseUrl}/client-contacts`, data)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  updateClientContact(
    id: string,
    data: Partial<ClientContact>,
  ): Observable<ClientContact> {
    return this.http
      .patch<ClientContact>(
        `${environment.baseUrl}/client-contacts/${id}`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  deleteClientContact(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.baseUrl}/client-contacts/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // ======== SHIPPING ADDRESS METHODS ========

  getShippingAddresses(clientId?: string): Observable<ShippingAddress[]> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http
      .get<ShippingAddress[]>(
        `${environment.baseUrl}/client-shipping-addresses`,
        { params },
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getShippingAddress(id: string): Observable<ShippingAddress> {
    return this.http
      .get<ShippingAddress>(
        `${environment.baseUrl}/client-shipping-addresses/${id}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createShippingAddress(
    data: Partial<ShippingAddress>,
  ): Observable<ShippingAddress> {
    return this.http
      .post<ShippingAddress>(
        `${environment.baseUrl}/client-shipping-addresses`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  updateShippingAddress(
    id: string,
    data: Partial<ShippingAddress>,
  ): Observable<ShippingAddress> {
    return this.http
      .patch<ShippingAddress>(
        `${environment.baseUrl}/client-shipping-addresses/${id}`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  deleteShippingAddress(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.baseUrl}/client-shipping-addresses/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // ======== BILLING ADDRESS METHODS ========

  getBillingAddresses(clientId?: string): Observable<BillingAddress[]> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http
      .get<BillingAddress[]>(
        `${environment.baseUrl}/client-billing-addresses`,
        { params },
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getBillingAddress(id: string): Observable<BillingAddress> {
    return this.http
      .get<BillingAddress>(
        `${environment.baseUrl}/client-billing-addresses/${id}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createBillingAddress(
    data: Partial<BillingAddress>,
  ): Observable<BillingAddress> {
    return this.http
      .post<BillingAddress>(
        `${environment.baseUrl}/client-billing-addresses`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  updateBillingAddress(
    id: string,
    data: Partial<BillingAddress>,
  ): Observable<BillingAddress> {
    return this.http
      .patch<BillingAddress>(
        `${environment.baseUrl}/client-billing-addresses/${id}`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  deleteBillingAddress(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.baseUrl}/client-billing-addresses/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // ======== CLIENT PRINTER METHODS ========

  getClientPrinters(clientId?: string): Observable<ClientPrinter[]> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http
      .get<ClientPrinter[]>(`${environment.baseUrl}/client-printers`, {
        params,
      })
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getClientPrinter(id: string): Observable<ClientPrinter> {
    return this.http
      .get<ClientPrinter>(`${environment.baseUrl}/client-printers/${id}`)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createClientPrinter(data: Partial<ClientPrinter>): Observable<ClientPrinter> {
    return this.http
      .post<ClientPrinter>(`${environment.baseUrl}/client-printers`, data)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  updateClientPrinter(
    id: string,
    data: Partial<ClientPrinter>,
  ): Observable<ClientPrinter> {
    return this.http
      .patch<ClientPrinter>(
        `${environment.baseUrl}/client-printers/${id}`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  deleteClientPrinter(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.baseUrl}/client-printers/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // ======== COMMERCIAL CONDITIONS METHODS ========

  getCommercialConditions(): Observable<CommercialConditions[]> {
    return this.http
      .get<CommercialConditions[]>(
        `${environment.baseUrl}/client-commercial-conditions`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getCommercialCondition(id: string): Observable<CommercialConditions> {
    return this.http
      .get<CommercialConditions>(
        `${environment.baseUrl}/client-commercial-conditions/${id}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getCommercialConditionByClientId(
    clientId: string,
  ): Observable<CommercialConditions> {
    return this.http
      .get<CommercialConditions>(
        `${environment.baseUrl}/client-commercial-conditions/client/${clientId}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createCommercialCondition(
    data: Partial<CommercialConditions>,
  ): Observable<CommercialConditions> {
    return this.http
      .post<CommercialConditions>(
        `${environment.baseUrl}/client-commercial-conditions`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  updateCommercialCondition(
    id: string,
    data: Partial<CommercialConditions>,
  ): Observable<CommercialConditions> {
    return this.http
      .patch<CommercialConditions>(
        `${environment.baseUrl}/client-commercial-conditions/${id}`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  // ======== SUSPENSION CONFIG METHODS ========

  getSuspensionConfigs(): Observable<SuspensionConfig[]> {
    return this.http
      .get<SuspensionConfig[]>(
        `${environment.baseUrl}/client-suspension-configs`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getSuspensionConfig(id: string): Observable<SuspensionConfig> {
    return this.http
      .get<SuspensionConfig>(
        `${environment.baseUrl}/client-suspension-configs/${id}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getSuspensionConfigByClientId(
    clientId: string,
  ): Observable<SuspensionConfig> {
    return this.http
      .get<SuspensionConfig>(
        `${environment.baseUrl}/client-suspension-configs/client/${clientId}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createSuspensionConfig(
    data: Partial<SuspensionConfig>,
  ): Observable<SuspensionConfig> {
    return this.http
      .post<SuspensionConfig>(
        `${environment.baseUrl}/client-suspension-configs`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  updateSuspensionConfig(
    id: string,
    data: Partial<SuspensionConfig>,
  ): Observable<SuspensionConfig> {
    return this.http
      .patch<SuspensionConfig>(
        `${environment.baseUrl}/client-suspension-configs/${id}`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  // ======== CLIENT CLASSIFICATIONS METHODS ========

  // Main client classifications
  getClientClassifications(): Observable<ClientClassifications[]> {
    return this.http
      .get<ClientClassifications[]>(
        `${environment.baseUrl}/client-classifications`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getClientClassification(id: string): Observable<ClientClassifications> {
    return this.http
      .get<ClientClassifications>(
        `${environment.baseUrl}/client-classifications/${id}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  getClientClassificationByClientId(
    clientId: string,
  ): Observable<ClientClassifications> {
    return this.http
      .get<ClientClassifications>(
        `${environment.baseUrl}/client-classifications/client/${clientId}`,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  createClientClassification(
    data: Partial<ClientClassifications>,
  ): Observable<ClientClassifications> {
    return this.http
      .post<ClientClassifications>(
        `${environment.baseUrl}/client-classifications`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  updateClientClassification(
    id: string,
    data: Partial<ClientClassifications>,
  ): Observable<ClientClassifications> {
    return this.http
      .patch<ClientClassifications>(
        `${environment.baseUrl}/client-classifications/${id}`,
        data,
      )
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  // Business Groups
  getBusinessGroups(): Observable<BusinessGroup[]> {
    return this.http
      .get<BusinessGroup[]>(`${environment.baseUrl}/business-groups`)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  // Collection Zones
  getCollectionZones(): Observable<CollectionZone[]> {
    return this.http
      .get<CollectionZone[]>(`${environment.baseUrl}/collection-zones`)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  // Client Categories
  getClientCategories(): Observable<ClientCategory[]> {
    return this.http
      .get<ClientCategory[]>(`${environment.baseUrl}/client-categories`)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  // Business Lines
  getBusinessLines(): Observable<BusinessLine[]> {
    return this.http
      .get<BusinessLine[]>(`${environment.baseUrl}/business-lines`)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }

  // Branch Offices
  getBranchOffices(): Observable<BranchOffice[]> {
    return this.http
      .get<BranchOffice[]>(`${environment.baseUrl}/branch-offices`)
      .pipe(
        map((response) => response),
        catchError((error) => this.handleError(error)),
      );
  }
}
