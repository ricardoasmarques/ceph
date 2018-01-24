# -*- coding: utf-8 -*-
"""
openATTIC mgr plugin (based on CherryPy)
"""
from __future__ import absolute_import


import os
import cherrypy
from cherrypy import tools
from mgr_module import MgrModule

from .controllers.auth import Auth
from .tools import load_controllers


# cherrypy likes to sys.exit on error.  don't let it take us down too!
def os_exit_noop(*args):
    pass


os._exit = os_exit_noop


class Module(MgrModule):
    """
    dashboard module entrypoint
    """

    COMMANDS = [
        {
            "cmd": "dashboard set-login-credentials "
                   "name=username,type=CephString "
                   "name=password,type=CephString",
            "desc": "Set the login credentials",
            "perm": "w"
        }
    ]

    def __init__(self, *args, **kwargs):
        super(Module, self).__init__(*args, **kwargs)

    def serve(self):
        server_addr = self.get_localized_config('server_addr', '::')
        server_port = self.get_localized_config('server_port', '8080')
        if server_addr is None:
            raise RuntimeError(
                'no server_addr configured; '
                'try "ceph config-key put mgr/{}/{}/server_addr <ip>"'
                .format(self.module_name, self.get_mgr_id()))
        self.log.info("server_addr: %s server_port: %s" % (server_addr,
                                                           server_port))

        cherrypy.config.update({
                                'server.socket_host': server_addr,
                                'server.socket_port': int(server_port),
                               })
        cherrypy.tools.autenticate = cherrypy.Tool('before_handler',
                                                   Auth.check_auth)

        cherrypy.tree.mount(Module.ApiRoot(self), "/api")
        cherrypy.engine.start()
        self.log.info("Waiting for engine...")
        cherrypy.engine.block()
        self.log.info("Engine done.")

    def shutdown(self):
        self.log.info("Stopping server...")
        cherrypy.engine.exit()
        self.log.info("Stopped server")

    def handle_command(self, cmd):
        if cmd['prefix'] == 'dashboard set-login-credentials':
            self.set_localized_config('username', cmd['username'])
            hashed_passwd = Auth.password_hash(cmd['password'])
            self.set_localized_config('password', hashed_passwd)
            return 0, 'Username and password updated', ''
        else:
            return (-errno.EINVAL, '', 'Command not found \'{0}\''.format(
                    cmd['prefix']))

    class ApiRoot(object):
        def __init__(self, mgrmod):
            ctrls = load_controllers(mgrmod)
            mgrmod.log.debug("loaded controllers: {}".format(ctrls))
            for ctrl in ctrls:
                mgrmod.log.warn("adding controller: {} -> {}"
                                .format(ctrl.__name__, ctrl._cp_path_))
                ins = ctrl()
                setattr(Module.ApiRoot, ctrl._cp_path_, ins)
