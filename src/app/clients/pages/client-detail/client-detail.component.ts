import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from '../../services/clients.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Client } from '../../interfaces/client.interface';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {
  isLoading = false;
  clientId!: string;
  client!: Client;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientsService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe(params => {
      this.clientId = params.get('id') || '';
      if (this.clientId) {
        this.getClientData(this.clientId);
      }
    });
    this.isLoading = false;
  }

  getClientData(clientId: string) {
    this.clientService.getClient(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.showError(`Error fetching client data: ${error.error.message}`, 'Close');
        console.error('Error fetching client data:', error.error.message);
      },
    });
  }

  editClient(id: string) {
    this.router.navigate(['/clients/', id, 'edit']);
  }
}