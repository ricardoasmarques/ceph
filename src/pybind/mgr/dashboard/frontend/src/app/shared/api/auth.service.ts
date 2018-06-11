import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Credentials } from '../models/credentials';
import { AuthStorageService } from '../services/auth-storage.service';
import { ApiModule } from './api.module';

@Injectable({
  providedIn: ApiModule
})
export class AuthService {
  constructor(private authStorageService: AuthStorageService, private http: HttpClient) {}

  current() {
    return this.http
      .get('api/auth')
      .toPromise()
      .then((resp: any) => {
        return resp;
      });
  }

  login(credentials: Credentials) {
    return this.http
      .post('api/auth', credentials)
      .toPromise()
      .then((resp: Credentials) => {
        this.authStorageService.set(resp.username, resp.permissions);
      });
  }

  logout(callback: Function = null) {
    return this.http.post('api/auth/logout', null).subscribe((resp: any) => {
      this.authStorageService.remove();
      if (callback) {
        callback();
      }
      window.location.replace(resp.redirect_url);
    });
  }
}
