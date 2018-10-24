import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { IscsiService } from '../../../shared/api/iscsi.service';
import { CdFormGroup } from '../../../shared/forms/cd-form-group';

@Component({
  selector: 'cd-iscsi-target-form',
  templateUrl: './iscsi-target-form.component.html',
  styleUrls: ['./iscsi-target-form.component.scss']
})
export class IscsiTargetFormComponent {
  targetForm: CdFormGroup;

  constructor(private iscsiService: IscsiService) {
    this.createForm();
  }

  createForm() {
    this.targetForm = new CdFormGroup({
      targetIqn: new FormControl('', {
        validators: [Validators.required]
      })
    });
  }

  submit() {
    const targetIqn = this.targetForm.getValue('targetIqn');
    this.iscsiService.createTarget(targetIqn).subscribe(
      (data: any) => {
        console.log(data);
      },
      () => {
        this.targetForm.setErrors({ cdSubmitButton: true });
      }
    );
  }
}
