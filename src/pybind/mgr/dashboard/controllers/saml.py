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
        "entityId": "http://ceph-dashboard/sp2",
        "assertionConsumerService": {
            "url": "https://192.168.1.102:41242/auth/saml",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        },
        "singleLogoutService": {
            "url": "https://192.168.1.102:41242/auth/saml/logout",
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
        "entityId": "https://ceph-dashboard/idp",
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
                'MIIDDzCCAfegAwIBAgIUc8CtaDGjNocJ7VDkj1u8MzIPaQ8wDQYJKoZIhvcNAQEL\
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTE4MDYwNDE0NDgxMloXDTM4MDYw\
NDE0NDgxMlowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF\
AAOCAQ8AMIIBCgKCAQEA25fdl+XkkIApYJ2lGTXinwbWMYly4zhct8UOAizNkb/D\
3Bg8gmnwR76sJHIXGJkpvFNePxq3l762puYXTHNsNpGdozLVZPqqNXKP0ewlWNcD\
eyU7PvmA1KmtvadP26XL2NmlbIF4mf8C5ZMdjsVa0tVOK9YovKTbGdGp50P4JAoY\
Xt1CndlrQWs2cArqUgzWQxTDZDJsZ04GmkvoVocttTVXDmHI29myCqvHArNvi8SK\
jf68BBtqf9POx781CLR9g+//S0q/25NBdYBL8xaPAi6Y70uezgSXuYBe/bBkc8wR\
f1MqLuyXTQnyrpRbzqkTUWsF1PDflDAoJiyfBqGC5QIDAQABo1kwVzAdBgNVHQ4E\
FgQUHUvSsiYvc+XhjEYUtJslDfj+rMMwNgYDVR0RBC8wLYIJbG9jYWxob3N0hiBo\
dHRwczovL2xvY2FsaG9zdC9pZHAvc2hpYmJvbGV0aDANBgkqhkiG9w0BAQsFAAOC\
AQEAXrO6rctr/iYu01KemIi7YcZY6mBpU3IEgIT6w3vHMekJZJJik4GjXbm3nUZJ\
tXMwToCdg9FmJAn+uXqbhA8EVegRlxeKCgt9YB56xCSFXfULOQyMzocxx89d8isp\
d9lvlw9EUfguqaXftnfFNx2NDP9i/vTP6LnMrU1+xU0LQD8BfrMOowl4i8imr3zD\
DO4v/8w1x9ZF5I3WmkiiYsMw3ZElRhg4O3qM0QIpUhI8o/Ki7yr4BUsnsFm/HZiW\
HZrvjXw7GP15vPQ1K04JXLGviMc7624HUFe8N/2WAEki9Svrlkh0occ5isulZY0y\
cz+syRHxoKuD/YKnY9uQ2+6wFg=='
            ],
            'encryption': [
                'MIIDDzCCAfegAwIBAgIUbMHY/+KNiA0NMDyPe5fdrZLvvYkwDQYJKoZIhvcNAQEL\
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTE4MDYwNDE0NDgxMloXDTM4MDYw\
NDE0NDgxMlowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF\
AAOCAQ8AMIIBCgKCAQEAhUfdphin+OwUB15/0T69snedMn5EGxWr6USwxztro6xP\
SCkRfXiv0RelMQIUqTGp1vSXHpfCudt2PKlcKY9rJtddfNKHxGZiLmwnpEEZkqAR\
hz/sWICuoVFm1wtPh2tkC8k5IG7efS+OAOyMPcyejUugxJnrBpIJjfcyZ0Vvh+rI\
6uUM8nbOK8oHpTiDm4wN08d8iNJhOGpXaO/v8AcMowexEeOBiR927jC/meTVV0BW\
u08HJEXoqtJt9in3pcZAgGR/lcqX5vFU6X5x6sK0k4ERY5g7dldc3pyE4H9fZAHA\
kRZa8/3TbcI1l7N6aSwAf8rYaeBL0RFzsuFNbVzU2wIDAQABo1kwVzAdBgNVHQ4E\
FgQURdzrSyandA9Xz9fesQ2wT3amPKYwNgYDVR0RBC8wLYIJbG9jYWxob3N0hiBo\
dHRwczovL2xvY2FsaG9zdC9pZHAvc2hpYmJvbGV0aDANBgkqhkiG9w0BAQsFAAOC\
AQEAeoogrdo8mN5PX8alDjuzkWE3CJoPjPH4VqN4SgiRyxr0d4mV+/2KVre18POl\
zLG3YMhWx2ISqbRaKqsTWOFQ0/TF9d+3/qDxuQTmwsQZ6If2orYHp9Xx/1WifwnW\
dkxM9L8zXpCrSnR4KPebMP9lptPzy72SmTutJufEeGKB7n+6oe6x1igyaRXjhdOM\
AXe6KkbOchjV2ZS/n7wF9wsu+LxKUSc6RmAdq4QMDYEHQ0/AmPFscyvY5oWDh4/6\
cMWolrXnIOTHCySk0LU4OIHb87PXUyQ07KSoqIbAgPZl/QpA6x0omvoXUEKf56kT\
KgNqTn7iJUgoXn02+LkWO7fShw=='
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
        "entityId": "http://ceph-dashboard/sp2",
        "assertionConsumerService": {
            "url": "https://192.168.1.102:41242/auth/saml",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        },
        "singleLogoutService": {
            "url": "https://192.168.1.102:41242/auth/saml/logout",
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
        saml_settings = OneLogin_Saml2_Settings(CONFIG_KEYCLOAK)
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
        saml_settings = OneLogin_Saml2_Settings(CONFIG_KEYCLOAK)
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
        saml_settings = OneLogin_Saml2_Settings(CONFIG_KEYCLOAK)
        auth = OneLogin_Saml2_Auth(req, saml_settings)
        raise cherrypy.HTTPRedirect(auth.login())
        # out = ""
        # for key, val in cherrypy.request.__dict__.items():
        #     out += "{}: {}<br>".format(key, val)
        # return "<html><body>{}</body></html>".format(out)
