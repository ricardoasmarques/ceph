# -*- coding: utf-8 -*-
from __future__ import absolute_import

import json

from requests.auth import HTTPBasicAuth

from ..rest_client import RestClient


class IscsiClient(RestClient):
    _CLIENT_NAME = 'iscsi'
    _instance = None

    @classmethod
    def instance(cls):
        if not cls._instance:
            #FIXME
            host = '192.168.100.201' #Settings.CEPH_ISCSI_CLI_HOST
            port = '5001'
            ssl = False
            auth = HTTPBasicAuth('admin', 'admin')
            ssl_verify = False

            cls._instance = IscsiClient(host, port, IscsiClient._CLIENT_NAME, ssl, auth, ssl_verify)

        return cls._instance

    @RestClient.api_get('/api/config')
    def get_config(self, request=None):
        return request()

    @RestClient.api_put('/api/target/{target_iqn}')
    def create_target(self, target_iqn, target_controls, request=None):
        return request({
            'controls': json.dumps(target_controls)
        })

    @RestClient.api_put('/api/target/{target_iqn}')
    def reconfigure_target(self, target_iqn, target_controls, request=None):
        return request({
            'mode': 'reconfigure',
            'controls': json.dumps(target_controls)
        })

    @RestClient.api_put('/api/gateway/{target_iqn}/{gateway_name}')
    def create_gateway(self, target_iqn, gateway_name, ip_address, request=None):
        return request({
            'ip_address': ip_address,
            'skipchecks': 'true' # FIXME
        })

    @RestClient.api_put('/api/disk/{image_id}')
    def create_disk(self, image_id, request=None):
        return request({
            'mode': 'create'
        })

    @RestClient.api_put('/api/disk/{image_id}')
    def reconfigure_disk(self, image_id, controls, request=None):
        return request({
            'controls': json.dumps(controls),
            'mode': 'reconfigure'
        })

    @RestClient.api_put('/api/targetlun/{target_iqn}')
    def create_target_lun(self, target_iqn, image_id, request=None):
        return request({
            'disk': image_id
        })

    @RestClient.api_put('/api/client/{target_iqn}/{client_iqn}')
    def create_client(self, target_iqn, client_iqn, request=None):
        return request()

    @RestClient.api_put('/api/clientlun/{target_iqn}/{client_iqn}')
    def create_client_lun(self, target_iqn, client_iqn, image_id, request=None):
        return request({
            'disk': image_id
        })

    @RestClient.api_put('/api/clientauth/{target_iqn}/{client_iqn}')
    def create_client_auth(self, target_iqn, client_iqn, chap, request=None):
        return request({
            'chap': chap
        })
