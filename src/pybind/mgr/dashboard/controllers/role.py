# -*- coding: utf-8 -*-
from __future__ import absolute_import

from ..services.access_control import ACCESS_CTRL_DB, SYSTEM_ROLES
from . import ApiController, RESTController
from ..security import Scope


@ApiController('/role', Scope.USER)
class Role(RESTController):
    def list(self):
        all_roles = dict(ACCESS_CTRL_DB.roles)
        all_roles.update(SYSTEM_ROLES)
        return [r.to_dict() for _, r in all_roles.items()]
