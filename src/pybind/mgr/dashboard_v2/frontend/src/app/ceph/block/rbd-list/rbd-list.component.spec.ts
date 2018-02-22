import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AlertModule, TabsModule } from 'ngx-bootstrap';

import { ComponentsModule } from '../../../shared/components/components.module';
import { SharedModule } from '../../../shared/shared.module';
import { RbdListComponent } from './rbd-list.component';

describe('RbdListComponent', () => {
  let component: RbdListComponent;
  let fixture: ComponentFixture<RbdListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TabsModule.forRoot(),
        AlertModule.forRoot(),
        ComponentsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [ RbdListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbdListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
