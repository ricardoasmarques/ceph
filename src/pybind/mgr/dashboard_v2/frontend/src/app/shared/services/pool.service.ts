import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class PoolService {

  constructor(private http: HttpClient) {
  }

  rbdPools() {
    // TODO
    return this.http.get('/toplevel_data').toPromise().then((resp: any) => {


      /*for (let i = 0; i < 100; i++) {
        resp.rbd_pools.push(resp.rbd_pools[0]);
      }*/



      return resp.rbd_pools;
    });
  }
}
