import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-image-grid',
  templateUrl: './product-image-grid.component.html',
  styleUrls: ['./product-image-grid.component.scss'],
})
export class ProductImageGridComponent {
  @Input() imageUrls!: string[];
  @Output() remove = new EventEmitter<number>();

  onRemove(index: number): void {
    console.log('remove image at index: ', index);
    this.remove.emit(index);
  }
}
