import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import * as _ from 'lodash';
import { ToastsManager } from 'ng2-toastr';

import { FormatterService } from '../../../shared/services/formatter.service';
import { RbdService } from '../../../shared/services/rbd.service';
import { SummaryService } from '../../../shared/services/summary.service';
import { RbdFormRequestModel } from './rbd-form-request.model';
import { RbdFormModel } from './rbd-form.model';

@Component({
  selector: 'cd-rbd-form',
  templateUrl: './rbd-form.component.html',
  styleUrls: ['./rbd-form.component.scss']
})
export class RbdFormComponent implements OnInit {

  rbdForm: FormGroup;
  featuresFormGroups: FormGroup;
  defaultFeaturesFormControl: FormControl;
  deepFlattenFormControl: FormControl;
  layeringFormControl: FormControl;
  stripingFormControl: FormControl;
  exclusiveLockFormControl: FormControl;
  objectMapFormControl: FormControl;
  journalingFormControl: FormControl;
  fastDiffFormControl: FormControl;

  model = new RbdFormModel();
  rbdPools: Array<string> = null;
  features: any;
  featuresList = [];

  constructor(private summaryService: SummaryService,
              private rbdService: RbdService,
              private formatter: FormatterService,
              private toastr: ToastsManager,
              private el: ElementRef) {
    this.createForm();
    this.features = {
      'deep-flatten': {
        desc: 'Deep flatten',
        requires: null,
        excludes: null,
      },
      'layering': {
        desc: 'Layering',
        requires: null,
        excludes: null,
      },
      'striping': {
        desc: 'Striping',
        helperHtml: `<div>
  <p>
  RBD images are striped over many objects, which are then stored by the
  Ceph distributed object store (RADOS).
  </p>
  <p>Striping features:</p>
  <ul>
    <li>Read and write requests distributed across many nodes</li>
    <li>Prevents single node bottleneck for large or busy RBDs</li>
  </ul>
</div>`,
        requires: null,
        excludes: null,
      },
      'exclusive-lock': {
        desc: 'Exclusive lock',
        requires: null,
        excludes: null,
      },
      'object-map': {
        desc: 'Object map (requires exclusive-lock)',
        requires: 'exclusive-lock',
        excludes: null,
      },
      'journaling': {
        desc: 'Journaling (requires exclusive-lock)',
        requires: 'exclusive-lock',
        excludes: null,
      },
      'fast-diff': {
        desc: 'Fast diff (requires object-map)',
        requires: 'object-map',
        excludes: null,
      }
    };
    for (const key of Object.keys(this.features)) {
      const listItem = this.features[key];
      listItem.key = key;
      this.featuresList.push(listItem);
    }
  }

  createForm() {
    this.defaultFeaturesFormControl = new FormControl(true);
    this.deepFlattenFormControl = new FormControl(false);
    this.layeringFormControl = new FormControl(false);
    this.stripingFormControl = new FormControl(false);
    this.exclusiveLockFormControl = new FormControl(false);
    this.objectMapFormControl = new FormControl({value: false, disabled: true});
    this.journalingFormControl = new FormControl({value: false, disabled: true});
    this.fastDiffFormControl = new FormControl({value: false, disabled: true});
    this.featuresFormGroups = new FormGroup({
      defaultFeatures: this.defaultFeaturesFormControl,
      'deep-flatten': this.deepFlattenFormControl,
      'layering': this.layeringFormControl,
      'striping': this.stripingFormControl,
      'exclusive-lock': this.exclusiveLockFormControl,
      'object-map': this.objectMapFormControl,
      'journaling': this.journalingFormControl,
      'fast-diff': this.fastDiffFormControl,
    }, this.validateFeatures);
    this.rbdForm = new FormGroup({
      name: new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern('^(?:([^/@]+)/)?([^/@]+)(?:@([^/@]+))?$')
        ]
        // TODO : async validation that checks if name already exists
      }),
      useDataPool: new FormControl(false),
      pool: new FormControl('', {
        validators: [
          Validators.required
        ]
      }),
      dataPool: new FormControl('', {
        validators: [
          Validators.required
        ]
      }),
      size: new FormControl('', {
        updateOn: 'blur'
      }),
      obj_size: new FormControl('', {
        validators: [
          Validators.required
        ],
        updateOn: 'blur'
      }),
      features: this.featuresFormGroups,
      stripingUnit: new FormControl('', {
        validators: [
          Validators.required
        ],
        updateOn: 'blur'
      }),
      stripingCount: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.min(2)
        ],
        updateOn: 'blur'
      })
    }, this.validateRbdForm(this.formatter));
  }

  ngOnInit() {
    this.summaryService.summaryData$.subscribe((data: any) => {
      this.rbdPools = data.rbd_pools;
    });
    this.defaultFeaturesFormControl.valueChanges.subscribe((value) => {
      this.watchDataFeatures(null, value);
    });
    this.deepFlattenFormControl.valueChanges.subscribe((value) => {
      this.watchDataFeatures('deep-flatten', value);
    });
    this.layeringFormControl.valueChanges.subscribe((value) => {
      this.watchDataFeatures('layering', value);
    });
    this.stripingFormControl.valueChanges.subscribe((value) => {
      this.watchDataFeatures('striping', value);
    });
    this.exclusiveLockFormControl.valueChanges.subscribe((value) => {
      this.watchDataFeatures('exclusive-lock', value);
    });
    this.objectMapFormControl.valueChanges.subscribe((value) => {
      this.watchDataFeatures('object-map', value);
    });
    this.journalingFormControl.valueChanges.subscribe((value) => {
      this.watchDataFeatures('journaling', value);
    });
    this.fastDiffFormControl.valueChanges.subscribe((value) => {
      this.watchDataFeatures('fast-diff', value);
    });
  }

  validateFeatures(formGroup: FormGroup) {
    if (!formGroup.value.defaultFeatures) {
      const noneSelected = Object.keys(formGroup.value).every((feature) => {
        if (feature !== 'defaultFeatures') {
          return !formGroup.value[feature];
        } else {
          return true;
        }
      });
      if (noneSelected) {
        return {'noFeatureSelected': true};
      }
    }
    return null;
  }

  validateRbdForm(formatter) {
    return (formGroup: FormGroup) => {
      const sizeControl = formGroup.get('size');
      const objectSizeControl = formGroup.get('obj_size');
      let sizeControlErrors = null;
      if (sizeControl === null) {
        sizeControlErrors = {'required': true};
      } else if (objectSizeControl.valid) {
        const sizeInBytes = formatter.parseFloat(sizeControl.value, 'b');
        const objectSizeInBytes = formatter.parseFloat(objectSizeControl.value, 'b');
        if (this.stripingFormControl.value) {
          const stripingCountFormControl = formGroup.get('stripingCount');
          if (stripingCountFormControl.valid) {
            if (stripingCountFormControl.value * objectSizeInBytes > sizeInBytes) {
              sizeControlErrors = {'invalidSizeObjectStriping': true};
            }
          }
        } else {
          if (objectSizeInBytes > sizeInBytes) {
            sizeControlErrors = {'invalidSizeObject': true};
          }
        }
      }
      sizeControl.setErrors(sizeControlErrors);
    };
  }

  deepBoxCheck(key, checked) {
    _.forIn(this.features, (details, feature) => {
      if (details.requires === key) {
        if (checked) {
          this.featuresFormGroups.get(feature).enable();
        } else {
          this.featuresFormGroups.get(feature).disable();
          this.featuresFormGroups.get(feature).setValue(checked);
          this.watchDataFeatures(feature, checked);
          this.deepBoxCheck(feature, checked);
        }
      }
      if (details.excludes === key) {
        if (checked) {
          this.featuresFormGroups.get(feature).disable();
        } else {
          this.featuresFormGroups.get(feature).enable();
        }
      }
    });
  }

  featureFormUpdate(key, checked) {
    if (checked) {
      const required = this.features[key].requires;
      const excluded = this.features[key].excludes;
      if (excluded && this.featuresFormGroups.get(excluded).value ||
        required && !this.featuresFormGroups.get(required).value) {
        this.featuresFormGroups.get(key).setValue(false);
        return;
      }
    }
    this.deepBoxCheck(key, checked);
  }

  watchDataFeatures(key, checked) {
    if (!this.defaultFeaturesFormControl.value && key) {
      this.featureFormUpdate(key, checked);
    }
  }

  modelToRequest() {
    const request = new RbdFormRequestModel();
    request.pool_name = this.model.pool;
    request.image_name = this.model.name;
    request.size = this.model.size;
    request.obj_size = this.model.obj_size;
    if (!this.model.defaultFeatures) {
      _.forIn(this.model.features, (value, key) => {
        if (value.checked) {
          request.features.push(key);
        }
      });
    }
    request.stripe_unit = this.model.striping.unit;
    request.stripe_count = this.model.striping.count;
    request.data_pool = this.model.dataPool;
    return request;
  }

  // TODO : should be moved to a centralized service / component (cd-submit-button?)
  focusInvalid() {
    const target = this.el.nativeElement.querySelector('input.ng-invalid, select.ng-invalid');
    if (target) {
      target.focus();
    }
  }

  submit() {
    if (this.rbdForm.invalid) {
      this.focusInvalid();
      return;
    }
    this.rbdService.create(this.modelToRequest()).then((resp) => {
      if (resp.success) {
        this.toastr.success('RBD image have been created successfully');
      } else {
        this.toastr.error('Failted to create RBD image', resp.message);
      }
    });
  }
}
