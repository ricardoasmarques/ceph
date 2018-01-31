import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClusterModule } from './cluster/cluster.module';
import { BlockModule } from './block/block.module';

@NgModule({
  imports: [
    CommonModule,
    ClusterModule,
    BlockModule
  ],
  declarations: []
})
export class CephModule { }
