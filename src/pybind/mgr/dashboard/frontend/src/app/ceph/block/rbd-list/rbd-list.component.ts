import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import * as _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { RbdService } from '../../../shared/api/rbd.service';
import {
  DeleteConfirmationComponent
} from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { NotificationType } from '../../../shared/enum/notification-type.enum';
import { ViewCacheStatus } from '../../../shared/enum/view-cache-status.enum';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';
import { ExecutingTask } from '../../../shared/models/executing-task';
import { FinishedTask } from '../../../shared/models/finished-task';
import { DimlessBinaryPipe } from '../../../shared/pipes/dimless-binary.pipe';
import { DimlessPipe } from '../../../shared/pipes/dimless.pipe';
import {
  NotificationService
} from '../../../shared/services/notification.service';
import { SummaryService } from '../../../shared/services/summary.service';
import { TaskManagerMessageService } from '../../../shared/services/task-manager-message.service';
import { TaskManagerService } from '../../../shared/services/task-manager.service';
import { RbdModel } from './rbd-model';

@Component({
  selector: 'cd-rbd-list',
  templateUrl: './rbd-list.component.html',
  styleUrls: ['./rbd-list.component.scss']
})
export class RbdListComponent implements OnInit {

  @ViewChild('usageTpl') usageTpl: TemplateRef<any>;
  @ViewChild('parentTpl') parentTpl: TemplateRef<any>;
  @ViewChild('nameTpl') nameTpl: TemplateRef<any>;

  images: any;
  executingTasks: ExecutingTask[] = [];
  columns: CdTableColumn[];
  retries: number;
  viewCacheStatusList: any[];
  selection = new CdTableSelection();

  modalRef: BsModalRef;

  constructor(private rbdService: RbdService,
              private dimlessBinaryPipe: DimlessBinaryPipe,
              private dimlessPipe: DimlessPipe,
              private summaryService: SummaryService,
              private modalService: BsModalService,
              private notificationService: NotificationService,
              private taskManagerMessageService: TaskManagerMessageService,
              private taskManagerService: TaskManagerService) {
  }

  ngOnInit() {
    this.columns = [
      {
        name: 'Name',
        prop: 'name',
        flexGrow: 2,
        cellTemplate: this.nameTpl
      },
      {
        name: 'Pool',
        prop: 'pool_name',
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
        name: 'Objects',
        prop: 'num_objs',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: this.dimlessPipe
      },
      {
        name: 'Object size',
        prop: 'obj_size',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: this.dimlessBinaryPipe
      },
      {
        name: 'Provisioned',
        prop: 'disk_usage',
        cellClass: 'text-center',
        flexGrow: 1,
        pipe: this.dimlessBinaryPipe
      },
      {
        name: 'Total provisioned',
        prop: 'total_disk_usage',
        cellClass: 'text-center',
        flexGrow: 1,
        pipe: this.dimlessBinaryPipe
      },
      {
        name: 'Parent',
        prop: 'parent',
        flexGrow: 2,
        cellTemplate: this.parentTpl
      }
    ];

    this.summaryService.get().then(resp => {
      this.loadImages(resp.executing_tasks);
      this.summaryService.summaryData$.subscribe((data: any) => {
        this.loadImages(data.executing_tasks);
      });
    });

  }

  loadImages(executingTasks) {
    if (executingTasks === null) {
      executingTasks = this.executingTasks;
    }
    this.rbdService.list().then(
      resp => {
        let images = [];
        const viewCacheStatusMap = {};
        resp.forEach(pool => {
          if (_.isUndefined(viewCacheStatusMap[pool.status])) {
            viewCacheStatusMap[pool.status] = [];
          }
          viewCacheStatusMap[pool.status].push(pool.pool_name);
          images = images.concat(pool.value);
        });
        const viewCacheStatusList = [];
        _.forEach(viewCacheStatusMap, (value, key) => {
          viewCacheStatusList.push({
            status: parseInt(key, 10),
            statusFor: (value.length > 1 ? 'pools ' : 'pool ') +
            '<strong>' + value.join('</strong>, <strong>') + '</strong>'
          });
        });
        this.viewCacheStatusList = viewCacheStatusList;
        images.forEach(image => {
          image.executingTasks = this._getExecutingTasks(executingTasks,
            image.pool_name, image.name);
        });
        this.images = this._merge(images, executingTasks);
        this.executingTasks = executingTasks;
      },
      () => {
        this.viewCacheStatusList = [{status: ViewCacheStatus.ValueException}];
      }
    );
  }

  _getExecutingTasks(executingTasks: ExecutingTask[], poolName, imageName): ExecutingTask[] {
    const result: ExecutingTask[] = [];
    executingTasks.forEach(executingTask => {
      if (executingTask.name === 'rbd/snap/create' ||
        executingTask.name === 'rbd/snap/delete' ||
        executingTask.name === 'rbd/snap/edit') {
        if (poolName === executingTask.metadata['pool_name'] &&
          imageName === executingTask.metadata['image_name']) {
          result.push(executingTask);
        }
      }
    });
    return result;
  }

  _merge(rbds: RbdModel[], executingTasks: ExecutingTask[] = []) {
    const resultRBDs = _.clone(rbds);
    executingTasks.forEach((executingTask) => {
      if (executingTask.name === 'rbd/create') {
        const exists = resultRBDs.some((rbd) => {
          return rbd.pool_name === executingTask.metadata['pool_name'] &&
            rbd.name === executingTask.metadata['image_name'];
        });
        if (!exists) {
          const rbdModel = new RbdModel();
          rbdModel.name = executingTask.metadata['image_name'];
          rbdModel.pool_name = executingTask.metadata['pool_name'];
          rbdModel.executing = 'creating';
          resultRBDs.push(rbdModel);
        }
      } else if (executingTask.name === 'rbd/delete') {
        const rbdToDelete = resultRBDs.find((rbd) => {
          return rbd.pool_name === executingTask.metadata['pool_name'] &&
            rbd.name === executingTask.metadata['image_name'];
        });
        if (rbdToDelete) {
          rbdToDelete.executing = 'deleting';
        }
      } else if (executingTask.name === 'rbd/edit') {
        const rbdToDelete = resultRBDs.find((rbd) => {
          return rbd.pool_name === executingTask.metadata['pool_name'] &&
            rbd.name === executingTask.metadata['image_name'];
        });
        if (rbdToDelete) {
          rbdToDelete.executing = 'updating';
        }
      }
    });
    return resultRBDs;
  }

  updateSelection(selection: CdTableSelection) {
    this.selection = selection;
  }

  deleteRbd(poolName: string, imageName: string) {
    const finishedTask = new FinishedTask();
    finishedTask.name = 'rbd/delete';
    finishedTask.metadata = {'pool_name': poolName, 'image_name': imageName};
    this.rbdService.delete(poolName, imageName)
      .then((resp) => {
        if (resp.status === 202) {
          this.notificationService.show(NotificationType.info,
            `RBD deletion in progress...`,
            this.taskManagerMessageService.getDescription(finishedTask));
          const executingTask = new ExecutingTask();
          executingTask.name = finishedTask.name;
          executingTask.metadata = finishedTask.metadata;
          this.executingTasks.push(executingTask);
          this.taskManagerService.subscribe(executingTask.name, executingTask.metadata,
            (asyncFinishedTask: FinishedTask) => {
              this.notificationService.notifyTask(asyncFinishedTask);
            });
        } else {
          finishedTask.success = true;
          this.notificationService.notifyTask(finishedTask);
        }
        this.loadImages(null);
      }).catch((resp) => {
        finishedTask.success = false;
        finishedTask.exception = resp.error;
        this.notificationService.notifyTask(finishedTask);
      });
  }

  deleteRbdModal() {
    const poolName = this.selection.first().pool_name;
    const imageName = this.selection.first().name;
    this.modalRef = this.modalService.show(DeleteConfirmationComponent);
    this.modalRef.content.itemName = `${poolName}/${imageName}`;
    this.modalRef.content.onSubmit.subscribe(() => {
      this.deleteRbd(poolName, imageName);
      this.modalRef.hide();
    });
  }
}
