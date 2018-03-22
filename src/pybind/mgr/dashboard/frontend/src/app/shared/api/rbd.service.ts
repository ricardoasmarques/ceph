import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class RbdService {

  constructor(private http: HttpClient) {
  }

  create(rbd) {
    return this.http.post('api/block/image', rbd,
      { observe: 'response' })
      .toPromise()
      .then((resp: any) => {
        return resp;
      });
  }

  delete(poolName, rbdName) {
    return this.http.delete(`api/block/image/${poolName}/${rbdName}`,
      { observe: 'response' })
      .toPromise()
      .then((resp: any) => {
        return resp;
      });
  }

  update(poolName, rbdName, rbd) {
    return this.http.put(`api/block/image/${poolName}/${rbdName}`, rbd,
      { observe: 'response' })
      .toPromise()
      .then((resp: any) => {
        return resp;
      });
  }

  get(poolName, rbdName) {
    return this.http.get(`api/block/image/${poolName}/${rbdName}`)
      .toPromise()
      .then((resp: any) => {
        return resp;
      });
  }

  list() {
    return this.http.get('api/block/image')
      .toPromise()
      .then((resp: any) => {
        return resp;
      });
  }

  createSnapshot(poolName, rbdName, snapshotName) {
    const request = {
      snapshot_name: snapshotName
    };
    return this.http.post(`api/block/image/${poolName}/${rbdName}/snap`, request,
      { observe: 'response' })
      .toPromise()
      .then((resp: any) => {
        return resp;
      });
  }

  renameSnapshot(poolName, rbdName, snapshotName, newSnapshotName) {
    const request = {
      new_snap_name: newSnapshotName
    };
    return this.http.put(
      `api/block/image/${poolName}/${rbdName}/snap/${snapshotName}`, request,
        { observe: 'response' })
        .toPromise()
        .then((resp: any) => {
          return resp;
        });
  }

  protectSnapshot(poolName, rbdName, snapshotName, isProtected) {
    const request = {
      is_protected: isProtected
    };
    return this.http.put(
      `api/block/image/${poolName}/${rbdName}/snap/${snapshotName}`, request,
      { observe: 'response' })
        .toPromise()
        .then((resp: any) => {
          return resp;
        });
  }

  deleteSnapshot(poolName, rbdName, snapshotName) {
    return this.http.delete(
      `api/block/image/${poolName}/${rbdName}/snap/${snapshotName}`,
      { observe: 'response' })
        .toPromise()
        .then((resp: any) => {
          return resp;
        });
  }
}
