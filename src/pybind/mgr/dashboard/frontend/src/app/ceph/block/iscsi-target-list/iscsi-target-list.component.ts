import { Component, OnInit } from '@angular/core';

import { IscsiService } from '../../../shared/api/iscsi.service';

@Component({
  selector: 'cd-iscsi-target-list',
  templateUrl: './iscsi-target-list.component.html',
  styleUrls: ['./iscsi-target-list.component.scss']
})
export class IscsiTargetListComponent implements OnInit {
  config: any;
  gateways = [];

  constructor(private iscsiService: IscsiService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.iscsiService.getConfig().subscribe((data: any) => {
      this.config = data;
    });
  }

  addTarget(targetIqn: string) {
    this.iscsiService.createTarget(targetIqn).subscribe((data: any) => {
      console.log(data);
      this.refresh();
    });
  }

  addGateway(gatewayName: string, ipAddress: string) {
    this.iscsiService.createGateway(gatewayName, ipAddress).subscribe((data: any) => {
      console.log(data);
      this.refresh();
    });
  }
}
