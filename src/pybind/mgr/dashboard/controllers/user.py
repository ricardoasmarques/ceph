# -*- coding: utf-8 -*-
from __future__ import absolute_import

import cherrypy

from ..exceptions import DashboardException, UserAlreadyExists, \
    UserDoesNotExist
from ..services.access_control import ACCESS_CTRL_DB, SYSTEM_ROLES
from . import ApiController, RESTController
from ..security import Scope
from ..tools import Session


@ApiController('/user', Scope.USER)
class User(RESTController):
    @staticmethod
    def _user_to_dict(user):
        result = user.to_dict()
        del result['password']
        return result

    def list(self):
        users = ACCESS_CTRL_DB.users
        result = [User._user_to_dict(u) for _, u in users.items()]
        return result

    def get(self, username):
        try:
            user = ACCESS_CTRL_DB.get_user(username)
        except UserDoesNotExist:
            raise cherrypy.HTTPError(404)
        return User._user_to_dict(user)

    def create(self, username=None, password=None, name=None, email=None, roles=None):
        if not username:
            raise DashboardException(msg='Username is required',
                                     code='username_required',
                                     component='user')
        if not password:
            raise DashboardException(msg='Password is required',
                                     code='password_required',
                                     component='user')
        user_roles = None
        if roles:
            all_roles = dict(ACCESS_CTRL_DB.roles)
            all_roles.update(SYSTEM_ROLES)
            try:
                user_roles = [all_roles[rolename] for rolename in roles]
            except KeyError:
                raise DashboardException(msg='Role does not exist',
                                         code='role_does_not_exist',
                                         component='user')
        try:
            user = ACCESS_CTRL_DB.create_user(username, password, name, email)
        except UserAlreadyExists:
            raise DashboardException(msg='Username already exists',
                                     code='username_already_exists',
                                     component='user')
        if user_roles:
            user.set_roles(user_roles)
        ACCESS_CTRL_DB.save()
        return User._user_to_dict(user)

    def delete(self, username):
        session_username = cherrypy.session.get(Session.USERNAME)
        if session_username == username:
            raise DashboardException(msg='Cannot delete current user',
                                     code='cannot_delete_current_user',
                                     component='user')
        try:
            ACCESS_CTRL_DB.delete_user(username)
        except UserDoesNotExist:
            raise cherrypy.HTTPError(404)
        ACCESS_CTRL_DB.save()

    def set(self, username=None, password=None, name=None, email=None, roles=None):
        try:
            user = ACCESS_CTRL_DB.get_user(username)
        except UserDoesNotExist:
            raise cherrypy.HTTPError(404)
        user_roles = None
        if roles:
            all_roles = dict(ACCESS_CTRL_DB.roles)
            all_roles.update(SYSTEM_ROLES)
            try:
                user_roles = [all_roles[rolename] for rolename in roles]
            except KeyError:
                raise DashboardException(msg='Role does not exist',
                                         code='role_does_not_exist',
                                         component='user')
        if password:
            user.set_password(password)
        if name:
            user.name = name
        if email:
            user.email = email
        if user_roles:
            user.set_roles(user_roles)
        ACCESS_CTRL_DB.save()
        return User._user_to_dict(user)
