import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AuthStorageService } from './services/auth-storage.service';
import { AuthGuardService } from './services/auth-guard.service';
import { PipesModule } from './pipes/pipes.module';
import { HostService } from './services/host.service';
import { PoolService } from './services/pool.service';
import { RbdService } from './services/rbd.service';

@NgModule({
  imports: [
    CommonModule,
    PipesModule
  ],
  declarations: [],
  providers: [
    AuthService,
    AuthStorageService,
    AuthGuardService,
    HostService,
    PoolService,
    RbdService
  ],
  exports: [
    PipesModule
  ]
})
export class SharedModule { }
