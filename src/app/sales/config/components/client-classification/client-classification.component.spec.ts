import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientClassificationComponent } from './client-classification.component';

describe('ClientClassificationComponent', () => {
  let component: ClientClassificationComponent;
  let fixture: ComponentFixture<ClientClassificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientClassificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
