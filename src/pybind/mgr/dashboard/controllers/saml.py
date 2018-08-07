# -*- coding: utf-8 -*-
from __future__ import absolute_import

import time

import cherrypy

from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings
from onelogin.saml2.utils import OneLogin_Saml2_Utils

from . import Controller, Endpoint, BaseController
from ..tools import Session


CONFIG = {
    "strict": True,
    "debug": True,
    "sp": {
        "entityId": "http://my-sp/sp2",
        "assertionConsumerService": {
            "url": "https://192.168.1.68:41301/auth/saml",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        },
        "singleLogoutService": {
            "url": "https://192.168.1.68:41301/auth/saml/logout",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        },
        # "attributeConsumingService": {
        #     "serviceName": "SP test",
        #     "serviceDescription": "Test Service",
        #     "requestedAttributes": [
        #         {
        #             "name": "uid",
        #             "isRequired": False,
        #             "nameFormat": "",
        #             "friendlyName": "",
        #             "attributeValue": []
        #         }
        #     ]
        # },
        # "NameIDFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
        # "x509cert": "",
        # "privateKey": ""
    },

    "idp": {
        "entityId": "https://my-sp/idp",
        "singleSignOnService": {
            "url": "https://localhost:9443/idp/profile/SAML2/Redirect/SSO",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        },
        "singleLogoutService": {
            "url": "https://localhost:9443/idp/profile/SAML2/Redirect/SLO",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        },

        'x509certMulti': {
            'signing': [
                'MIIDDzCCAfegAwIBAgIUJqp8pdrni6tp4YaeowSp/4clzq4wDQYJKoZIhvcNAQEL\
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTE4MDgwMzIxMzQzMFoXDTM4MDgw\
MzIxMzQzMFowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF\
AAOCAQ8AMIIBCgKCAQEAgkAWb5+9QDULNj6hXS7Jr04006uqw2QhpjI/XpxVf0Gl\
z1RvUl5hWLeITPbkbtiAfUAJoVFstj7X9bseqeRPe9R947FTs4vfORCH0YcVI50B\
IkuGWxpvXZIbeXGkVJ4kyY7KfyUhsr/1a1uml2VExD3joesHeCJ6UyS+NscC3slP\
7rI0WDfq/MtUurNimnXaG6uvYSVtn8JRMzsF+LkCu5gJAhgpW74botljIdzeSS0l\
JSBx+wjYCDTTD1Llj4/HADG+TSV5ldwtySdicKRgxncFHRzRx5s7cshDbcQdGECb\
BACpU9GIi0KFShjD95Iz+j8sh4qnpGpBZvB2xF1gnQIDAQABo1kwVzAdBgNVHQ4E\
FgQU94X7FlrmsnbqaGe70ZauPLE7+WswNgYDVR0RBC8wLYIJbG9jYWxob3N0hiBo\
dHRwczovL2xvY2FsaG9zdC9pZHAvc2hpYmJvbGV0aDANBgkqhkiG9w0BAQsFAAOC\
AQEAJV7uL2UkltwK9a0V9qDmorNZf/QWc0mHucuaxr8koxo4pwqu9RekDR6Kd/Le\
haxeELYx1MkfEztTjKr/7NATFjUX67JP76355B8fJ2qVUoVmwxEjetQIM+tXGtku\
ItchysbfQN7tuKJ+WVcnCWdwPN8RtjlMvKASI0tfKd2qYAzTnlnt3E29/ek0zwZ4\
OLqzQMKgY5yDnIbIOn7fe2eIJQpuYlRWY3xhn8Ty0S9v24wRFLNYUxS2kN0eYX8d\
7kqeP0kTqXmWqEQAQJHArc+nhHifmvAQotqvKrslvQXxttXPTq0Sl/5KZCU1TvK7\
firLnpTkK/o4g8y08zOyjROR5g=='
            ],
            'encryption': [
                'MIIDEDCCAfigAwIBAgIVAMEceQQG2w3MPzGt+j+PWCt/fgMcMA0GCSqGSIb3DQEB\
CwUAMBQxEjAQBgNVBAMMCWxvY2FsaG9zdDAeFw0xODA4MDMyMTM0MzBaFw0zODA4\
MDMyMTM0MzBaMBQxEjAQBgNVBAMMCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEB\
BQADggEPADCCAQoCggEBAIDTH6V8IPxFaueO+tvoKfyQnN4KCgk4Zxu0j8ImCTph\
WGIniBfPFzzF7p53xihju7P2GpDOvmIxskC+0Urr4kcVi4dFNEs5ywj6nns9gkEF\
ZKgJIFuVL0mEB5of6E7ooVjUrwplO+bRafNbo3HfoEb/rAQHOVBm9mPAV2ryxtH1\
sTOCFxDcA/kIil0cA6HHUz9rox94yQGBFesiV7fxSc+2WFyrdetBDzgoj++qLEIi\
3tZRb1n+o3jLGPUfw+9f1AHgp2aEIrSuA73VjWr2WklD/fstn56+dsfCFlRlvhAy\
998eRK+aAm1PwSivjfHs4CwxfPBWkQiS+/yL/Q+kI48CAwEAAaNZMFcwHQYDVR0O\
BBYEFKiOs3zAKMXvGZ7cRdBxCBzxBR5DMDYGA1UdEQQvMC2CCWxvY2FsaG9zdIYg\
aHR0cHM6Ly9sb2NhbGhvc3QvaWRwL3NoaWJib2xldGgwDQYJKoZIhvcNAQELBQAD\
ggEBADHW/yfxJBeVg1xnbJFwnTRC3ftYvYKKy/rf7J2rZsCx1UrDw8nEHojD7okc\
505z69XjHgS1dTEnvxjBLbYyYNB+XMw/jYDUAS1B+Ekt9DzsCes9kf0jniIB33J3\
I8gZLJ4aLHMTpgMklIKHahNY/1azLSOdKl1Od6c3KGVY81ex1ki5jcFwk270zJy5\
PZw1ohx6l3lffGSk8YHLzVM2YB3gpiJsJJ4OAwyv2kB4uwlDXCMwCugIvzcKHFAl\
xtM94/hsd3Oh3XwjA/yt8Z/xQFqeqhdkzhL147N3+B1a/Mq1IfXETDHTgNQeM8Ol\
Fs6pJs34knMjJeNkt/yrLvQkqUo='
            ]
        }
    },
    'security': {
        'wantAttributeStatement': False
    }
}


CONFIG_KEYCLOAK = {
    "strict": True,
    "debug": True,
    "sp": {
        "entityId": "http://my-sp/sp2",
        "assertionConsumerService": {
            "url": "https://192.168.1.102:41661/auth/saml",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        },
        "singleLogoutService": {
            "url": "https://192.168.1.102:41661/auth/saml/logout",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        },
        # "attributeConsumingService": {
        #     "serviceName": "SP test",
        #     "serviceDescription": "Test Service",
        #     "requestedAttributes": [
        #         {
        #             "name": "uid",
        #             "isRequired": False,
        #             "nameFormat": "",
        #             "friendlyName": "",
        #             "attributeValue": []
        #         }
        #     ]
        # },
        "NameIDFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
        "x509cert": "MIICwTCCAakCBgFj3vxsvzANBgkqhkiG9w0BAQsFADAkMSIwIAYDVQQDDBlodHRwOi8vY2VwaC1kYXNoYm9hcmQvc3AyMB4XDTE4MDYwODEwMzkzNFoXDTI4MDYwODEwNDExNFowJDEiMCAGA1UEAwwZaHR0cDovL2NlcGgtZGFzaGJvYXJkL3NwMjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOhMPcPLFhvasYIDfTghKosvZ86/JoJX4MjyHUyJzhXxIWAb9Bo+TSYJQJ6WkUWuX7Ac6CDCpuf6+hqyQ5RLIHekHuVWlxeF0CkbkjMUvrUJmKUcxR8D+EuT1kV8BKT1d53dhVGCB1mIXp4p2JrDp5eklTe9bz+MnQ5GYVxvUmWXeatuQIto0/5mSwqsDssFuZV7g1C5fDjmaTsKqgX9MWvX3dgjpOO9AHeeuMaE6ffWp6nsTLvOu1TEIx5OQKSIHEMGiV2JGleq8rERRgaqmn+d7RiZ12YWISNjkMzHDCeGGazeA5+Yw7w3+Hw6gIg4qnGp7YxHMWT2FGr1h8y15V0CAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAlfWp/hpGVCJnfGeJuDcBDISF++84lbtcerJykdT+xgZNwpv/o19WWD35w2aiwMLzwj2RtXQIGyB5Bv0/3XxNlYM33LavP1Wn9EU1iCTFOztf0LBF6Axwhxo3fXM8c+bmBgUoxJ1aSVKBnNi5ZnFLZCIpOFyxG9LSGbRYR1Eypm7PiyWQ57wAFV5Bneybh3MdCG52T0dCzyTShwi82zVUHirY8drxldavG443LT57TPKDyoIGKZ9F1ZGMKLhAvTRtRLxiZ85Dv0hu5b+mG3t19ndJp0RIH80elSqKppkUVCyqClYsCLlm/65bARCH9ev/0eUScAChUK68gan8HWC4ZA==",
        "privateKey": "MIIEpAIBAAKCAQEA6Ew9w8sWG9qxggN9OCEqiy9nzr8mglfgyPIdTInOFfEhYBv0Gj5NJglAnpaRRa5fsBzoIMKm5/r6GrJDlEsgd6Qe5VaXF4XQKRuSMxS+tQmYpRzFHwP4S5PWRXwEpPV3nd2FUYIHWYheninYmsOnl6SVN71vP4ydDkZhXG9SZZd5q25Ai2jT/mZLCqwOywW5lXuDULl8OOZpOwqqBf0xa9fd2COk470Ad564xoTp99anqexMu867VMQjHk5ApIgcQwaJXYkaV6rysRFGBqqaf53tGJnXZhYhI2OQzMcMJ4YZrN4Dn5jDvDf4fDqAiDiqcantjEcxZPYUavWHzLXlXQIDAQABAoIBAQCXlAhJll9a1Z02hShUU+/62ngWREzQiJ85ACN2KgW785gfqp3h8f1NcIQl94HbwijWNkaR+fIHNZG1kdTfExagewteAt6cjsiBymffxQ2b/CMKunc2AdUnG9SZio9NRI9FB6NSyFIbbgyvkAazFjBplw93S7kn8o0ZH3uwYUOW3b4DyaJKcCJb6XdPvFaUtWRJ1vJ2COIpNa011WPnNWYan1BXbvftqR1pUlgnOcd4eJfCTyG3jxCsJfhZ+3Q+9XkOLGsexs90MtiTR5k6Um1jGKZqLkB+xA+7ldAM+Xi1Yr+I7sQc8dGRYSAVjpiWWAbaOMTKlaYFpFkA/U//P/pRAoGBAP9cyR5NZ6rbSYMQyc63SqSJTiIln33QmPrnx2XBsFXWxdRijZNa2f+bWMrLOy2iMoKjNriqkrDfcwuIsWlBogn1IFKYUzcGLkrIRPdeIhXErTnlmRRIUdagPYTHOiLzJ78Eeh6CS5mUHTzvbghPZgbv0ELGriR6BQGwUCPVWB5HAoGBAOjgtsTg9lUmAsf4Csak0OP20pOv7jJO+B+AAEfzZ6swRqCP6ANtV+Lj46Yi1Y9+zYt4maJMeIBk2biwbsHSL8BXZZJXn/oAIXefbawOyDcEtCg0DXYN0NjxBlJPAXeK7zG2jVaRwpoIxIthOdz6fUQqz6POwRuBNWvepWJ0UD07AoGAbCJ2aAaPJ6LEdmPdkVO8oAAkvgEAkN6MaXNM1KI4caEJFO7G1Odb+QlniDiXTrOof/ltarWQeKWmqfOwbMoGPAE5NsCaPGq5n6E+0yFhfaZTVHkNYbFeNmyUoG1dCP++jPzwWYsDSH2YA/2/snUs1zMmFaDcjUW+aQCobwQg1HECgYEAonxAKiiI16p44EvKQQW4loaeMNvdCA8fguMNzyYfHEvHy7n8+X8uhinZqg6+Eaw5AGp6T8qpfXRgkUPRU70zAjI4tZ4cChRTRaLgo9+AhRrsFO0Uw10qbmPltEJZ1K4E7RvhjBiRvmYFtPZ2qB/CjXCNhk75YBaMTqJ/pK1hWwcCgYAqao7Ij7nwtXkiDRNWEj7qLzPg3qWCJ5TbJmoDDz6x/0zyyakyZpYgv6ykchZlO8UyYzof334Mx2GYaoWCKhGPS0MlJoOcIfTwRxVAKv4gQk8QUmUtJy9JzXG60zuMHDkTpZj/5frqgyUMXg/u61miNTaMxbVmYjbczbKg2rcFYw=="
    },

    "idp": {
        "entityId": "http://192.168.1.102:8080/auth/realms/master",
        "singleSignOnService": {
            "url": "http://192.168.1.102:8080/auth/realms/master/protocol/saml",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        },
        "x509cert": 'MIICmzCCAYMCBgFjzyVG8jANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMTgwNjA1MDg1MDE2WhcNMjgwNjA1MDg1MTU2WjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCipX2RUmy1ASLJ1aZeI4o6QlD8UWpOut3KyQxVnlev9ycDXKtqT29m1evo9dxHC4PxV2YDlNKQP0aqCQccXsKoMY8FvZzFuuVK/Cf7tn7G+R5Rz3PHyrRaZsyqY7v9bPfcHSbEhA4ImODhh8lv/+O7cgbybTpxp+91Hm1g2VJirITG2vkmkPKDFkdo8Ud1TaUtHCFFwl0FMAHcBcvoJQ59qgoTiEcP61b6ZtCNambQSCz2nOPs2js025p1lqV9Bl7GuHg8rjPxH7x7hxPTcP/A0Q0Rczjn5mvpS0+S9NxzJ2sRqno3dfGOmg3S3IoXEQv7gWUiXOPK75debbFBNw2/AgMBAAEwDQYJKoZIhvcNAQELBQADggEBAJsgHH9gRVa6nxhRI/XMqB9K2K0pwwiAWhpN+CHeVC1u9X8BCDy5kWfodTquEl53QofJGzyye82skKOSW7pzXm5cWuMXPiC9jDVxwrJFojcTCVu1M0ZFMgB58GR4nRjnrZYWyA0c6yVhGlXICIFnIToBnzla8v+ThQhAvjWQ0VX1vELjy11Pkm9Ou+Vnmjp8I01Kj67kyRZqB9sQx/0qZPqOPMZl1MB/mNDpHIImvojJyCf4501HHBIB++H8Wqwq7BYl3JEPP3kRoSLTN+5SAo43ukn4ua3YCpGonbt/EhYoqOjhnGEcIWaGFjfZWCDErH3RiVQ8ysdok8t4n6OOwNE='
    },
    'security': {
        'wantAttributeStatement': False,
        "authnRequestsSigned": False
    }
}


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
        saml_settings = OneLogin_Saml2_Settings(CONFIG)
        auth = OneLogin_Saml2_Auth(req, saml_settings)
        auth.process_response()
        errors = auth.get_errors()

        if auth.is_authenticated():
            now = time.time()
            cherrypy.session.regenerate()
            cherrypy.session[Session.USERNAME] = 'admin'
            cherrypy.session[Session.TS] = now
            cherrypy.session[Session.EXPIRE_AT_BROWSER_CLOSE] = False
            raise cherrypy.HTTPRedirect("/")
        else:
            return {
                'is_authenticated': auth.is_authenticated(),
                'errors': errors,
                'reason': auth.get_last_error_reason()
            }

    @Endpoint(xml=True)
    def metadata(self):
        saml_settings = OneLogin_Saml2_Settings(CONFIG)
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
        saml_settings = OneLogin_Saml2_Settings(CONFIG)
        auth = OneLogin_Saml2_Auth(req, saml_settings)
        raise cherrypy.HTTPRedirect(auth.login())
        # out = ""
        # for key, val in cherrypy.request.__dict__.items():
        #     out += "{}: {}<br>".format(key, val)
        # return "<html><body>{}</body></html>".format(out)
