import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AuthModule } from './auth/auth.module';
import { NavigationModule } from './navigation/navigation.module';
import { NotFoundComponent } from './not-found/not-found.component';
import { TaskManagerModule } from './task-manager/task-manager.module';

@NgModule({
  imports: [
    CommonModule,
    NavigationModule,
    AuthModule,
    TaskManagerModule
  ],
  exports: [NavigationModule],
  declarations: [NotFoundComponent]
})
export class CoreModule { }
