import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroScreenComponent } from './intro-screen.component';

describe('IntroScreenComponent', () => {
  let component: IntroScreenComponent;
  let fixture: ComponentFixture<IntroScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntroScreenComponent],
    });
    fixture = TestBed.createComponent(IntroScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
