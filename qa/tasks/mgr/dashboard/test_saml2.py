# -*- coding: utf-8 -*-

from __future__ import absolute_import

from .helper import DashboardTestCase


class Saml2Test(DashboardTestCase):
    AUTO_AUTHENTICATE = False
    IDP_METADATA = '''<?xml version="1.0"?>
    <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                         entityID="https://testidp.ceph.com/simplesamlphp/saml2/idp/metadata.php"
                         ID="pfx8ca6fbd7-6062-d4a9-7995-0730aeb8114f">
      <ds:Signature>
        <ds:SignedInfo>
          <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
          <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
          <ds:Reference URI="#pfx8ca6fbd7-6062-d4a9-7995-0730aeb8114f">
            <ds:Transforms>
              <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
              <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            </ds:Transforms>
            <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
            <ds:DigestValue>v6V8fooEUeq/LO/59JCfJF69Tw3ohN52OGAY6X3jX8w=</ds:DigestValue>
          </ds:Reference>
        </ds:SignedInfo>
        <ds:SignatureValue>IDP_SIGNATURE_VALUE</ds:SignatureValue>
        <ds:KeyInfo>
          <ds:X509Data>
            <ds:X509Certificate>IDP_X509_CERTIFICATE</ds:X509Certificate>
          </ds:X509Data>
        </ds:KeyInfo>
      </ds:Signature>
      <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
          <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
            <ds:X509Data>
              <ds:X509Certificate>IDP_X509_CERTIFICATE</ds:X509Certificate>
            </ds:X509Data>
          </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:KeyDescriptor use="encryption">
          <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
            <ds:X509Data>
              <ds:X509Certificate>IDP_X509_CERTIFICATE</ds:X509Certificate>
            </ds:X509Data>
          </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                                Location="https://testidp.ceph.com/simplesamlphp/saml2/idp/SingleLogoutService.php"/>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</md:NameIDFormat>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                                Location="https://testidp.ceph.com/simplesamlphp/saml2/idp/SSOService.php"/>
      </md:IDPSSODescriptor>
    </md:EntityDescriptor>'''

    @classmethod
    def setUpClass(cls):
        super(Saml2Test, cls).setUpClass()
        cls._ceph_cmd(['dashboard', 'sso-saml2-setup', 'https://cephdashboard.local', cls.IDP_METADATA])

    def test_metadata(self):
        self._get('/auth/saml2/metadata')
        self.assertStatus(200)
