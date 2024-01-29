import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumiblesEditComponent } from './consumibles-edit.component';

describe('ConsumiblesEditComponent', () => {
  let component: ConsumiblesEditComponent;
  let fixture: ComponentFixture<ConsumiblesEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsumiblesEditComponent]
    });
    fixture = TestBed.createComponent(ConsumiblesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
