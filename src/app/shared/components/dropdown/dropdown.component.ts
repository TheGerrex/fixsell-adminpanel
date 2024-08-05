import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  isOpen = false;
  @Input() items: any[] = [];
  selectedItems: string[] = []; // Holds the selected item

  toggleCustomSelect() {
    this.isOpen = !this.isOpen;
  }

selectItem(item: string, event: MouseEvent) {
  const index = this.selectedItems.indexOf(item);
  if (index > -1) {
    // Item is already selected, remove it
    this.selectedItems.splice(index, 1);
  } else {
    // Item is not selected, add it
    this.selectedItems.push(item);
  }
  event.stopPropagation(); // Prevent the click from closing the dropdown
}

  removeItem(item: string, event: MouseEvent) {
    this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem !== item);
    event.stopPropagation(); // Prevent the click from triggering other actions
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!event.target.closest('.custom-select-wrapper')) {
      this.isOpen = false;
    }
  }
}
