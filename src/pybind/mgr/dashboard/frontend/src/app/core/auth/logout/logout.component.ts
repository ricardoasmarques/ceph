import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../shared/api/auth.service';

@Component({
  selector: 'cd-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }
}
