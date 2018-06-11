# -*- coding: utf-8 -*-
from __future__ import absolute_import

import time
import cherrypy

from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings

from .. import mgr
from ..exceptions import UserDoesNotExist
from ..services.access_control import ACCESS_CTRL_DB
from ..services.sso import SSO_DB
from ..tools import Session, prepare_url_prefix
from . import Controller, Endpoint, BaseController


@Controller('/auth/saml', secure=False)
class Saml2(BaseController):
    @Endpoint('POST', path="")
    def auth_response(self, **kwargs):
        req = {
            'https': 'on' if self._request.scheme == 'https' else 'off',
            'http_host': self._request.host,
            'script_name': self._request.path_info,
            'server_port': str(self._request.port),
            'get_data': {},
            'post_data': kwargs
        }
        auth = OneLogin_Saml2_Auth(req, SSO_DB.saml2.onelogin_settings)
        auth.process_response()
        errors = auth.get_errors()

        if auth.is_authenticated():
            now = time.time()
            cherrypy.session.regenerate()
            username_attribute = auth.get_attribute(SSO_DB.saml2.get_username_attribute())
            if username_attribute is None:
                raise cherrypy.HTTPError(400,
                                         'SSO error - `{}` not found in auth attributes. '
                                         'Received attributes: {}'
                                         .format(
                                             SSO_DB.saml2.get_username_attribute(),
                                             auth.get_attributes()))
            username = username_attribute[0]
            try:
                ACCESS_CTRL_DB.get_user(username)
            except UserDoesNotExist:
                if not SSO_DB.auto_create_user:
                    raise cherrypy.HTTPError(400,
                                             'SSO error - Username `{}` does not exist.'
                                             .format(username))
                ACCESS_CTRL_DB.create_user(username, None, None, None)
                ACCESS_CTRL_DB.save()

            cherrypy.session[Session.USERNAME] = username
            cherrypy.session[Session.TS] = now
            cherrypy.session[Session.EXPIRE_AT_BROWSER_CLOSE] = False
            url_prefix = prepare_url_prefix(mgr.get_config('url_prefix', default=''))
            raise cherrypy.HTTPRedirect("{}/".format(url_prefix))
        else:
            return {
                'is_authenticated': auth.is_authenticated(),
                'errors': errors,
                'reason': auth.get_last_error_reason()
            }

    @Endpoint(xml=True)
    def metadata(self):
        saml_settings = OneLogin_Saml2_Settings(SSO_DB.saml2.onelogin_settings)
        return saml_settings.get_sp_metadata()

    @Endpoint(json_response=False)
    def login(self):
        req = {
            'https': 'on' if self._request.scheme == 'https' else 'off',
            'http_host': self._request.host,
            'script_name': self._request.path_info,
            'server_port': str(self._request.port),
            'get_data': {},
            'post_data': {}
        }
        auth = OneLogin_Saml2_Auth(req, SSO_DB.saml2.onelogin_settings)
        raise cherrypy.HTTPRedirect(auth.login())

    @Endpoint(json_response=False)
    def slo(self):
        req = {
            'https': 'on' if self._request.scheme == 'https' else 'off',
            'http_host': self._request.host,
            'script_name': self._request.path_info,
            'server_port': str(self._request.port),
            'get_data': {},
            'post_data': {}
        }
        auth = OneLogin_Saml2_Auth(req, SSO_DB.saml2.onelogin_settings)
        raise cherrypy.HTTPRedirect(auth.logout())

    @Endpoint(json_response=False)
    def logout(self, **kwargs):
        cherrypy.session[Session.USERNAME] = None
        cherrypy.session[Session.TS] = None
        url_prefix = prepare_url_prefix(mgr.get_config('url_prefix', default=''))
        raise cherrypy.HTTPRedirect("{}/".format(url_prefix))
