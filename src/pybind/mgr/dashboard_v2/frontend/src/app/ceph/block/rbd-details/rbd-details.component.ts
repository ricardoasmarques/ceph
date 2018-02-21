import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cd-rbd-details',
  templateUrl: './rbd-details.component.html',
  styleUrls: ['./rbd-details.component.scss']
})
export class RbdDetailsComponent implements OnInit {

  @Input() selected?: Array<any> = [];

  constructor() { }

  ngOnInit() {
  }

}
