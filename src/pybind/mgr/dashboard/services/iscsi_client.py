# -*- coding: utf-8 -*-
from __future__ import absolute_import

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
    def create_target(self, target_iqn, request=None):
        return request()

    @RestClient.api_put('/api/gateway/{gateway_name}')
    def create_gateway(self, gateway_name, ip_address, request=None):
        return request({
            'ip_address': ip_address,
            'skipchecks': 'true' # FIXME
        })
