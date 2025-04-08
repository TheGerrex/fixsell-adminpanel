import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation, // Add this import
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

/**
 * Column configuration for DataTable component
 */
export interface TableColumn {

  /** Tipo de dato en la columna (para definir el tipo de filtro) */
  type?: 'input' | 'select' | 'date';

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

        // Skip if no filter applied
        if (filterValue === null || filterValue === undefined || filterValue === '') {
          return true;
        }

        // Boolean filter (e.g., from select for 'color')
        if (typeof filterValue === 'boolean') {
          return dataValue === filterValue;
        }

        // Normal string-based filter (e.g., model input)
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
    if (column?.formatter) {
      const mockRow = { [columnName]: value };
      const formattedValue = column.formatter(value, mockRow);
      if (typeof formattedValue === 'string') {
        return formattedValue;
      } else if (typeof formattedValue === 'object' && formattedValue.html) {
        return formattedValue.content;
      }
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'; // Adjust this to your actual formatted value for boolean
    }
    return value.toString();
  }





  getFilterOptions(column: string): string[] {
    return [...new Set(this.data.map(item => item[column]))];
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
    this.filteredValues = {};
    this.dataSource.filter = '';
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
