import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UserFormMode } from './user-form-mode.enum';
import { UserFormRoleModel } from './user-form-role.model';
import { UserFormModel } from './user-form.model';

@Component({
  selector: 'cd-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  private userForm: FormGroup;

  public userFormMode = UserFormMode;
  private mode: UserFormMode;
  private allRoles: Array<UserFormRoleModel>;

  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.createForm();
  }

  createForm() {
    this.userForm = new FormGroup({
      username: new FormControl(''),
      name: new FormControl(''),
      email: new FormControl('', {
        validators: [
          Validators.email
        ]
      }),
      roles: new FormControl('')
    });
  }

  ngOnInit() {
    if (this.router.url.startsWith('/users/edit')) {
      this.mode = this.userFormMode.editing;
      this.disableForEdit();
    }
    if (this.mode === this.userFormMode.editing) {
      this.route.params.subscribe(
        (params: { username: string }) => {
          const username = params.username;
          const userFormModel = new UserFormModel();
          userFormModel.username = username;
          // TODO get user details from server
          this.setResponse(userFormModel);
        }
      );
    }

    // TODO
    this.allRoles = [
      new UserFormRoleModel('Administrator', 'Can manage all components'),
      new UserFormRoleModel('Read-Only', 'Can visualize all acomponents'),
      new UserFormRoleModel('Block Manager', 'Can manage block related operations'),
      new UserFormRoleModel('Role1', 'Can manage all components'),
      new UserFormRoleModel('Role2', 'Can manage all components'),
      new UserFormRoleModel('Role3', 'Can manage all components'),
      new UserFormRoleModel('Role4', 'Can manage all components'),
      new UserFormRoleModel('Role5', 'Can manage all components'),
      new UserFormRoleModel('Role6', 'Can manage all components'),
      new UserFormRoleModel('Role7', 'Can manage all components'),
      new UserFormRoleModel('Role8', 'Can manage all components'),
      new UserFormRoleModel('Role9', 'Can manage all components'),
      new UserFormRoleModel('Role10', 'Can manage all components'),
      new UserFormRoleModel('Role11', 'Can manage all components'),
      new UserFormRoleModel('Role12', 'Can manage all components'),
      new UserFormRoleModel('Role13', 'Can manage all components')
    ];
  }

  disableForEdit() {
    this.userForm.get('username').disable();
  }

  setResponse(response: UserFormModel) {
    this.userForm.get('username').setValue(response.username);
  }

  private updateUserRoles() {
    const selectedRoles: Array<string> = [];
    this.allRoles.forEach((role: UserFormRoleModel) => {
      if (role.selected) {
        selectedRoles.push(role.name);
      }
    });
    this.userForm.get('roles').setValue(selectedRoles);
  }

  selectRole(role: UserFormRoleModel) {
    role.selected = !role.selected;
    this.updateUserRoles();
  }

  createAction() {
    console.log('createAction - NOT IMPLEMENTED');
    console.log(this.userForm.value);
  }

  editAction() {
    console.log('editAction - NOT IMPLEMENTED');
    console.log(this.userForm.value);
  }

  submit() {
    if (this.mode === this.userFormMode.editing) {
      this.editAction();
    } else {
      this.createAction();
    }
  }
}
