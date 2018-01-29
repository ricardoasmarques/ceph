import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeysPipe } from './keys.pipe';
import { AppRoutingModule } from '../../app-routing.module';
import { PoolsComponent } from './pools/pools.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule
  ],
  declarations: [KeysPipe, PoolsComponent],
  exports: [KeysPipe]
})
export class PoolModule { }
