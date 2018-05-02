import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthStorageService } from './auth-storage.service';
import { PermissionService } from './permission.service';
import { ServicesModule } from './services.module';

@Injectable({
  providedIn: ServicesModule
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router,
              private authStorageService: AuthStorageService,
              private permissionService: PermissionService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authStorageService.isLoggedIn()) {
      if (route.routeConfig['permission']) {
        const hasPermission = this.permissionService.hasPermission(route.routeConfig['permission']);
        if (!hasPermission) {
          this.router.navigate(['/403']);
          return false;
        }
      }
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
