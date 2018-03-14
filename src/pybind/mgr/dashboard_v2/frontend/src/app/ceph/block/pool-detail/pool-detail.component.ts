import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ViewCacheStatus } from '../../../shared/enum/view-cache-status.enum';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';
import { DimlessBinaryPipe } from '../../../shared/pipes/dimless-binary.pipe';
import { DimlessPipe } from '../../../shared/pipes/dimless.pipe';
import { RbdService } from '../../../shared/services/rbd.service';
import { SummaryService } from '../../../shared/services/summary.service';

@Component({
  selector: 'cd-pool-detail',
  templateUrl: './pool-detail.component.html',
  styleUrls: ['./pool-detail.component.scss']
})
export class PoolDetailComponent implements OnInit, OnDestroy {
  name: string;
  images: any;
  columns: CdTableColumn[];
  retries: number;
  routeParamsSubscribe: any;
  viewCacheStatus: ViewCacheStatus;

  // TODO declare a type for Tasks
  executingTasks: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private rbdService: RbdService,
    dimlessBinaryPipe: DimlessBinaryPipe,
    dimlessPipe: DimlessPipe,
    private summaryService: SummaryService
  ) {
    this.columns = [
      {
        name: 'Name',
        prop: 'name_descr',
        flexGrow: 2
      },
      {
        name: 'Size',
        prop: 'size',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: dimlessBinaryPipe
      },
      {
        name: 'Objects',
        prop: 'num_objs',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: dimlessPipe
      },
      {
        name: 'Object size',
        prop: 'obj_size',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: dimlessBinaryPipe
      },
      {
        name: 'Features',
        prop: 'features_name',
        flexGrow: 3
      },
      {
        name: 'Parent',
        prop: 'parent',
        flexGrow: 2
      }
    ];
  }

  ngOnInit() {
    this.routeParamsSubscribe = this.route.params.subscribe((params: { name: string }) => {
      this.name = params.name;
      this.images = [];
      this.retries = 0;
    });
    this.summaryService.summaryData$.subscribe((data: any) => {
      const executingTasks = [];
      data.executing_tasks.forEach((executingTask) => {
        if (executingTask.namespace === 'rbd/create' &&
            executingTask.metadata.pool_name === this.name) {
          executingTasks.push(executingTask);
        }
      });
      this.executingTasks = executingTasks;
    });
  }

  ngOnDestroy() {
    this.routeParamsSubscribe.unsubscribe();
  }

  loadImages() {
    this.rbdService.getPoolImages(this.name).then(
      resp => {
        this.viewCacheStatus = resp.status;
        resp.value.forEach((image) => {
          image.name_descr = image.name;
        });
        this.images = resp.value;
        this.executingTasks.forEach((executingTask) => {
          this.images.push({
            name_descr: '<i class="fa fa-spinner fa-spin fa-fw"></i> ' +
              executingTask.metadata.rbd_name +
              '<span class="italic">(creating...)</span>'
          });
        });
      },
      () => {
        this.viewCacheStatus = ViewCacheStatus.ValueException;
      }
    );
  }

  beforeShowDetails(selection: CdTableSelection) {
    return selection.hasSingleSelection;
  }
}
