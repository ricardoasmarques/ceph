import { Component, OnInit } from '@angular/core';
import { PoolService } from '../../../shared/services/pool.service';

@Component({
  selector: 'cd-pools',
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.scss']
})
export class PoolsComponent implements OnInit {

  pools: any[];

  constructor(private poolService: PoolService) { }

  ngOnInit() {
    // TODO
    this.pools = this.poolService.list().results;
  }

}
