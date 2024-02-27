import { Component, Input } from '@angular/core';

@Component({
  selector: 'website-carousel-images',
  templateUrl: './carousel-images.component.html',
  styleUrls: ['./carousel-images.component.scss']
})
export class CarouselImagesComponent {
  @Input() product: any;
  currentImageIndex = 0;


  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (
      this.product &&
      this.currentImageIndex < this.product.img_url.length - 1
    ) {
      this.currentImageIndex++;
    }
  }
}
