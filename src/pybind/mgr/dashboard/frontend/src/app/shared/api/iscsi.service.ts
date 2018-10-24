import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiModule } from './api.module';

@Injectable({
  providedIn: ApiModule
})
export class IscsiService {
  constructor(private http: HttpClient) {}

  getConfig() {
    return this.http.get(`api/iscsi/config`);
  }

  createTarget(targetIqn) {
    return this.http.post(`api/iscsi/target`, { target_iqn: targetIqn });
  }

  createGateway(gatewayName, ipAddress) {
    return this.http.post(`api/iscsi/gateway`, { gateway_name: gatewayName, ip_address: ipAddress});
  }
}
