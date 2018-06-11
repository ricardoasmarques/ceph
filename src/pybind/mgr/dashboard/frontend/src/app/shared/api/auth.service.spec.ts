import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { configureTestBed } from '../../../testing/unit-test-helper';
import { AuthStorageService } from '../services/auth-storage.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const routes: Routes = [{ path: 'logout', children: [] }];

  configureTestBed({
    providers: [AuthService, AuthStorageService],
    imports: [HttpClientTestingModule, RouterTestingModule.withRoutes(routes)]
  });

  beforeEach(() => {
    service = TestBed.get(AuthService);
    httpTesting = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(
    'should login and save the user',
    fakeAsync(() => {
      const fakeCredentials = { username: 'foo', password: 'bar' };
      service.login(<any>fakeCredentials);
      const req = httpTesting.expectOne('api/auth');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(fakeCredentials);
      req.flush(fakeCredentials);
      tick();
      expect(localStorage.getItem('dashboard_username')).toBe('foo');
    })
  );

  it(
    'should logout and remove the user',
    fakeAsync(() => {
      service.logout();
      const req = httpTesting.expectOne('api/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush({ redirect_url: '#/login' });
      tick();
      expect(localStorage.getItem('dashboard_username')).toBe(null);
    })
  );
});
