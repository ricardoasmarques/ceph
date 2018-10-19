import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { cdEncode, cdEncodeNot } from '../decorators/cd-encode';
import { ApiModule } from './api.module';

@cdEncode
@Injectable({
  providedIn: ApiModule
})
export class NfsService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get('api/nfs');
  }

  create() {
    return this.http.post('api/nfs', {}, { observe: 'response' });
  }

  delete() {
    return this.http.delete(`api/nfs`, { observe: 'response' });
  }

}
