import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nfsExport'
})
export class NfsExportPipe implements PipeTransform {
  transform(value: object): string {
    return `${value['path']}${value['pseudo']}`.split('//').join('/');
  }
}
