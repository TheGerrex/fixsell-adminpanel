import {
  ChangeDetectionStrategy,
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
  ViewEncapsulation, // Add this import
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
}

/**
 * Reusable data table component with advanced formatting capabilities
 */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DataTableComponent implements OnInit, OnChanges {
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

    // Filtro personalizado para múltiples columnas
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filters = JSON.parse(filter);
      return Object.keys(filters).every((column) => {
        const filterValue = filters[column];
        const dataValue = data[column];

        // Aquí verificas si el valor del filtro coincide con el de la fila
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true;
        }

        // Para los valores en array o multi-select, asegura que los datos sean correctos
        if (Array.isArray(filterValue)) {
          return filterValue.some(val =>
            dataValue?.toString().toLowerCase().includes(val.toString().toLowerCase())
          );
        }

        // Maneja el filtro por valores booleanos o por texto
        if (typeof filterValue === 'boolean') {
          return dataValue === filterValue;
        }

        return dataValue?.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
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
   */applyFilter(eventOrValue: Event | string, columnName: string): void {
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
    if (column?.formatter) {
      const mockRow = { [columnName]: value };
      const formattedValue = column.formatter(value, mockRow);
      console.log('Formatted Value:', formattedValue);

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
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'; // Adjust this to your actual formatted value for boolean
    }

    return value?.toString() || '';
  }
  getFilterOptions(column: string): any[] {
    const columnConfig = this.columns.find(col => col.name === column);

    if (columnConfig?.showFilter === false) {
      return []; // Si el filtro está deshabilitado para esta columna, devuelve un array vacío.
    }

    // Si la columna contiene objetos, buscamos la propiedad 'name' de manera dinámica
    if (this.data.length > 0 && typeof this.data[0][column] === 'object') {
      const values = this.data.map(item => item[column]);
      // Si el valor es un objeto, usamos su propiedad 'name' o el valor predeterminado 'No asignado'
      const uniqueValues = [...new Set(values.map(value => value?.name || 'No asignado'))];
      return uniqueValues;
    }

    // Si no es un objeto, simplemente devolvemos valores únicos (para valores primitivos)
    const values = this.data.map(item => item[column]);
    const uniqueValues = [...new Set(values.filter(value => value !== undefined && value !== null && value !== ''))];
    return uniqueValues;
  }







  // getFormattedOption(value: any, columnName: string): string {
  //   const column = this.columns.find(col => col.name === columnName);
  //   if (column?.formatter) {
  //     // Mock row with just the value we're formatting
  //     const mockRow = { [columnName]: value };
  //     const formattedValue = column.formatter(value, mockRow);
  //     if (typeof formattedValue === 'string') {
  //       return formattedValue;
  //     } else if (typeof formattedValue === 'object' && formattedValue.html) {
  //       return formattedValue.content;
  //     }
  //   }
  //   return value.toString();
  // }
  resetFilters(): void {
    this.filteredValues = {}; // Clear all filters

    // Reset filters for all columns
    this.columns.forEach(column => {
      this.applyFilter('', column.name); // Pass an empty filter value and the column name
    });
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
