# -*- coding: utf-8 -*-
from __future__ import absolute_import

from . import ApiController, RESTController, BaseController, Endpoint, ReadPermission
from ..rest_client import RequestException
from ..security import Scope
from ..services.iscsi_client import IscsiClient


@ApiController('/iscsi', Scope.ISCSI)
class Iscsi(BaseController):

    @Endpoint()
    @ReadPermission
    def status(self):
        status = {'available': False}
        try:
            IscsiClient.instance().get_config()
            status['available'] = True
        except RequestException:
            pass
        return status


@ApiController('/iscsi/target', Scope.ISCSI)
class IscsiTarget(RESTController):

    def list(self):
        config = IscsiClient.instance().get_config()
        targets = []
        for target_iqn, target_config in config['targets'].items():
            portals = []
            for host, portal_config in target_config['portals'].items():
                portal = {
                    'host': host,
                    'ip': portal_config['portal_ip_address']
                }
                portals.append(portal)
            disks = []
            for target_disk in target_config['disks']:
                disk_config = config['disks'][target_disk]
                disk = {
                    'pool': disk_config['pool'],
                    'image': disk_config['image'],
                    'controls': disk_config['controls'],
                }
                disks.append(disk)
            clients = []
            for client_iqn, client_config in target_config['clients'].items():
                luns = []
                for client_lun, lun_config in client_config['luns'].items():
                    pool, image = client_lun.split('.', 1)
                    lun = {
                        'pool': pool,
                        'image': image
                    }
                    luns.append(lun)
                user = None
                password = None
                if '/' in client_config['auth']['chap']:
                    user, password = client_config['auth']['chap'].split('/', 1)
                client = {
                    'client_iqn': client_iqn,
                    'luns': luns,
                    'auth': {
                        'user': user,
                        'password': password
                    }
                }
                clients.append(client)
            groups = []
            for group_id, group_config in target_config['groups'].items():
                group_disks = []
                for group_disk_key, _ in group_config['disks'].items():
                    pool, image = group_disk_key.split('.', 1)
                    group_disk = {
                        'pool': pool,
                        'image': image
                    }
                    group_disks.append(group_disk)
                group = {
                    'group_id': group_id,
                    'disks': group_disks,
                    'members': group_config['members'],
                }
                groups.append(group)
            target = {
                'target_iqn': target_iqn,
                'portals': portals,
                'disks': disks,
                'clients': clients,
                'groups': groups,
                'target_controls': target_config['controls'],
            }
            targets.append(target)
        return targets
