import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-image-grid',
  templateUrl: './product-image-grid.component.html',
  styleUrls: ['./product-image-grid.component.scss'],
})
export class ProductImageGridComponent {
  @Input() imageUrls!: string[];
  @Output() remove = new EventEmitter<number>();

  constructor() {}

  onRemove(index: number): void {
    this.remove.emit(index);
  }
}
