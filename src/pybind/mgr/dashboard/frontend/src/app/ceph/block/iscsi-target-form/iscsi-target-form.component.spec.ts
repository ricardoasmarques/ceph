import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastModule } from 'ng2-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { configureTestBed } from '../../../../testing/unit-test-helper';
import { ApiModule } from '../../../shared/api/api.module';
import { ComponentsModule } from '../../../shared/components/components.module';
import { AuthStorageService } from '../../../shared/services/auth-storage.service';
import { ServicesModule } from '../../../shared/services/services.module';
import { IscsiTargetFormComponent } from './iscsi-target-form.component';

describe('IscsiTargetFormComponent', () => {
  let component: IscsiTargetFormComponent;
  let fixture: ComponentFixture<IscsiTargetFormComponent>;

  configureTestBed({
    imports: [
      ReactiveFormsModule,
      ComponentsModule,
      HttpClientTestingModule,
      ServicesModule,
      ApiModule,
      ToastModule.forRoot(),
      RouterTestingModule
    ],
    declarations: [IscsiTargetFormComponent],
    providers: [BsModalRef, BsModalService, AuthStorageService]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IscsiTargetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
