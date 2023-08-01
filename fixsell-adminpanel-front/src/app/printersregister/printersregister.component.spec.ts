import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintersregisterComponent } from './printersregister.component';

describe('PrintersregisterComponent', () => {
  let component: PrintersregisterComponent;
  let fixture: ComponentFixture<PrintersregisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrintersregisterComponent]
    });
    fixture = TestBed.createComponent(PrintersregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
