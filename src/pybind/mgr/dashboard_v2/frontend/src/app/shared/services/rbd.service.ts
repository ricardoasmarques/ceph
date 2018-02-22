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
}
