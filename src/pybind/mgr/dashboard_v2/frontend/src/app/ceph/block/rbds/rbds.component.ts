import { Component, OnInit } from '@angular/core';
import { PoolService } from '../../../shared/services/pool.service';
import { RbdService } from '../../../shared/services/rbd.service';

@Component({
  selector: 'cd-rbds',
  templateUrl: './rbds.component.html',
  styleUrls: ['./rbds.component.scss']
})
export class RbdsComponent implements OnInit {

  rbdPools: any;
  selectedPool: string;
  images: any;

  constructor(private poolService: PoolService,
              private rbdService: RbdService) { }

  ngOnInit() {
    this.poolService.rbdPools().then((resp) => {
      this.rbdPools = resp;
      if (this.rbdPools.length > 0) {
        this.onSelectedPoolChange(this.rbdPools[0].name);
      }
    });
  }

  onSelectedPoolChange(newValue) {
    this.selectedPool = newValue;
    this.rbdService.rbdPoolImages(this.selectedPool).then((resp) => {
      this.images = resp;
    });
  }
}
