import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';

export interface Chip {
  name: string;
}

@Component({
  selector: 'website-input-chips',
  templateUrl: './input-chips.component.html',
  styleUrls: ['./input-chips.component.scss']
})
export class InputChipsComponent implements OnChanges {
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  items: Chip[] = []

  @Input() tagsControls!: any[];
  @Input() placeholder: string = "Nueva etiqueta...";
  @Output() tagsUpdated = new EventEmitter<Chip[]>();

  announcer = inject(LiveAnnouncer);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tagsControls'] && changes['tagsControls'].currentValue) {
      this.items = changes['tagsControls'].currentValue.map((tag: string) => ({ name: tag }));
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our item
    if (value) {
      this.items.push({name: value});
    }

    // Clear the input value
    event.chipInput!.clear();

    // Emit the updated list of tags
    this.tagsUpdated.emit(this.items);
  }

  remove(item: Chip): void {
    const index = this.items.indexOf(item);

    if (index >= 0) {
      this.items.splice(index, 1);

      this.announcer.announce(`Removed ${item}`);
    }

    // Emit the updated list of tags
    this.tagsUpdated.emit(this.items);
  }

  edit(item: Chip, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(item);
      return;
    }

    // Edit existing fruit
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items[index].name = value;
    }
  }


}
