import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ConfigurationService } from './configuration.service';
import { FormService } from './form.service';
import { FormatterService } from './formatter.service';
import { PoolService } from './pool.service';
import { RbdMirroringService } from './rbd-mirroring.service';
import { RbdService } from './rbd.service';
import { SummaryService } from './summary.service';
import { TaskManagerMessageService } from './task-manager-message.service';
import { TaskManagerService } from './task-manager.service';
import { TcmuIscsiService } from './tcmu-iscsi.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [
    FormatterService,
    SummaryService,
    TcmuIscsiService,
    ConfigurationService,
    RbdMirroringService,
    PoolService,
    RbdService,
    FormService,
    TaskManagerService,
    TaskManagerMessageService
  ]
})
export class ServicesModule { }
