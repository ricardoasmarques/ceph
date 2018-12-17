# -*- coding: utf-8 -*-
from __future__ import absolute_import

from requests.auth import HTTPBasicAuth

from ..rest_client import RestClient
from ..settings import Settings


class IscsiClient(RestClient):
    _CLIENT_NAME = 'iscsi'
    _instance = None

    _host = None
    _port = None
    _scheme = None
    _ssl_verify = None
    _username = None
    _password = None

    @classmethod
    def instance(cls):
        if not cls._instance \
                or cls._host != Settings.CEPH_ISCSI_API_HOST \
                or cls._port != Settings.CEPH_ISCSI_API_PORT \
                or cls._scheme != Settings.CEPH_ISCSI_API_SCHEME \
                or cls._ssl_verify != Settings.CEPH_ISCSI_API_SSL_VERIFY \
                or cls._username != Settings.CEPH_ISCSI_API_USERNAME \
                or cls._password != Settings.CEPH_ISCSI_API_PASSWORD:

            cls._host = Settings.CEPH_ISCSI_API_HOST
            cls._port = Settings.CEPH_ISCSI_API_PORT
            cls._scheme = Settings.CEPH_ISCSI_API_SCHEME
            cls._ssl_verify = Settings.CEPH_ISCSI_API_SSL_VERIFY
            cls._username = Settings.CEPH_ISCSI_API_USERNAME
            cls._password = Settings.CEPH_ISCSI_API_PASSWORD

            ssl = cls._scheme == 'https'
            auth = HTTPBasicAuth(cls._username, cls._password)

            cls._instance = IscsiClient(cls._host, cls._port, IscsiClient._CLIENT_NAME, ssl,
                                        auth, cls._ssl_verify)

        return cls._instance

    @RestClient.api_get('/api/config')
    def get_config(self, request=None):
        return request()
