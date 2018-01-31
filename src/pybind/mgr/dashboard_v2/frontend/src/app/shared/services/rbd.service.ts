import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class RbdService {

  constructor(private http: HttpClient) {
  }

  rbdPoolImages(pool) {
    // TODO
    return this.http.get(`/rbd_pool_data/${pool}`).toPromise().then((resp: any) => {
      return resp;
    });
  }
}
