# -*- coding: utf-8 -*-
from __future__ import absolute_import

import time

import cherrypy

from . import ApiController, RESTController
from .. import logger
from ..exceptions import DashboardException
from ..services.auth import AuthManager
from ..services.access_control import ACCESS_CTRL_DB
from ..services.sso import SSO_DB
from ..tools import Session


@ApiController('/auth', secure=False)
class Auth(RESTController):
    """
    Provide login and logout actions.

    Supported config-keys:

      | KEY             | DEFAULT | DESCR                                     |
      ------------------------------------------------------------------------|
      | session-expire  | 1200    | Session will expire after <expires>       |
      |                           | seconds without activity                  |
    """

    def create(self, username, password, stay_signed_in=False):
        now = time.time()
        user_perms = AuthManager.authenticate(username, password)
        if user_perms is not None:
            cherrypy.session.regenerate()
            cherrypy.session[Session.USERNAME] = username
            cherrypy.session[Session.TS] = now
            cherrypy.session[Session.EXPIRE_AT_BROWSER_CLOSE] = not stay_signed_in
            logger.debug('Login successful')
            return {
                'username': username,
                'permissions': user_perms
            }

        logger.debug('Login failed')
        raise DashboardException(msg='Invalid credentials',
                                 code='invalid_credentials',
                                 component='auth')

    @RESTController.Collection('POST')
    def logout(self):
        logger.debug('Logout successful')
        cherrypy.session[Session.USERNAME] = None
        cherrypy.session[Session.TS] = None
        redirect_url = '#/login'
        if SSO_DB.protocol == 'saml2':
            redirect_url = 'auth/saml2/slo'
        return {
            'redirect_url': redirect_url
        }

    def _get_login_url(self):
        if SSO_DB.protocol == 'saml2':
            return 'auth/saml2/login'
        return '#/login'

    def list(self):
        if not cherrypy.session.get(Session.USERNAME):
            return {
                'login_url': self._get_login_url()
            }
        user = ACCESS_CTRL_DB.get_user(cherrypy.session.get(Session.USERNAME))
        return {
            'username': user.username,
            'permissions': user.permissions_dict(),
        }
