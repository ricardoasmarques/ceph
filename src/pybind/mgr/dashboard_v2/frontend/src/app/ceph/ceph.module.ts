import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoolModule } from './pool/pool.module';
import { PoolsComponent } from './pool/pools/pools.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    PoolModule,
    SharedModule
  ],
  exports: [PoolModule],
  declarations: []
})
export class CephModule { }
