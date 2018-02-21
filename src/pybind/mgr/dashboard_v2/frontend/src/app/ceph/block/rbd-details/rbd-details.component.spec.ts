import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RbdDetailsComponent } from './rbd-details.component';

describe('RbdDetailsComponent', () => {
  let component: RbdDetailsComponent;
  let fixture: ComponentFixture<RbdDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RbdDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
