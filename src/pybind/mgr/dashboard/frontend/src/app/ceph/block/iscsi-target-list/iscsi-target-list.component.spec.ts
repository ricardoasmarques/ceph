import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { configureTestBed } from '../../../../testing/unit-test-helper';
import { ApiModule } from '../../../shared/api/api.module';
import { ComponentsModule } from '../../../shared/components/components.module';
import { AuthStorageService } from '../../../shared/services/auth-storage.service';
import { ServicesModule } from '../../../shared/services/services.module';
import { IscsiTargetListComponent } from './iscsi-target-list.component';
import { IscsiTabsComponent } from '../iscsi-tabs/iscsi-tabs.component';


describe('IscsiTargetListComponent', () => {
  let component: IscsiTargetListComponent;
  let fixture: ComponentFixture<IscsiTargetListComponent>;

  configureTestBed({
    imports: [
      ReactiveFormsModule,
      ComponentsModule,
      HttpClientTestingModule,
      ServicesModule,
      ApiModule,
      TabsModule.forRoot(),
      RouterTestingModule
    ],
    declarations: [IscsiTargetListComponent, IscsiTabsComponent],
    providers: [BsModalRef, BsModalService, AuthStorageService]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IscsiTargetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
