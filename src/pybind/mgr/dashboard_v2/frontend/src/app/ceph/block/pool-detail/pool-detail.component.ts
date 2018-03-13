import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { ToastsManager } from 'ng2-toastr';

import { TaskManager } from '../../../shared/enum/task-manager.enum';
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
  selection: CdTableSelection;

  constructor(
    private route: ActivatedRoute,
    private rbdService: RbdService,
    dimlessBinaryPipe: DimlessBinaryPipe,
    dimlessPipe: DimlessPipe,
    private toastr: ToastsManager,
    private summaryService: SummaryService) {
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
      // FIXME
      // this.executingTasks = data....
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
        const allImages = resp.value;
        // TODO - add images from "EXECUTING" tasks
        this.images = allImages;
      },
      () => {
        this.viewCacheStatus = ViewCacheStatus.ValueException;
      }
    );
  }

  beforeShowDetails() {
    return (selection: CdTableSelection) => {
      this.selection = selection;
      return selection.hasSingleSelection;
    };
  }

  deleteAction() {
    if (_.isUndefined(this.selection) || !this.selection.hasSelection) {
      this.toastr.warning('Please select one RBD image.');
      return;
    }
    if (!this.selection.hasSingleSelection) {
      this.toastr.warning('Please select only one RBD image.');
      return;
    }
    const selected = this.selection.selected[0];
    this.rbdService.delete(this.name, selected.name).then((resp) => {
      console.log(resp);
      // TODO
      if (TaskManager.DONE === resp) {
        // TODO
      } else if (TaskManager.EXECUTING === resp) {
        // TODO
        selected.name_descr = '<i class="fa fa-spinner fa-spin fa-fw"></i> ' +
          selected.name + ' <span class="italic">(deleting...)</span>';
        this.toastr.info(`Deleting RBD image <strong>${selected.name}</strong>`);
      }
    }).catch((error) => {
      this.toastr.error(error.detail,
        `Failted to delete RBD image <strong>${selected.name}</strong>`);
    });
  }
}
