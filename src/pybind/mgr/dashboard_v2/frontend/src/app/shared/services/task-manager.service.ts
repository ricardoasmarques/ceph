import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { ToastsManager } from 'ng2-toastr';

import { ExecutingTask } from '../models/executing-task';
import { FinishedTask } from '../models/finished-task';
import { Task } from '../models/task';
import { TaskManagerMessageService } from './task-manager-message.service';

@Injectable()
export class TaskManagerService {

  pendingNotifications: Array<PendingNotification> = [];

  constructor(public toastr: ToastsManager,
              private taskManagerMessageService: TaskManagerMessageService) { }

  registerForNotification(namespace, metadata) {
    this.pendingNotifications.push(new PendingNotification(namespace, metadata));
    // TODO
  }

  triggerNotifications(executingTasks: Array<ExecutingTask>, finishedTasks: Array<FinishedTask>) {
    console.log('triggerNotifications');
    console.log(executingTasks);
    console.log(finishedTasks);

    const newPendingNotifications: Array<PendingNotification> = [];
    for (const pendingNotification of this.pendingNotifications) {
      const finishedTask = <FinishedTask>this._getTask(pendingNotification, finishedTasks);
      if (finishedTask !== null) {

        // console.log(pendingNotification.namespace);
        // console.log(TaskManagetNotificationMessage[pendingNotification.namespace]);

        // TODO finishedTask.success / exception

        if (finishedTask.ret_value.success) {
          // TODO
          this.toastr.success(this.taskManagerMessageService.getSuccessMessage(
            pendingNotification.namespace, pendingNotification.metadata));
        } else {
          this.toastr.error(this.taskManagerMessageService.getErrorMessage(
            pendingNotification.namespace, pendingNotification.metadata));
        }
      } else {
        const executingTask = <ExecutingTask>this._getTask(pendingNotification, executingTasks);
        if (executingTask !== null) {
          newPendingNotifications.push(pendingNotification);
        }
      }
    }
    this.pendingNotifications = newPendingNotifications;
  }

  _getTask(pendingNotification: PendingNotification,
           tasks: Array<Task>): Task {
    for (const task of tasks) {
      if (task.namespace === pendingNotification.namespace &&
          _.isEqual(task.metadata, pendingNotification.metadata)) {
        return task;
      }
    }
    return null;
  }
}

class PendingNotification {
  namespace: string;
  metadata: object;

  constructor(namespace, metadata) {
    this.namespace = namespace;
    this.metadata = metadata;
  }
}
