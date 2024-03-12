import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Deal } from '../../interfaces/deal.interface';

@Component({
  selector: 'website-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent {

constructor(private router: Router) {}

@Input() deals!: Deal[];

getDaysLeft(): number {
    if (this.deals) {
      const endDate = new Date(this.deals[0].dealEndDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

navigateToCreateDeal(id: string) {
    const url = ['/website', 'deals', 'create', id];
    console.log('navigateToCreateDeal URL:', url);
    this.router.navigate(url);
  }
}
