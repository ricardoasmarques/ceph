import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { HostService } from '../../../shared/api/host.service';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { CephShortVersionPipe } from '../../../shared/pipes/ceph-short-version.pipe';
import { PermissionService } from '../../../shared/services/permission.service';

@Component({
  selector: 'cd-hosts',
  templateUrl: './hosts.component.html',
  styleUrls: ['./hosts.component.scss']
})
export class HostsComponent implements OnInit {

  columns: Array<CdTableColumn> = [];
  hosts: Array<object> = [];
  isLoadingHosts = false;

  @ViewChild('servicesTpl') public servicesTpl: TemplateRef<any>;

  constructor(private hostService: HostService,
              private cephShortVersionPipe: CephShortVersionPipe,
              private permissionService: PermissionService) { }

  ngOnInit() {
    this.columns = [
      {
        name: 'Hostname',
        prop: 'hostname',
        flexGrow: 1
      },
      {
        name: 'Services',
        prop: 'services',
        flexGrow: 3,
        cellTemplate: this.servicesTpl
      },
      {
        name: 'Version',
        prop: 'ceph_version',
        flexGrow: 1,
        pipe: this.cephShortVersionPipe
      }
    ];
  }

  getHosts() {
    if (this.isLoadingHosts) {
      return;
    }
    const typeToScope = {
      'mds': 'cephfs',
      'mon': 'monitor',
      'osd': 'osd',
      'rgw': 'rgw',
      'rbd-mirror': 'rbd-mirroring',
      'mgr': 'manager',
    };
    this.isLoadingHosts = true;
    this.hostService.list().then((resp) => {
      resp.map((host) => {
        host.services.map((service) => {
          service.cdLink = `/perf_counters/${service.type}/${service.id}`;
          const scope = typeToScope[service.type];
          service.canRead = this.permissionService.hasPermission({scope: scope, showIf: 'read'});
          return service;
        });
        return host;
      });
      this.hosts = resp;
      this.isLoadingHosts = false;
    }).catch(() => {
      this.isLoadingHosts = false;
    });
  }
}
