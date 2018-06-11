# -*- coding: utf-8 -*-
from __future__ import absolute_import

import errno
import json
import threading

from onelogin.saml2.settings import OneLogin_Saml2_Settings
from onelogin.saml2.errors import OneLogin_Saml2_Error
from onelogin.saml2.idp_metadata_parser import OneLogin_Saml2_IdPMetadataParser

from .. import mgr, logger
from ..tools import prepare_url_prefix


class Saml2(object):
    def __init__(self, onelogin_settings):
        self.onelogin_settings = onelogin_settings

    def get_username_attribute(self):
        return self.onelogin_settings['sp']['attributeConsumingService']['requestedAttributes'][0]['name']

    def to_dict(self):
        return {
            'onelogin_settings': self.onelogin_settings
        }

    @classmethod
    def from_dict(cls, s_dict):
        return Saml2(s_dict['onelogin_settings'])


class SsoDB(object):
    VERSION = 1
    SSODB_CONFIG_KEY = "ssodb_v"

    def __init__(self, version, auto_create_user, protocol, saml2):
        self.version = version
        self.auto_create_user = auto_create_user
        self.protocol = protocol
        self.saml2 = saml2
        self.lock = threading.RLock()

    def save(self):
        with self.lock:
            db = {
                'auto_create_user': self.auto_create_user,
                'protocol': self.protocol,
                'saml2': self.saml2.to_dict(),
                'version': self.version
            }
            mgr.set_store(self.ssodb_config_key(), json.dumps(db))

    @classmethod
    def ssodb_config_key(cls, version=None):
        if version is None:
            version = cls.VERSION
        return "{}{}".format(cls.SSODB_CONFIG_KEY, version)

    def check_and_update_db(self):
        logger.debug("SSO: Checking for previews DB versions")
        if self.VERSION != 1:
            raise NotImplementedError()

    @classmethod
    def load(cls):
        logger.info("SSO: Loading SSO DB version=%s", cls.VERSION)

        json_db = mgr.get_store(cls.ssodb_config_key(), None)
        if json_db is None:
            logger.debug("SSO: No DB v%s found, creating new...", cls.VERSION)
            db = cls(cls.VERSION, False, '', Saml2({}))
            # check if we can update from a previous version database
            db.check_and_update_db()
            return db

        db = json.loads(json_db)
        return cls(db['version'], db.get('auto_create_user'), db.get('protocol'), Saml2.from_dict(db.get('saml2')))


SSO_DB = None

def load_sso_db():
    global SSO_DB
    SSO_DB = SsoDB.load()

SSO_COMMANDS = [
    {
        'cmd': 'dashboard sso-enable',
        'desc': 'Enable SAML2 Single Sign-On',
        'perm': 'w'
    },
    {
        'cmd': 'dashboard sso-disable',
        'desc': 'Disable Single Sign-On',
        'perm': 'w'
    },
    {
        'cmd': 'dashboard sso-status',
        'desc': 'Get Single Sign-On status',
        'perm': 'r'
    },
    {
        'cmd': 'dashboard sso-auto-create-user-enable',
        'desc': 'Enable user automatic creation',
        'perm': 'w'
    },
    {
        'cmd': 'dashboard sso-auto-create-user-disable',
        'desc': 'Disable user automatic creation',
        'perm': 'w'
    },
    {
        'cmd': 'dashboard sso-auto-create-user-status',
        'desc': 'Get user automatic creation status',
        'perm': 'r'
    },
    {
        'cmd': 'dashboard sso-saml2-show',
        'desc': 'Show Single Sign-On configuration',
        'perm': 'r'
    },
    {
        'cmd': 'dashboard sso-saml2-setup '
               'name=ceph_dashboard_base_url,type=CephString '
               'name=idp_metadata_url,type=CephString '
               'name=idp_username_attribute,type=CephString,req=false '
               'name=idp_entity_id,type=CephString,req=false '
               'name=sp_x_509_cert,type=CephString,req=false '
               'name=sp_private_key,type=CephString,req=false',
        'desc': 'Setup SAML2 Single Sign-On',
        'perm': 'w'
    },
    {
        'cmd': 'dashboard sso-saml2-sp-metadata',
        'desc': 'Show Service Provider metadata',
        'perm': 'r'
    }
]

def handle_sso_command(cmd):
    if cmd['prefix'] == 'dashboard sso-enable':
        try:
            OneLogin_Saml2_Settings(SSO_DB.saml2.onelogin_settings)
        except OneLogin_Saml2_Error:
            return 0, '', 'Single Sign-On is not configured: ' \
                          'use `ceph dashboard sso-saml2-setup`'
        SSO_DB.protocol = 'saml2'
        SSO_DB.save()
        return 0, 'SSO is "enabled" with "SAML2" protocol.', ''

    if cmd['prefix'] == 'dashboard sso-disable':
        SSO_DB.protocol = ''
        SSO_DB.save()
        return 0, 'SSO is disabled.', ''

    if cmd['prefix'] == 'dashboard sso-status':
        if SSO_DB.protocol == 'saml2':
            return 0, 'SSO is "enabled" with "SAML2" protocol.', ''

        return 0, 'SSO is "disabled".', ''

    if cmd['prefix'] == 'dashboard sso-auto-create-user-enable':
        SSO_DB.auto_create_user = True
        SSO_DB.save()
        return 0, 'Automatic user creation is "enabled".', ''

    if cmd['prefix'] == 'dashboard sso-auto-create-user-disable':
        SSO_DB.auto_create_user = False
        SSO_DB.save()
        return 0, 'Automatic user creation is "disabled".', ''

    if cmd['prefix'] == 'dashboard sso-auto-create-user-status':
        if SSO_DB.auto_create_user:
            return 0, 'Automatic user creation is "enabled".', ''
        return 0, 'Automatic user creation is "disabled".', ''

    if cmd['prefix'] == 'dashboard sso-saml2-show':
        return 0, json.dumps(SSO_DB.saml2.to_dict()), ''

    if cmd['prefix'] == 'dashboard sso-saml2-setup':
        ceph_dashboard_base_url = cmd['ceph_dashboard_base_url']
        idp_metadata_url = cmd['idp_metadata_url']
        idp_username_attribute = cmd['idp_username_attribute'] if 'idp_username_attribute' in cmd else 'uid'
        idp_entity_id = cmd['idp_entity_id'] if 'idp_entity_id' in cmd else None
        sp_x_509_cert = cmd['sp_x_509_cert'] if 'sp_x_509_cert' in cmd else ""
        sp_private_key = cmd['sp_private_key'] if 'sp_private_key' in cmd else ""
        if sp_x_509_cert and not sp_private_key:
            return 0, '', 'Missing parameter `sp_private_key`.'
        if not sp_x_509_cert and sp_private_key:
            return 0, '', 'Missing parameter `sp_x_509_cert`.'
        sp_signature_enabled = sp_x_509_cert is not "" and sp_private_key is not ""
        try:
            file = open(sp_x_509_cert, 'r')
            sp_x_509_cert = file.read()
        except FileNotFoundError:
            pass
        try:
            file = open(sp_private_key, 'r')
            sp_private_key = file.read()
        except FileNotFoundError:
            pass
        idp_settings = OneLogin_Saml2_IdPMetadataParser.parse_remote(idp_metadata_url, validate_cert=False, entity_id=idp_entity_id)
        url_prefix = prepare_url_prefix(mgr.get_config('url_prefix', default=''))
        settings = {
            'sp': {
                'entityId': '{}{}/auth/saml/metadata'.format(ceph_dashboard_base_url, url_prefix),
                'assertionConsumerService': {
                    'url': '{}{}/auth/saml'.format(ceph_dashboard_base_url, url_prefix),
                    'binding': "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                },
                'attributeConsumingService': {
                    'serviceName': "Ceph Dashboard",
                    "serviceDescription": "Ceph Dashboard Service",
                    "requestedAttributes": [
                        {
                            "name": idp_username_attribute,
                            "isRequired": True
                        }
                    ]
                },
                'singleLogoutService': {
                    'url': '{}{}/auth/saml/logout'.format(ceph_dashboard_base_url, url_prefix),
                    'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'
                },
                "x509cert": sp_x_509_cert,
                "privateKey": sp_private_key
            },
            'security': {
                'wantAttributeStatement': False,
                "authnRequestsSigned": sp_signature_enabled,
                "logoutRequestSigned": sp_signature_enabled,
                "logoutResponseSigned": sp_signature_enabled,
                "wantMessagesSigned": sp_signature_enabled,
                "wantAssertionsSigned": sp_signature_enabled,
                'metadataValidUntil': ''
            }
        }
        settings = OneLogin_Saml2_IdPMetadataParser.merge_settings(settings, idp_settings)
        SSO_DB.saml2.onelogin_settings = settings
        SSO_DB.protocol = 'saml2'
        SSO_DB.save()
        return 0, json.dumps(SSO_DB.saml2.onelogin_settings), ''

    if cmd['prefix'] == 'dashboard sso-saml2-sp-metadata':
        settings = OneLogin_Saml2_Settings(SSO_DB.saml2.onelogin_settings)
        return 0, settings.get_sp_metadata(), ''

    return -errno.ENOSYS, '', ''
