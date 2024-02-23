import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'website-consumable',
  templateUrl: './consumable.component.html',
  styleUrls: ['./consumable.component.scss']
})
export class ConsumableComponent {

  constructor(private router: Router) {}

  @Input() product: any;

  navigateToCreateConsumible() {
    this.router.navigate(['/website', 'consumibles', 'create']);
  }
}
