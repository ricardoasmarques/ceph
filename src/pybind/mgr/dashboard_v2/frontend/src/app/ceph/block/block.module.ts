import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BsDropdownModule, TabsModule } from 'ngx-bootstrap';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import { ComponentsModule } from '../../shared/components/components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { ServicesModule } from '../../shared/services/services.module';
import { SharedModule } from '../../shared/shared.module';
import { IscsiComponent } from './iscsi/iscsi.component';
import { MirrorHealthColorPipe } from './mirror-health-color.pipe';
import { MirroringComponent } from './mirroring/mirroring.component';
import { PoolDetailComponent } from './pool-detail/pool-detail.component';
import { RbdDetailsComponent } from './rbd-details/rbd-details.component';
import { RbdFormComponent } from './rbd-form/rbd-form.component';
import { CdRbdValidNameValidatorDirective } from './rbd-form/rbd-valid-name-validator.directive';
import { RbdListComponent } from './rbd-list/rbd-list.component';

@NgModule({
  entryComponents: [
    RbdDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule.forRoot(),
    ProgressbarModule.forRoot(),
    BsDropdownModule.forRoot(),
    SharedModule,
    ComponentsModule,
    PipesModule,
    ServicesModule,
    RouterModule
  ],
  declarations: [
    PoolDetailComponent,
    IscsiComponent,
    MirroringComponent,
    MirrorHealthColorPipe,
    RbdDetailsComponent,
    RbdListComponent,
    RbdDetailsComponent,
    RbdFormComponent,
    CdRbdValidNameValidatorDirective
  ]
})
export class BlockModule { }
