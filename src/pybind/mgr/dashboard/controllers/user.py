# -*- coding: utf-8 -*-
from __future__ import absolute_import

#from ..services.access_control import ACCESS_CTRL_DB
from . import ApiController, RESTController
# from ..security import Scope


#@ApiController('/user', Scope.USER)
class Host(RESTController):
    def list(self):
 #       users = ACCESS_CTRL_DB.users
        # TODO password should not be returned
  #      return [u.to_dict() for _, u in users.items()]
        return []
