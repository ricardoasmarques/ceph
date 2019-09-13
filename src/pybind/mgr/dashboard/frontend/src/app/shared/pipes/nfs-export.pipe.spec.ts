import { NfsExportPipe } from './nfs-export.pipe';

describe('NfsExportPipe', () => {
  const pipe = new NfsExportPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms "/ /ps1"', () => {
    expect(pipe.transform({ path: '/', pseudo: '/ps1' })).toEqual('/ps1');
  });

  it('transforms "/p1 /ps2"', () => {
    expect(pipe.transform({ path: '/p1', pseudo: '/ps2' })).toEqual('/p1/ps2');
  });

  it('transforms "b1 /ps1"', () => {
    expect(pipe.transform({ path: 'b1', pseudo: '/ps1' })).toEqual('b1/ps1');
  });
});
