import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ticket } from 'src/app/support/interfaces/tickets.interface';
import { TicketsService } from 'src/app/support/services/tickets.service';

@Component({
  selector: 'app-tickets-view',
  templateUrl: './tickets-view.component.html',
  styleUrls: ['./tickets-view.component.scss'],
})
export class TicketsViewComponent implements OnInit {
  constructor(
    private ticketsService: TicketsService,
    private route: ActivatedRoute
  ) {}

  ticketIssue = '';
  readOnly = true;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const ticketId = params.get('id');
      if (ticketId !== null) {
        this.getTicketIssue(ticketId);
      }
    });
  }

  toggleEdit() {
    this.readOnly = !this.readOnly;
  }

  submit() {
    const issueObject = {
      issue: this.ticketIssue,
    };
    const issueJson = JSON.stringify(issueObject);
    console.log(issueJson);
    this.readOnly = true;
  }

  getTicketIssue(ticketId: string) {
    this.ticketsService.getTicketById(ticketId).subscribe((ticket) => {
      this.ticketIssue = ticket.issue;
    });
  }
}
