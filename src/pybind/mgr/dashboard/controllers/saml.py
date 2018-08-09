# -*- coding: utf-8 -*-
from __future__ import absolute_import

import time
import cherrypy

from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings

# from ..exceptions import UserDoesNotExist
# from ..services.access_control import ACCESS_CTRL_DB
from ..services.saml_service import get_saml2_onelogin_config
from ..settings import Settings
from ..tools import Session
from . import Controller, Endpoint, BaseController

@Controller('/auth/saml', secure=False)
class Saml2(BaseController):
    @Endpoint('POST', path="")
    def auth_response(self, **kwargs):
        req = {
            'https': 'on',
            'http_host': self._request.host,
            'script_name': self._request.path_info,
            'server_port': str(self._request.port),
            'get_data': {},
            'post_data': kwargs
        }
        config = get_saml2_onelogin_config()
        saml_settings = OneLogin_Saml2_Settings(config)
        auth = OneLogin_Saml2_Auth(req, saml_settings)
        auth.process_response()
        errors = auth.get_errors()

        if auth.is_authenticated():
            now = time.time()
            cherrypy.session.regenerate()
            # TODO check if attribute exists
            #from .. import logger
            #logger.warn('########### ' + str(auth.get_attributes()))
            username = auth.get_attribute(Settings.SSO_SAML2_IDP_USERNAME_ATTRIBUTE)[0]
            # TODO check if user exists
            #try:
            #    ACCESS_CTRL_DB.get_user(username)
            #except UserDoesNotExist:
            #    cherrypy.HTTPRedirect("/auth/saml/error/2")
            cherrypy.session[Session.USERNAME] = username
            cherrypy.session[Session.TS] = now
            cherrypy.session[Session.EXPIRE_AT_BROWSER_CLOSE] = False
            raise cherrypy.HTTPRedirect("/")
        else:
            return {
                'is_authenticated': auth.is_authenticated(),
                'errors': errors,
                'reason': auth.get_last_error_reason()
            }

    #@Endpoint(json_response=False)
    #def error(self, error_code):
    #    error_message = {
    #        '1': 'Cannot get username parameter',
    #        '2': 'Username does not exist',
    #    }[error_code]
    #    return '<html>' \
    #           '<h1>SSO authentication error</h1>' \
    #           '<p>{}</p>' \
    #           '</html>'.format(error_message)

    @Endpoint(xml=True)
    def metadata(self):
        config = get_saml2_onelogin_config()
        saml_settings = OneLogin_Saml2_Settings(config)
        return saml_settings.get_sp_metadata()

    @Endpoint(json_response=False)
    def login(self):
        req = {
            'https': 'on',
            'http_host': self._request.host,
            'script_name': self._request.path_info,
            'server_port': str(self._request.port),
            'get_data': {},
            'post_data': {}
        }
        config = get_saml2_onelogin_config()
        saml_settings = OneLogin_Saml2_Settings(config)
        auth = OneLogin_Saml2_Auth(req, saml_settings)
        raise cherrypy.HTTPRedirect(auth.login())
