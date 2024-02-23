import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'website-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent {

constructor(private router: Router) {}

@Input() product: any;

getDaysLeft(): number {
    if (this.product && this.product.deal) {
      const endDate = new Date(this.product.deal.dealEndDate);
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
