import { inject, TestBed } from '@angular/core/testing';

import { TaskManagerService } from './task-manager.service';

describe('TaskManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ TaskManagerService ]
    });
  });

  it('should be created', inject([TaskManagerService], (service: TaskManagerService) => {
    expect(service).toBeTruthy();
  }));
});
