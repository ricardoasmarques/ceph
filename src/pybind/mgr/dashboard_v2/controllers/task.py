# -*- coding: utf-8 -*-
from __future__ import absolute_import

from ..tools import ApiController, AuthRequired, RESTController, TaskManager


@ApiController('task')
@AuthRequired()
class TaskController(RESTController):
    def list(self, namespace=None):
        executing_t, finished_t = TaskManager.list_serialized(namespace)
        return {
            'executing_tasks': executing_t,
            'finished_tasks': finished_t
        }
