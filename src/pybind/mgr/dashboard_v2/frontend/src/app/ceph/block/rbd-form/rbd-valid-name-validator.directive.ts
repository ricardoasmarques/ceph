import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[cdRbdValidNameValidator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: CdRbdValidNameValidatorDirective,
      multi: true
    }
  ]
})
export class CdRbdValidNameValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    // https://github.com/ceph/ceph/blob/master/src/tools/rbd/Utils.cc#L92
    if (control.value && !control.value.match('^(?:([^/@]+)/)?([^/@]+)(?:@([^/@]+))?$')) {
      return {'cdRbdValidName': true};
    }
    return null;
  }
}
