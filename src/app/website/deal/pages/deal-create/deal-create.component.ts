import { Component, OnInit } from '@angular/core';
import { Printer } from '../../../interfaces/printer.interface';
import { PrinterService } from '../../services/deal.service';

@Component({
  selector: 'app-deal-create',
  templateUrl: './deal-create.component.html',
  styleUrls: ['./deal-create.component.scss'],
})
export class DealCreateComponent implements OnInit {
  printerNames: string[] = [];

  constructor(private printerService: PrinterService) {}

  ngOnInit() {
    this.printerService
      .getAllPrinterNames()
      .subscribe((printerNames: string[]) => {
        this.printerNames = printerNames;
      });
  }
}
