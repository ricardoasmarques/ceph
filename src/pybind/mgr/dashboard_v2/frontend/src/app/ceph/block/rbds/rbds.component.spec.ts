import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RbdsComponent } from './rbds.component';

describe('RbdsComponent', () => {
  let component: RbdsComponent;
  let fixture: ComponentFixture<RbdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RbdsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
