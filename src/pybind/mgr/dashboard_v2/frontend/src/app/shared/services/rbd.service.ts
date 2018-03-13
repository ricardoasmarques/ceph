import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class RbdService {

  constructor(private http: HttpClient) {
  }

  create(rbd) {
    return this.http.post('/api/rbd', rbd).toPromise().then((resp: any) => {
      return resp;
    });
  }

  delete(poolName, rbdName) {
    // FIXME
    // return this.http.delete(`/api/rbd/${poolName}/${rbdName}`).toPromise().then((resp: any) => {
    return this.http.get(`api/rbd/${poolName}`).toPromise().then((resp: any) => {
      // FIXME
      // return resp;
      return 1;
    });
  }

  getPoolImages(pool) {
    return this.http.get(`api/rbd/${pool}`).toPromise().then((resp: any) => {
      return resp;
    });
  }
}
