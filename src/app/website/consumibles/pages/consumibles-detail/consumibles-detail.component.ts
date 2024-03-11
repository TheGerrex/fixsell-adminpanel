import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ConsumiblesService } from '../../services/consumibles.service';

@Component({
  selector: 'app-consumibles-detail',
  templateUrl: './consumibles-detail.component.html',
  styleUrls: ['./consumibles-detail.component.scss'],
})
export class ConsumiblesDetailComponent implements OnInit {
  consumible: Consumible | null = null;
  currentImageIndex = 0;
  isLoadingData = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sharedService: SharedService,
    private consumiblesService: ConsumiblesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getConsumible();
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (
      this.consumible &&
      this.currentImageIndex < this.consumible.img_url.length - 1
    ) {
      this.currentImageIndex++;
    }
  }

  getConsumible(): void {
    this.isLoadingData = true;
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.consumiblesService.getConsumible(id).subscribe((consumible) => {
          console.log(consumible);
          this.consumible = consumible;
          this.isLoadingData = false;
          // this.sharedService.changeConsumiblesModel(consumible.model);
        });
      }
    });
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/website', 'consumibles', id, 'edit']);
  }

  navigateToCreateDeal(id: string) {
    // Implement this if needed
  }
}
