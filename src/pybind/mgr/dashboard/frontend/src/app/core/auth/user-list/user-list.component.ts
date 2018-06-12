import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { UserService } from '../../../shared/api/user.service';
import { DeletionModalComponent } from '../../../shared/components/deletion-modal/deletion-modal.component';
import { EmptyPipe } from '../../../shared/empty.pipe';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';

@Component({
  selector: 'cd-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @ViewChild('userRolesTpl') userRolesTpl: TemplateRef<any>;

  private columns: CdTableColumn[];
  private users: Array<any>;
  private selection = new CdTableSelection();

  private modalRef: BsModalRef;

  constructor(private userService: UserService,
              private emptyPipe: EmptyPipe,
              private modalService: BsModalService) { }

  ngOnInit() {
    this.columns = [
      {
        name: 'Username',
        prop: 'username',
        flexGrow: 1
      },
      {
        name: 'Name',
        prop: 'name',
        flexGrow: 1,
        pipe: this.emptyPipe
      },
      {
        name: 'Email',
        prop: 'email',
        flexGrow: 1,
        pipe: this.emptyPipe
      },
      {
        name: 'Roles',
        prop: 'roles',
        flexGrow: 1,
        cellTemplate: this.userRolesTpl
      }
    ];
    // FIXME
    this.users = [{
      'username': 'admin',
      'password': '$2b$12$Rhe98lA.RI8N9qKutbgMW.ff.eVE87qo1IGQHwrABcRKIh5WFIQD6',
      'name': null,
      'roles': ['Administrator'],
      'email': null
    }, {
      'username': 'rimarques',
      'password': '$2b$12$RT9d4s2Zvv8jIFFWkGlCjeMnFiqW1Dsnpkp7kolhRgmRjDJlBmGNK',
      'name': 'Ricardo Marques',
      'roles': ['Test'],
      'email': 'r@mail.com'
    }];
    // this.userService.list().subscribe((users: Array<any>) => {
    //   this.users = users;
    // });
  }

  updateSelection(selection: CdTableSelection) {
    this.selection = selection;
  }

  deleteUser(username: string) {
    console.log('deleteUser - NOT IMPLEMENTED');
  }

  deleteUserModal() {
    const username = this.selection.first().username;
    this.modalRef = this.modalService.show(DeletionModalComponent);
    this.modalRef.content.setUp({
      metaType: 'User',
      pattern: `${username}`,
      deletionMethod: () => this.deleteUser(username),
      modalRef: this.modalRef
    });
  }
}
