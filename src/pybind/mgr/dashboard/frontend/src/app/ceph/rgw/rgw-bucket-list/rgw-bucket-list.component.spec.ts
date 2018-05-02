import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ModalModule } from 'ngx-bootstrap';

import { RgwBucketService } from '../../../shared/api/rgw-bucket.service';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';
import { SharedModule } from '../../../shared/shared.module';
import { configureTestBed } from '../../../shared/unit-test-helper';
import { RgwBucketListComponent } from './rgw-bucket-list.component';

@Component({ selector: 'cd-rgw-bucket-details', template: '' })
class RgwBucketDetailsStubComponent {
  @Input() selection: CdTableSelection;
}

describe('RgwBucketListComponent', () => {
  let component: RgwBucketListComponent;
  let fixture: ComponentFixture<RgwBucketListComponent>;

  const fakeRgwBucketService = {
    list: () => {
      return new Promise(function(resolve) {
        resolve([]);
      });
    }
  };

  configureTestBed({
    declarations: [RgwBucketListComponent, RgwBucketDetailsStubComponent],
    imports: [RouterTestingModule, ModalModule.forRoot(), SharedModule],
    providers: [{ provide: RgwBucketService, useValue: fakeRgwBucketService }]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RgwBucketListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
