import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import { Communication } from 'src/app/sales/interfaces/leads.interface';

@Component({
  selector: 'app-communication-detail',
  templateUrl: './communication-detail.component.html',
  styleUrls: ['./communication-detail.component.scss'],
})
export class CommunicationDetailComponent implements OnInit {
  communication: Communication | null = null;
  isLoadingData = false;
  constructor(
    private route: ActivatedRoute,
    private leadsService: LeadsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.leadsService.getCommunicationById(id).subscribe(
      (communication) => {
        this.communication = communication;
      },
      (error) => {
        console.error('Error fetching communication:', error);
      }
    );
  }

  openConfirmDialog(communication: any) {}

  navigateToEditCommunication(communication: any) {}
}
