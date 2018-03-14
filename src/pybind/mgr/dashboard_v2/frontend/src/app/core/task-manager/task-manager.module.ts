import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PopoverModule, TooltipModule } from 'ngx-bootstrap';

import { PipesModule } from '../../shared/pipes/pipes.module';
import { TaskManagerComponent } from './task-manager/task-manager.component';

@NgModule({
  imports: [ CommonModule, PipesModule, PopoverModule.forRoot(), TooltipModule.forRoot() ],
  declarations: [ TaskManagerComponent ],
  exports: [ TaskManagerComponent ]
})
export class TaskManagerModule {}
