import { Component, OnInit } from '@angular/core';

import { FinishedTask } from '../../../shared/models/finished-task';
import { SummaryService } from '../../../shared/services/summary.service';
import { TaskManagerMessageService } from '../../../shared/services/task-manager-message.service';
import { TaskManagerService } from '../../../shared/services/task-manager.service';
import { ExecutingTask } from '../../../shared/models/executing-task';

@Component({
  selector: 'cd-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.scss']
})
export class TaskManagerComponent implements OnInit {

  executingTasks: Array<ExecutingTask> = [];
  finishedTasks: Array<FinishedTask> = [];

  icon = 'fa-hourglass-o';

  constructor(private summaryService: SummaryService,
              private taskManagerService: TaskManagerService,
              private taskManagerMessageService: TaskManagerMessageService) { }

  ngOnInit() {
    const icons = ['fa-hourglass-o', 'fa-hourglass-start', 'fa-hourglass-half', 'fa-hourglass-end'];
    let iconIndex = 0;
    this.summaryService.summaryData$.subscribe((data: any) => {
      // console.log(data);
      this.executingTasks = data.executing_tasks;
      this.finishedTasks = data.finished_tasks;

      for (const finishedTask of this.finishedTasks) {
        if (!finishedTask.success) {
          finishedTask.errorMessage = finishedTask.exception;
        } else if (!finishedTask.ret_value.success) {
          // TODO use errno
          finishedTask.errorMessage = finishedTask.ret_value.detail;
        }
      }
      // errorMessage

      if (this.executingTasks.length > 0) {
        iconIndex++;
      } else {
        iconIndex = 0;
      }
      this.icon = icons[iconIndex];
      this.taskManagerService.triggerNotifications(this.executingTasks, this.finishedTasks);
    });
  }

  getDescription(namespace, metadata) {
    return this.taskManagerMessageService.getDescription(namespace, metadata);
  }

  isSuccess(finishedTask: FinishedTask) {
    return finishedTask.success && finishedTask.ret_value.success;
  }

  getErrorMessage(finishedTask: FinishedTask) {
    // TODO
    return '...';
  }
}
