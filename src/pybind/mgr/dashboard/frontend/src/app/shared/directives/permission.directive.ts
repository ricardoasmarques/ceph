import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

import { Permission } from '../models/permission';
import { PermissionService } from '../services/permission.service';

/**
 * Conditionally includes a template based on user permissions.
 *
 * Parameters:
 *   - scope:      Scope that will be used to check user permissions
 *   - showIf:     Include template if user has all permissions
 *   - showIfSome: Include template if user has at least one permission
 *   - showIfNot:  Include template if user has not all permissions
 *
 * Examples:
 *
 *   Include template if user has 'read' access to 'rbd-images':
 *   ```
 *   <div *cdPermission="{scope: 'rbd-images', showIf: 'read'}"></div>
 *   ```
 *
 *   Include template if user has 'read' access to 'rbd-images', but has not 'create' access:
 *   ```
 *   <div *cdPermission="{scope: 'rbd-images', showIf: 'read', showIfNot: 'create'}"></div>
 *   ```
 *
 *   Include template if user has 'create' AND 'delete' access to 'rbd-images':
 *   ```
 *   <div *cdPermission="{scope: 'rbd-images', showIf: ['read', 'delete']}"></div>
 *   ```
 *
 *   Include template if user has 'create' OR 'delete' access to 'rbd-images':
 *   ```
 *   <div *cdPermission="{scope: 'rbd-images', showIfSome: ['read', 'delete']}"></div>
 *   ```
 */
@Directive({
  selector: '[cdPermission]'
})
export class PermissionDirective implements OnInit {

  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private permissionService: PermissionService) { }

  @Input() cdPermission: Permission;

  ngOnInit() {
    const hasPermission = this.permissionService.hasPermission(this.cdPermission);
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
