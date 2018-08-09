import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { forkJoin } from 'rxjs';

import { SettingsService } from '../../../shared/api/settings.service';
import { NotificationType } from '../../../shared/enum/notification-type.enum';
import { CdFormGroup } from '../../../shared/forms/cd-form-group';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'cd-sso-form',
  templateUrl: './sso-form.component.html',
  styleUrls: ['./sso-form.component.scss']
})
export class SsoFormComponent implements OnInit {
  ssoForm: CdFormGroup;

  constructor(
    private settingsService: SettingsService,
    private notificationService: NotificationService
  ) {
    this.createForm();
  }

  createForm() {
    this.ssoForm = new CdFormGroup({
      SSO_PROTOCOL: new FormControl(null),
      SSO_SAML2_SP_ENTITY_ID: new FormControl('', {
        validators: [Validators.required]
      }),
      SSO_SAML2_SP_URL: new FormControl('', {
        validators: [Validators.required]
      }),
      SSO_SAML2_IDP_ENTITY_ID: new FormControl('', {
        validators: [Validators.required]
      }),
      SSO_SAML2_IDP_SSO_URL: new FormControl('', {
        validators: [Validators.required]
      }),
      SSO_SAML2_IDP_SLO_URL: new FormControl('', {
        validators: [Validators.required]
      }),
      SSO_SAML2_IDP_SIGNING_CERT: new FormControl('', {
        validators: [Validators.required]
      }),
      SSO_SAML2_IDP_ENCRYPTION_CERT: new FormControl('', {
        validators: [Validators.required]
      }),
      SSO_SAML2_IDP_USERNAME_ATTRIBUTE: new FormControl('', {
        validators: [Validators.required]
      })
    });
  }

  ngOnInit() {
    const keys = Object.keys(this.ssoForm.controls);
    forkJoin(
      keys.map((key) => {
        return this.settingsService.get(key);
      })
    ).subscribe((data: [Array<object>]) => {
      keys.forEach((key, index) => {
        this.ssoForm.get(data[index]['name']).setValue(data[index]['value']);
      });
    });
  }

  submit() {
    this.settingsService.bulkSet(this.ssoForm.value).subscribe(() => {
      this.notificationService.show(NotificationType.success, 'Saved settings');
      this.ssoForm.setErrors({ cdSubmitButton: true });
    });
  }
}
