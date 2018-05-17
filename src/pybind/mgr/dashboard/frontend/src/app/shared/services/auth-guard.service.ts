import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthStorageService } from './auth-storage.service';
import {KeycloakService} from "../../keycloak-service/keycloak.service";

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private authStorageService: AuthStorageService, private keycloakService: KeycloakService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("isAuth: " + this.keycloakService.authenticated());
    if (this.authStorageService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    // TODO : create a login page auth guard
    // this.keycloakService.login({redirectUri: state.url});
    return false;
  }
}
