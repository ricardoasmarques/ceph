import { Injectable } from '@angular/core';

@Injectable()
export class TaskManagerMessageService {

  messages = {
    'rbd/create': new TaskManagerMessage(
      (metadata) => `descr for ${metadata}`,
      (metadata) => `success for ${metadata}`,
      (metadata) => `error for ${metadata}`
    )
  };

  constructor() { }

  getSuccessMessage(namespace, metadata) {
    return this.messages[namespace].success(metadata);
  }

  getErrorMessage(namespace, metadata) {
    return this.messages[namespace].error(metadata);
  }

  getDescription(namespace, metadata) {
    return this.messages[namespace].descr(metadata);
  }
}

class TaskManagerMessage {
  descr: (metadata) => string;
  success: (metadata) => string;
  error: (metadata) => string;

  constructor(descr: (metadata) => string,
              success: (metadata) => string,
              error: (metadata) => string) {
    this.descr = descr;
    this.success = success;
    this.error = error;
  }
}
