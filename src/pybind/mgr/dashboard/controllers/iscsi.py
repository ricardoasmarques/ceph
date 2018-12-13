# -*- coding: utf-8 -*-
from __future__ import absolute_import

from . import ApiController, RESTController
from .. import logger
from ..security import Scope
from ..services.iscsi_client import IscsiClient
from ..rest_client import RequestException
from ..exceptions import DashboardException


# TODO  tasks / async calls
# TODO secure = True
@ApiController('/iscsi/target', Scope.ISCSI, secure=False)
class IscsiTarget(RESTController):

    def list(self):
        config = IscsiClient.instance().get_config()
        targets = []
        for target_iqn, target_config in config['targets'].items():
            # TODO add support for groups
            if len(target_config['groups'].keys()) > 0:
                raise DashboardException(msg='iSCSI target groups are not supported',
                                         code='groups_not_support',
                                         component='iscsi')
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
            target = {
                'target_iqn': target_iqn,
                'portals': portals,
                'disks': disks,
                'clients': clients,
                'target_controls': target_config['controls'],
            }
            targets.append(target)
        return targets

    def create(self, target_iqn=None, target_controls=None,
               portals=[], disks=[], clients=[]):
        # TODO rimarques - validations
        try:
            logger.debug('Creating target {}'.format(target_iqn))
            IscsiClient.instance().create_target(target_iqn, target_controls)
            for portal in portals:
                host = portal['host']
                ip = portal['ip']
                logger.debug('Creating portal {}:{}'.format(host, ip))
                IscsiClient.instance().create_gateway(target_iqn, host, ip)
            for disk in disks:
                pool = disk['pool']
                image = disk['image']
                image_id = '{}.{}'.format(pool, image)
                logger.debug('Creating disk {}'.format(image_id))
                IscsiClient.instance().create_disk(image_id)
                logger.debug('Creating target disk {}'.format(image_id))
                IscsiClient.instance().create_target_lun(target_iqn, image_id)
                controls = disk['controls']
                if controls:
                    IscsiClient.instance().reconfigure_disk(image_id, controls)
            for client in clients:
                client_iqn = client['client_iqn']
                logger.debug('Creating client {}'.format(client_iqn))
                IscsiClient.instance().create_client(target_iqn, client_iqn)
                for lun in client['luns']:
                    pool = lun['pool']
                    image = lun['image']
                    image_id = '{}.{}'.format(pool, image)
                    IscsiClient.instance().create_client_lun(target_iqn, client_iqn, image_id)
                user = client['auth']['user']
                password = client['auth']['password']
                chap = '{}/{}'.format(user, password) if user and password else ''
                IscsiClient.instance().create_client_auth(target_iqn, client_iqn, chap)
            if target_controls:
                IscsiClient.instance().reconfigure_target(target_iqn, target_controls)

        except RequestException as e:
            raise DashboardException(msg=e.message, component='iscsi')
