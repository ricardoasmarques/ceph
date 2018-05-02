import { Injectable } from '@angular/core';

import { Permission, PermissionType } from '../models/permission';
import { AuthStorageService } from './auth-storage.service';
import { ServicesModule } from './services.module';

@Injectable({
  providedIn: ServicesModule
})
export class PermissionService {

  constructor(private authStorageService: AuthStorageService) {
  }

  hasPermission(permission: Permission) {
    const scope = permission.scope;
    if (!scope) {
      throw new Error('"scope" is required.');
    }

    let showIfList = permission.showIf || [];
    if (!(showIfList instanceof Array)) {
      showIfList = [<PermissionType>showIfList];
    }

    const showIfSomeList = permission.showIfSome || [];

    if (showIfList.length > 0 && showIfSomeList.length > 0) {
      throw new Error('Use "showIf" or "showIfSome", not both.');
    }

    let showIfNotList = permission.showIfNot || [];
    if (!(showIfNotList instanceof Array)) {
      showIfNotList = [<PermissionType>showIfNotList];
    }

    let hasPermission = true ;
    const permissions = this.authStorageService.getPermissionsByScope(scope);
    if (showIfList.length > 0) {
      const hasAllShowIf = showIfList.every((showIf) => {
        return permissions.indexOf(showIf) !== -1;
      });
      if (!hasAllShowIf) {
        hasPermission = false;
      }
    }
    if (showIfSomeList.length > 0) {
      const hasAnyShowIfSome = showIfSomeList.some((showIfSome) => {
        return permissions.indexOf(showIfSome) !== -1;
      });
      if (!hasAnyShowIfSome) {
        hasPermission = false;
      }
    }
    const hasAnyShowIfNot = showIfNotList.some((showIfNot) => {
      return permissions.indexOf(showIfNot) !== -1;
    });
    if (hasAnyShowIfNot) {
      hasPermission = false;
    }
    return hasPermission;
  }
}
