import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterscrudComponent } from './printerscrud.component';

describe('PrinterscrudComponent', () => {
  let component: PrinterscrudComponent;
  let fixture: ComponentFixture<PrinterscrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrinterscrudComponent]
    });
    fixture = TestBed.createComponent(PrinterscrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
