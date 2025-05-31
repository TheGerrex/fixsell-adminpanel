import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';

/**
 * Column configuration for DataTable component
 */
export interface TableColumn {

  /** Tipo de dato en la columna (para definir el tipo de filtro) */
  type?: 'input' | 'select' | 'date';

  /** Property control filter visibility */
  showFilter?: boolean;

  /** Property name in data object */
  name: string;

  /** Display name for column header */
  label: string;

  /** Whether column is sortable */
  sortable?: boolean;

  /** Text alignment in column */
  align?: 'left' | 'center' | 'right';

  /** Column width (CSS value) */
  width?: string;

  /**
   * Format the cell content
   * Can return a string for simple text or {html: true, content: string} for HTML content
   */
  formatter?: (
    value: any,
    row: any,
  ) => string | { html: boolean; content: string };

  /** CSS classes to apply to the cell */
  cellClass?: string | ((row: any) => string);

  sortData?: (row: any) => any;

  rawValue?: (row: any) => any;
}

/**
 * Reusable data table component with advanced formatting capabilities
 */
@Component({
  selector: 'sales-client-config-table',
  templateUrl: './client-config-table.component.html',
  styleUrl: './client-config-table.component.scss'
})
export class ClientConfigTableComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChildren('filterInput') filterInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('filterSelect') selectRefs!: QueryList<MatSelect>;



  // Table configuration
  @Input() title: string = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() isLoading: boolean = false;

  // Pagination settings
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() defaultPageSize: number = 10;

  // Actions configuration
  @Input() showActions: boolean = true;
  @Input() actionsColumnName: string = 'action';
  @Input() showViewAction: boolean = true;
  @Input() showEditAction: boolean = true;
  @Input() showDeleteAction: boolean = true;
  @Input() viewActionPermission: string = 'canView';
  @Input() editActionPermission: string = 'canUpdate';
  @Input() deleteActionPermission: string = 'canDelete';

  // Add/Export button configuration
  @Input() showAddButton: boolean = true;
  @Input() addButtonText: string = 'Crear';
  @Input() addButtonPermission: string = '';
  @Input() showExport: boolean = true;
  @Input() exportIgnoreFields: string[] = ['id'];

  // Events
  @Output() rowClick = new EventEmitter<any>();
  @Output() viewClick = new EventEmitter<any>();
  @Output() editClick = new EventEmitter<any>();
  @Output() deleteClick = new EventEmitter<any>();
  @Output() addClick = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();

  // Component state
  dataSource = new MatTableDataSource<any>();
  searchTerm: string = '';
  isSearchOpen: boolean = false;
  showFilterRow: boolean = false;
  filteredValues: { [key: string]: any } = {};

  ngOnInit(): void {
    // Initialize data source
    this.updateDataSource();

    // Custom filter predicate to use rawValue for filtering
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filters = JSON.parse(filter);
      return Object.keys(filters).every((columnName) => {
        const filterValue = filters[columnName];
        const column = this.columns.find(col => col.name === columnName);

        if (!column || !filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true;
        }

        // Use rawValue if defined, otherwise use the raw data
        const rawValue = column.rawValue ? column.rawValue(data) : data[columnName];
        const formattedValue = String(rawValue).toLowerCase();

        // Handle array filters (e.g., multi-select)
        if (Array.isArray(filterValue)) {
          return filterValue.some(val => formattedValue.includes(val.toString().toLowerCase()));
        }

        // Handle boolean and text filters
        if (typeof filterValue === 'boolean') {
          return formattedValue === filterValue.toString();
        }

        return formattedValue.includes(filterValue.toString().toLowerCase());
      });
    };
  }

  ngAfterViewInit(): void {
    this.setupSortingAndPagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateDataSource();

      // Need to set up sorting/pagination after view init, but also when data changes
      setTimeout(() => this.setupSortingAndPagination());
    }
  }

  /**
   * Update the data source when data changes
   */
  private updateDataSource(): void {
    if (this.data) {
      this.dataSource.data = this.data;
    }
  }

  /**
   * Set up the sorting and pagination for the table
   */
  private setupSortingAndPagination(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;

      // Custom sorting accessor for complex data
      this.dataSource.sortingDataAccessor = (item: any, property: string) => {
        // Find column definition for this property
        const column = this.columns.find((col) => col.name === property);

        // If column has custom sort data function, use it
        if (column?.sortData) {
          return this.getSortableValue(column.sortData(item));
        }

        if (column?.formatter) {
          // For formatted columns, try to get a simple value for sorting
          const formattedValue = column.formatter(item[property], item);

          // If formatted value is an object with html content, we can't sort on it directly
          if (typeof formattedValue === 'object' && formattedValue.html) {
            // Return original value as fallback
            return this.getSortableValue(item[property]);
          }

          return this.getSortableValue(formattedValue);
        }

        // Default case: return the item's property value
        return this.getSortableValue(item[property]);
      };
    }
  }

  /**
   * Get a sortable value from any type
   * Converted Date values to getTime() for sorting.
   */
  private getSortableValue(value: any): string | number {
    if (value instanceof Date) {
      return value.getTime();
    } else if (value === null || value === undefined) {
      return '';
    } else if (typeof value === 'number') {
      return value;
    } else {
      return String(value).toLowerCase();
    }
  }

  applyMultiFilter(selectedValues: any[], columnName: string): void {
    // Si la columna contiene objetos, necesitamos asegurarnos de que estamos filtrando por la propiedad 'name'
    if (this.data.length > 0 && typeof this.data[0][columnName] === 'object') {
      // Si estamos trabajando con objetos, extraemos el 'name' de cada objeto
      const selectedNames = selectedValues.map(value => value.name || value); // 'value.name' o 'value' si no es un objeto
      this.filteredValues[columnName] = selectedNames;
      console.log('Filtered Values:', this.filteredValues);
    } else {
      // Si es un valor primitivo, simplemente lo asignamos
      this.filteredValues[columnName] = selectedValues;
    }

    this.updateFilter(); // Aplicamos el filtro
  }


  addInputFilter(event: KeyboardEvent, columnName: string): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    if (value) {
      this.filteredValues[columnName] = this.filteredValues[columnName] || [];
      if (!this.filteredValues[columnName].includes(value)) {
        this.filteredValues[columnName].push(value);
      }
      input.value = '';
      this.updateFilter();
    }
  }

  clearInput(inputElement: HTMLInputElement, columnName: string): void {
    inputElement.value = ''; // Clear the input field
    this.applyFilter('', columnName); // Remove the filter
  }

  removeFilter(columnName: string, valueToRemove: string): void {
    const currentValue = this.filteredValues[columnName];

    // Si es array, quitamos el valor del array
    if (Array.isArray(currentValue)) {
      this.filteredValues[columnName] = currentValue.filter(
        (val: string) => val !== valueToRemove
      );
    }
    // Si es valor único
    else if (currentValue === valueToRemove) {
      this.filteredValues[columnName] = '';
    }

    // 🔥 Aquí reseteamos el mat-select correspondiente visualmente
    const select = this.selectRefs.find(
      ref => ref._elementRef.nativeElement.getAttribute('data-column') === columnName
    );
    if (select) {
      select.writeValue(this.filteredValues[columnName] || []);
    }
    // Reseteamos el input correspondiente visualmente
    const input = this.filterInputs.find(
      ref => ref.nativeElement.getAttribute('data-column') === columnName
    );
    if (input) {
      (input.nativeElement as HTMLInputElement).value = '';  // Limpiamos el valor del input
    }



    this.updateFilter();
  }


  getActiveFilters(): { column: string; columnLabel: string; value: string }[] {
    const filters: { column: string; columnLabel: string; value: string }[] = [];

    for (const key in this.filteredValues) {
      const column = this.columns.find(c => c.name === key);
      const filterValue = this.filteredValues[key];

      if (!column) continue;

      if (Array.isArray(filterValue)) {
        filterValue.forEach((value: string) => {
          filters.push({ column: key, columnLabel: column.label, value });
        });
      } else if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        filters.push({ column: key, columnLabel: column.label, value: filterValue.toString() });
      }
    }

    return filters;
  }

  updateFilter(): void {
    this.dataSource.filter = JSON.stringify(this.filteredValues);
  }

  getFilterCount(): number {
    return this.getActiveFilters().length;
  }

  /**
   * Apply filter to the table
   */
  applyFilter(eventOrValue: Event | string, columnName: string): void {
    let value: string;
    if (typeof eventOrValue === 'string') {
      value = eventOrValue;
    } else {
      const target = eventOrValue.target as HTMLInputElement;
      value = target?.value || '';
    }
    if (value.toLowerCase() === 'true') {
      this.filteredValues[columnName] = true;
    } else if (value.toLowerCase() === 'false') {
      this.filteredValues[columnName] = false;
    } else {
      this.filteredValues[columnName] = value.trim().toLowerCase();
    }
    this.dataSource.filter = JSON.stringify(this.filteredValues);
  }

  getFormattedOption(value: any, columnName: string): string {
    const column = this.columns.find(col => col.name === columnName);

    // If the value is already a raw value, return it directly
    if (!column?.formatter) {
      return value?.toString() || '';
    }

    // Use the formatter to format the value
    const mockRow = { [columnName]: value };
    const formattedValue = column.formatter(value, mockRow);

    if (typeof formattedValue === 'object' && formattedValue.html) {
      // Extract plain text from the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formattedValue.content;
      return tempDiv.textContent || tempDiv.innerText || '';
    }

    if (typeof formattedValue === 'string') {
      // Check if the string contains HTML and extract plain text
      if (formattedValue.includes('<')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedValue;
        return tempDiv.textContent || tempDiv.innerText || '';
      }
      return formattedValue;
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'; // Adjust this to your actual formatted value for boolean
    }
    console.log(`Formatted option for ${value}:`, this.getFormattedOption(value, columnName));
    return value?.toString() || '';
  }

  getFilterOptions(columnName: string): any[] {
    const columnConfig = this.columns.find(col => col.name === columnName);

    if (!columnConfig || columnConfig.showFilter === false) {
      return []; // If the filter is disabled for this column, return an empty array.
    }

    // Map the data to raw values or the column's property value
    const values = this.data.map(row => {
      if (columnConfig.rawValue) {
        return columnConfig.rawValue(row); // Use rawValue if defined
      }

      const columnValue = row[columnName];
      if (typeof columnValue === 'object' && columnValue !== null) {
        // If the value is an object, try to extract a meaningful property (e.g., 'name')
        return columnValue.name || 'No asignado';
      }

      return columnValue; // For primitive values, return as is
    });

    // Return unique values, filtering out undefined, null, or empty strings
    const uniqueValues = [...new Set(values.filter(value => value !== undefined && value !== null && value !== ''))];
    console.log(`Filter options for ${columnName}:`, uniqueValues);
    return uniqueValues;
  }

  resetFilters(): void {
    this.filteredValues = {}; // Clear all filters

    // Reset filters for all columns
    this.columns.forEach(column => {
      this.applyFilter('', column.name); // Pass an empty filter value and the column name
    });

    // Clear the values inside the input fields
    this.filterInputs.forEach(inputRef => {
      const inputElement = inputRef.nativeElement as HTMLInputElement;
      inputElement.value = ''; // Clear the input field
    });

    // Clear the values inside the select fields (if applicable)
    this.selectRefs.forEach(selectRef => {
      selectRef.writeValue([]); // Reset the select field
    });

    // Update the filter to reflect the cleared state
    this.updateFilter();
  }

  /**
   * Get formatted cell content
   */
  getCellContent(column: TableColumn, element: any): any {
    const value = element[column.name];
    return column.formatter ? column.formatter(value, element) : value;

  }

  /**
   * Check if formatted content is HTML
   */
  isHtmlContent(content: any): boolean {
    return content && typeof content === 'object' && content.html === true;
  }

  /**
   * Get the HTML content from formatted cell
   */
  getHtmlContent(content: any): string {
    return content.content;
  }

  /**
   * Get the plain text content
   */
  getTextContent(content: any): string {
    return typeof content === 'object'
      ? String(content.content)
      : String(content);
  }

  /**
   * Get cell CSS classes
   */
  getCellClass(column: TableColumn, row: any): string {
    if (!column.cellClass) return '';

    if (typeof column.cellClass === 'function') {
      return column.cellClass(row);
    }

    return column.cellClass;
  }

  /**
   * Handle row click
   */
  onRowClick(row: any): void {
    if (this.rowClick.observed) {
      this.rowClick.emit(row);
    }
  }

  /**
   * Handle view action click
   */
  onViewClick(row: any, event: Event): void {
    event.stopPropagation();
    this.viewClick.emit(row);
  }

  /**
   * Handle edit action click
   */
  onEditClick(row: any, event: Event): void {
    event.stopPropagation();
    this.editClick.emit(row);
  }

  /**
   * Handle delete action click
   */
  onDeleteClick(row: any, event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit(row);
  }

  /**
   * Handle add button click
   */
  onAddClick(): void {
    this.addClick.emit();
  }

  /**
   * Check if actions column should be displayed
   */
  shouldShowActionsColumn(): boolean {
    return (
      this.showActions &&
      (this.viewClick.observed ||
        this.editClick.observed ||
        this.deleteClick.observed)
    );
  }
  /**
   * Toggle filter row visibility
   */
  toggleFilterRow(): void {
    this.showFilterRow = !this.showFilterRow;
  }

  toggleSearch() {
    this.isSearchOpen = true;
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 100); // Enfocar el input al abrir
  }

  closeSearch() {
    if (!this.searchTerm) {
      this.isSearchOpen = false;
    }
  }
}
