import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RbdsComponent } from './rbds/rbds.component';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TabsModule.forRoot()
  ],
  declarations: [RbdsComponent]
})
export class BlockModule { }
