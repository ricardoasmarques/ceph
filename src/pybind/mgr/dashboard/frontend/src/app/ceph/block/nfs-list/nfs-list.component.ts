import {Component, OnInit} from '@angular/core';
import {CdTableAction} from '../../../shared/models/cd-table-action';
import {CdTableColumn} from '../../../shared/models/cd-table-column';
import {CdTableSelection} from '../../../shared/models/cd-table-selection';
import {TaskListService} from '../../../shared/services/task-list.service';
import {NfsService} from "../../../shared/api/nfs.service";
import {CdTableFetchDataContext} from "../../../shared/models/cd-table-fetch-data-context";


@Component({
  selector: 'cd-nfs-list',
  templateUrl: './nfs-list.component.html',
  styleUrls: ['./nfs-list.component.scss'],
  providers: [TaskListService]
})
export class NfsListComponent implements OnInit {

  tableActions: CdTableAction[];
  nfsList: any;
  columns: CdTableColumn[];
  selection = new CdTableSelection();

  constructor(
    private nfsService: NfsService
  ) {
    const startAction: CdTableAction = {
      permission: 'create',
      icon: '',
      click: () => this.startAction(),
      name: 'Start'
    };
    const stopAction: CdTableAction = {
      permission: 'create',
      icon: '',
      click: () => this.stopAction(),
      name: 'Stop'
    };
    this.tableActions = [
      startAction,
      stopAction
    ];
  }

  ngOnInit() {
    this.columns = [
      {
        name: 'Id',
        prop: 'id'
      }
    ];
  }

  getNfsList(context: CdTableFetchDataContext) {
    this.nfsList = [{id: 'aaa'}, {id: 'bbb'}];
    // FIXME
    //this.nfsService.list().subscribe((data) => {
    //  this.nfsList = data;
    //});
  }
  updateSelection(selection: CdTableSelection) {
    this.selection = selection;
  }

  startAction() {
    this.nfsService.create().subscribe((data) => {
    });
  }

  stopAction() {
    this.nfsService.delete().subscribe((data) => {
    });
  }
}
