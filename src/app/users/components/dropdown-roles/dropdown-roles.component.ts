import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddUserRoleDialogComponent } from 'src/app/shared/components/add-user-role-dialog/add-user-role-dialog.component';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'user-dropdown-roles',
  templateUrl: './dropdown-roles.component.html',
  styleUrl: './dropdown-roles.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownRolesComponent),
      multi: true
    }
  ]
})
export class DropdownRolesComponent {

  constructor(
    private dialog: MatDialog,
    private usersService: UsersService,
    private elRef: ElementRef
  ) {}
  
  isOpen = false;
  touched = false;
  disabled = false;

  public isDropup: boolean = false;
  dropdownPosition: 'top' | 'bottom' = 'bottom';
  @ViewChild('customOptions') customSelectWrapper!: ElementRef;
  @Input() isInvalid: boolean = false; // This will hold the validation state
  @Input() items: any[] = [];
  selectedItems: string[] = []; // Holds the selected item

  @Output() itemsChange = new EventEmitter<string[]>(); // Step 2
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};


  writeValue(role: string) {
    if (role && Array.isArray(role)) {
      this.selectedItems = role; // Ensure selectedItems reflects the model's current state
    } else {
      this.selectedItems = []; // Reset if value is not an array
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  toggleCustomSelect() {
    this.isOpen = !this.isOpen;
  }

  updateChanges(): void {
    this.onChange([...this.selectedItems]); // Notify Angular forms of the change
    this.itemsChange.emit([...this.selectedItems]); // Emit for any additional custom handling
  }

  selectItem(item: string, event: MouseEvent) {
    if (item == null || item.trim() === '') {
      // Prevent adding null, undefined, or empty strings
      return;
    }
    const index = this.selectedItems.indexOf(item);
    if (index > -1) {
      // Item is already selected, remove it
      this.selectedItems.splice(index, 1);
    } else {
      // Item is not selected, add it
      this.selectedItems.push(item);
    }
    this.updateChanges(); // Notify about the change
    event.stopPropagation(); // Prevent the click from closing the dropdown
  }
  
  removeItem(item: string, event: MouseEvent) {
    this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem !== item);
    this.updateChanges(); // Notify about the change
    event.stopPropagation(); // Prevent the click from triggering other actions
  }

  getRoles(): void {
    this.usersService.getRoles().subscribe(
      (roles: string[]) => {
        this.items = roles;
      },
      (error) => {
        console.error('Error fetching roles', error);
      }
    );
  }

  openAddUserRoleDialog() {
    const dialogRef = this.dialog.open(AddUserRoleDialogComponent);

    dialogRef.afterClosed().subscribe(() => {
      // Refresh the roles here
      this.getRoles();
    });
  }

  adjustDropdownPosition() {
    const selectWrapper = this.customSelectWrapper.nativeElement;
    const triggerBottom = selectWrapper.getBoundingClientRect().bottom;
    const viewportHeight = window.innerHeight;

    // Check if there's enough space below the trigger for the dropdown
    const spaceBelow = viewportHeight - triggerBottom;
    const neededSpace = 196; // Adjust based on your dropdown's height

    this.isDropup = spaceBelow < neededSpace;
    if (spaceBelow < neededSpace) {
      this.dropdownPosition = 'top';
    } else {
      this.dropdownPosition = 'bottom';
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!event.target.closest('.custom-select-wrapper')) {
      this.isOpen = false;
      this.isDropup = false;
    }
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {
  //   if (this.isOpen) {
  //     this.adjustDropdownPosition();
  //   }
  // }
}
