import { inject, TestBed } from '@angular/core/testing';

import { AuthStorageService } from './auth-storage.service';
import { PermissionService } from './permission.service';

class AuthStorageServiceMock extends AuthStorageService {

  protected getPermissions(): any {
    return {
      'hosts': ['create', 'read', 'update']
    };
  }
}

describe('PermissionService', () => {
  beforeEach(() => {
    TestBed
      .configureTestingModule({
        providers: [
          PermissionService,
          AuthStorageService
        ]
      })
      .overrideProvider(AuthStorageService, {useValue: new AuthStorageServiceMock()});
  });

  it('should be created',
    inject([PermissionService], (service: PermissionService) => {
      expect(service).toBeTruthy();
    }));

  it('should check showIf single permission',
    inject([PermissionService], (service: PermissionService) => {
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: 'create'
      })).toBeTruthy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: 'read'
      })).toBeTruthy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: 'update'
      })).toBeTruthy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: 'delete'
      })).toBeFalsy();
    }));

  it('should check showIf list permission',
    inject([PermissionService], (service: PermissionService) => {
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: ['create', 'update']
      })).toBeTruthy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: ['create', 'delete']
      })).toBeFalsy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: ['delete']
      })).toBeFalsy();
    }));

  it('should check showIfSome list permission',
    inject([PermissionService], (service: PermissionService) => {
      expect(service.hasPermission({
        scope: 'hosts',
        showIfSome: ['create', 'update']
      })).toBeTruthy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIfSome: ['create', 'delete']
      })).toBeTruthy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIfSome: ['delete']
      })).toBeFalsy();
    }));

  it('should check showIfNot single permission',
    inject([PermissionService], (service: PermissionService) => {
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: ['create', 'update'],
        showIfNot: 'delete'
      })).toBeTruthy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: ['create', 'update'],
        showIfNot: 'read'
      })).toBeFalsy();
    }));

  it('should check showIfNot list permission',
    inject([PermissionService], (service: PermissionService) => {
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: ['create', 'update'],
        showIfNot: ['delete']
      })).toBeTruthy();
      expect(service.hasPermission({
        scope: 'hosts',
        showIf: ['create', 'update'],
        showIfNot: ['read']
      })).toBeFalsy();
    }));

});
