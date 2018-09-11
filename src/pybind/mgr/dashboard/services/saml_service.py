# -*- coding: utf-8 -*-
from ..settings import Settings

def get_saml2_onelogin_config():
    return {
        'strict': True,
        'debug': False,
        'sp': {
            'entityId': Settings.SSO_SAML2_SP_ENTITY_ID,
            'assertionConsumerService': {
                'url': '{}/auth/saml'.format(Settings.SSO_SAML2_SP_URL),
                'binding': "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            },
            'singleLogoutService': {
                'url': '{}/auth/saml/logout'.format(Settings.SSO_SAML2_SP_URL),
                'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'
            },
        },
        'idp': {
            'entityId': Settings.SSO_SAML2_IDP_ENTITY_ID,
            'singleSignOnService': {
                'url': Settings.SSO_SAML2_IDP_SSO_URL,
                'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'
            },
            'singleLogoutService': {
                'url': Settings.SSO_SAML2_IDP_SLO_URL,
                'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'
            },
            'x509certMulti': {
                'signing': [
                    Settings.SSO_SAML2_IDP_SIGNING_CERT
                ],
                'encryption': [
                    Settings.SSO_SAML2_IDP_ENCRYPTION_CERT
                ]
            }
        },
        'security': {
            'wantAttributeStatement': False,
            'metadataValidUntil': '9999-12-31T23:59:59Z'
        }
    }
