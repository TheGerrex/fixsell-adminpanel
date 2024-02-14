import { Component, Input } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
  @Input() data: any[] = [];

  constructor() {}

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Save the file
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    saveAs(
      new Blob([excelBuffer], { type: 'application/octet-stream' }),
      'ExcelReport.xlsx'
    );
  }

  exportToCSV() {
    let csvData = this.convertToCSV(this.data);
    var blob = new Blob([csvData], { type: 'text/csv' });
    saveAs(blob, 'Report.csv');
  }

  convertToCSV(objArray: any[]) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var row = '';

    for (var index in objArray[0]) {
      //Now convert each value to string and comma-separated
      row += index + ',';
    }
    row = row.slice(0, -1);
    //append Label row with line break
    str += row + '\r\n';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ',';
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }
}
