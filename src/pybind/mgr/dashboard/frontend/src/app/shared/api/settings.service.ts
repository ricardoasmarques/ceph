import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiModule } from './api.module';

@Injectable({
  providedIn: ApiModule
})
export class SettingsService {
  constructor(private http: HttpClient) {}

  get(setting) {
    return this.http.get(`api/settings/${setting}`);
  }

  bulkSet(settings: object) {
    return this.http.put('api/settings', settings);
  }
}
