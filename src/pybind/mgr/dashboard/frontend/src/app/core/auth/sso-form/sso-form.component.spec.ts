import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastModule } from 'ng2-toastr';

import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { configureTestBed } from '../../../../testing/unit-test-helper';
import { SharedModule } from '../../../shared/shared.module';
import { SsoFormComponent } from './sso-form.component';

describe('SsoFormComponent', () => {
  let component: SsoFormComponent;
  let fixture: ComponentFixture<SsoFormComponent>;
  let activatedRoute: ActivatedRouteStub;

  configureTestBed({
    imports: [
      HttpClientTestingModule,
      ReactiveFormsModule,
      RouterTestingModule,
      ToastModule.forRoot(),
      SharedModule
    ],
    declarations: [SsoFormComponent]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SsoFormComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.get(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
