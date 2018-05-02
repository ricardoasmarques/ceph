import { Injectable } from '@angular/core';

import { PermissionType } from '../models/permission';
import { ServicesModule } from './services.module';

@Injectable({
  providedIn: ServicesModule
})
export class AuthStorageService {

  constructor() {
  }

  set(username: string, permissions: Array<any>) {
    localStorage.setItem('dashboard_username', username);
    localStorage.setItem('dashboard_permissions', JSON.stringify(permissions));
  }

  remove() {
    localStorage.removeItem('dashboard_username');
  }

  isLoggedIn() {
    return localStorage.getItem('dashboard_username') !== null;
  }

  protected getPermissions(): any {
    return JSON.parse(localStorage.getItem('dashboard_permissions') || '{}');
  }

  getPermissionsByScope(scope: string): Array<PermissionType> {
    return this.getPermissions()[scope] || [];
  }
}
