import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap';

import { AuthService } from '../../../shared/api/auth.service';
import { Credentials } from '../../../shared/models/credentials';
import { AuthStorageService } from '../../../shared/services/auth-storage.service';

@Component({
  selector: 'cd-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  model = new Credentials();
  isLoginActive = false;

  constructor(
    private authService: AuthService,
    private authStorageService: AuthStorageService,
    private bsModalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authStorageService.isLoggedIn()) {
      this.router.navigate(['']);
    } else {
      // Make sure all open modal dialogs are closed. This might be
      // necessary when the logged in user is redirected to the login
      // page after a 401.
      const modalsCount = this.bsModalService.getModalsCount();
      for (let i = 1; i <= modalsCount; i++) {
        this.bsModalService.hide(i);
      }
      this.authService.current().then((login) => {
        if (login.login_url) {
          if (login.login_url === '#/login') {
            this.isLoginActive = true;
          } else {
            window.location.replace(login.login_url);
          }
        } else {
          this.authStorageService.set(login.username, login.permissions);
          this.router.navigate(['']);
        }
      });
    }
  }

  login() {
    this.authService.login(this.model).then(() => {
      this.router.navigate(['']);
    });
  }
}
