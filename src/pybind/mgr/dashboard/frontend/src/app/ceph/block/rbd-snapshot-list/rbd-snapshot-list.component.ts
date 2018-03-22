import {
  Component,
  Input,
  OnChanges,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';

import * as _ from 'lodash';
import { ToastsManager } from 'ng2-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import {
  RbdService
} from '../../../shared/api/rbd.service';
import {
  DeleteConfirmationComponent
} from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';
import { ExecutingTask } from '../../../shared/models/executing-task';
import { FinishedTask } from '../../../shared/models/finished-task';
import { CdDatePipe } from '../../../shared/pipes/cd-date.pipe';
import { DimlessBinaryPipe } from '../../../shared/pipes/dimless-binary.pipe';
import {
  NotificationService
} from '../../../shared/services/notification.service';
import { TaskManagerService } from '../../../shared/services/task-manager.service';
import { RbdSnapshotFormComponent } from '../rbd-snapshot-form/rbd-snapshot-form.component';
import { RbdSnapshotModel } from './rbd-snapshot.model';

@Component({
  selector: 'cd-rbd-snapshot-list',
  templateUrl: './rbd-snapshot-list.component.html',
  styleUrls: ['./rbd-snapshot-list.component.scss']
})
export class RbdSnapshotListComponent implements OnInit, OnChanges {

  @Input() snapshots: RbdSnapshotModel[] = [];
  @Input() poolName: string;
  @Input() rbdName: string;
  @Input() executingTasks: ExecutingTask[] = [];

  @ViewChild('nameTpl') nameTpl: TemplateRef<any>;
  @ViewChild('protectTpl') protectTpl: TemplateRef<any>;

  data: RbdSnapshotModel[];

  columns: CdTableColumn[];

  modalRef: BsModalRef;

  selection = new CdTableSelection();

  constructor(private modalService: BsModalService,
              private dimlessBinaryPipe: DimlessBinaryPipe,
              private cdDatePipe: CdDatePipe,
              private rbdService: RbdService,
              private toastr: ToastsManager,
              private taskManagerService: TaskManagerService,
              private notificationService: NotificationService) { }

  ngOnInit() {
    this.columns = [
      {
        name: 'Name',
        prop: 'name',
        cellTemplate: this.nameTpl,
        flexGrow: 2
      },
      {
        name: 'Size',
        prop: 'size',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: this.dimlessBinaryPipe
      },
      {
        name: 'Usage',
        prop: 'disk_usage',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: this.dimlessBinaryPipe
      },
      {
        name: 'State',
        prop: 'is_protected',
        flexGrow: 1,
        cellClass: 'text-center',
        cellTemplate: this.protectTpl
      },
      {
        name: 'Created',
        prop: 'timestamp',
        flexGrow: 1,
        pipe: this.cdDatePipe
      }
    ];
  }

  ngOnChanges() {
    this.data = this._merge(this.snapshots, this.executingTasks);
  }

  _merge(snapshots: RbdSnapshotModel[], executingTasks: ExecutingTask[] = []) {
    const resultSnapshots = _.clone(snapshots);
    executingTasks.forEach((executingTask) => {
      if (executingTask.name === 'rbd/snap/create') {
        const exists = resultSnapshots.some((snapshot) => {
          return snapshot.name === executingTask.metadata['snapshot_name'];
        });
        if (!exists) {
          const rbdSnapshotModel = new RbdSnapshotModel();
          rbdSnapshotModel.name = executingTask.metadata['snapshot_name'];
          rbdSnapshotModel.executing = 'creating';
          resultSnapshots.push(rbdSnapshotModel);
        }
      } else if (executingTask.name === 'rbd/snap/delete') {
        const snapshotToDelete = resultSnapshots.find((snapshot) => {
          return snapshot.name === executingTask.metadata['snapshot_name'];
        });
        if (snapshotToDelete) {
          snapshotToDelete.executing = 'deleting';
        }
      } else if (executingTask.name === 'rbd/snap/edit') {
        const snapshotToUpdate = resultSnapshots.find((snapshot) => {
          return snapshot.name === executingTask.metadata['snapshot_name'];
        });
        if (snapshotToUpdate) {
          snapshotToUpdate.executing = 'updating';
        }
      }
    });
    return resultSnapshots;
  }

  openCreateSnapshotModal() {
    this.modalRef = this.modalService.show(RbdSnapshotFormComponent);
    this.modalRef.content.poolName = this.poolName;
    this.modalRef.content.imageName = this.rbdName;
    this.modalRef.content.onSubmit.subscribe((snapshotName: string) => {
      const executingTask = new ExecutingTask();
      executingTask.name = 'rbd/snap/create';
      executingTask.metadata = {'snapshot_name': snapshotName};
      this.executingTasks.push(executingTask);
      this.ngOnChanges();
    });
  }

  openEditSnapshotModal() {
    this.modalRef = this.modalService.show(RbdSnapshotFormComponent);
    this.modalRef.content.poolName = this.poolName;
    this.modalRef.content.imageName = this.rbdName;
    this.modalRef.content.setSnapName(this.selection.first().name);
    this.modalRef.content.onSubmit.subscribe((snapshotName: string) => {
      const executingTask = new ExecutingTask();
      executingTask.name = 'rbd/snap/edit';
      executingTask.metadata = {'snapshot_name': snapshotName};
      this.executingTasks.push(executingTask);
      this.ngOnChanges();
    });
  }

  updateSelection(selection: CdTableSelection) {
    this.selection = selection;
  }

  deleteSnapshot(snapshotName) {
    const finishedTask = new FinishedTask();
    finishedTask.name = 'rbd/snap/delete';
    finishedTask.metadata = {
      'pool_name': this.poolName,
      'image_name': this.rbdName,
      'snapshot_name': snapshotName
    };
    this.rbdService.deleteSnapshot(this.poolName, this.rbdName, snapshotName)
      .then(() => {
        const executingTask = new ExecutingTask();
        executingTask.name = finishedTask.name;
        executingTask.metadata = finishedTask.metadata;
        this.executingTasks.push(executingTask);
        this.ngOnChanges();
        this.taskManagerService.subscribe(executingTask.name, executingTask.metadata,
          (asyncFinishedTask: FinishedTask) => {
            this.notificationService.notifyTask(asyncFinishedTask);
          });
      })
      .catch((resp) => {
        finishedTask.success = false;
        finishedTask.exception = resp.error;
        this.notificationService.notifyTask(finishedTask);
      });
  }

  deleteSnapshotModal() {
    const snapshotName = this.selection.selected[0].name;
    this.modalRef = this.modalService.show(DeleteConfirmationComponent);
    this.modalRef.content.itemName = snapshotName;
    this.modalRef.content.onSubmit.subscribe((itemName: string) => {
      this.deleteSnapshot(itemName);
      this.modalRef.hide();
    });
  }
}
