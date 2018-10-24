# -*- coding: utf-8 -*-
from __future__ import absolute_import

from . import ApiController, RESTController
from ..security import Scope
from ..services.iscsi_client import IscsiClient
from ..rest_client import RequestException
from ..exceptions import DashboardException

@ApiController('/iscsi/config', Scope.ISCSI)
class IscsiConfig(RESTController):

    def list(self):
        return IscsiClient.instance().get_config()


# TODO - tasks / async calls
@ApiController('/iscsi/target', Scope.ISCSI)
class IscsiTarget(RESTController):

    def create(self, target_iqn=None):
        return IscsiClient.instance().create_target(target_iqn)


# TODO - tasks / async calls
@ApiController('/iscsi/gateway', Scope.ISCSI)
class IscsiGateway(RESTController):

    def create(self, gateway_name=None, ip_address=None):
        try:
            return IscsiClient.instance().create_gateway(gateway_name, ip_address)
        except RequestException as e:
            raise DashboardException(msg=e.message, component='iscsi')
