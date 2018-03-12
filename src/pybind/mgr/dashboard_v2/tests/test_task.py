# -*- coding: utf-8 -*-
from __future__ import absolute_import

import unittest
import threading
import time
from collections import defaultdict

from ..tools import NotificationQueue, TaskManager


class MyTask(object):
    def __init__(self, op_seconds, wait=False, fail=False, progress=50):
        self.op_seconds = op_seconds
        self.wait = wait
        self.fail = fail
        self.progress = progress
        self._event = threading.Event()

    def run(self, ns, timeout=None):
        task = TaskManager.run(
            ns, self.metadata(), self.task_op, 'dummy arg', dummy='arg')
        return task.wait(timeout)

    def task_op(self, *args, **kwargs):
        time.sleep(self.op_seconds)
        TaskManager.current_task().set_progress(self.progress)
        if self.fail:
            raise Exception("Task Unexpected Exception")
        if self.wait:
            self._event.wait()
        return {'args': list(args), 'kwargs': kwargs}

    def resume(self):
        self._event.set()

    def metadata(self):
        return {
            'op_seconds': self.op_seconds,
            'wait': self.wait,
            'fail': self.fail,
            'progress': self.progress
        }


class TaskTest(unittest.TestCase):

    TASK_FINISHED_MAP = defaultdict(threading.Event)

    @classmethod
    def _handle_task(cls, task):
        cls.TASK_FINISHED_MAP[task.namespace].set()

    @classmethod
    def wait_for_task(cls, namespace):
        cls.TASK_FINISHED_MAP[namespace].wait()

    @classmethod
    def setUpClass(cls):
        NotificationQueue.start_queue()
        TaskManager.init()
        NotificationQueue.register(cls._handle_task, 'cd_task_finished',
                                   priority=100)

    @classmethod
    def tearDownClass(cls):
        NotificationQueue.stop()

    def setUp(self):
        TaskManager.FINISHED_TASK_TTL = 60.0

    def assertTaskResult(self, result):
        self.assertEqual(result,
                         {'args': ['dummy arg'], 'kwargs': {'dummy': 'arg'}})

    def test_fast_task(self):
        task1 = MyTask(1)
        state, result = task1.run('test1/task1')
        self.assertEqual(state, TaskManager.VALUE_DONE)
        self.assertTaskResult(result)
        self.wait_for_task('test1/task1')
        _, fn_t = TaskManager.list('test1/*')
        self.assertEqual(len(fn_t), 1)
        self.assertIsNone(fn_t[0].exception)
        self.assertTaskResult(fn_t[0].ret_value)
        self.assertEqual(fn_t[0].progress, 100)

    def test_slow_task(self):
        task1 = MyTask(1)
        state, result = task1.run('test2/task1', 0.5)
        self.assertEqual(state, TaskManager.VALUE_EXECUTING)
        self.assertIsNone(result)
        self.wait_for_task('test2/task1')
        _, fn_t = TaskManager.list('test2/*')
        self.assertEqual(len(fn_t), 1)
        self.assertIsNone(fn_t[0].exception)
        self.assertTaskResult(fn_t[0].ret_value)
        self.assertEqual(fn_t[0].progress, 100)

    def test_fast_task_with_failure(self):
        task1 = MyTask(1, fail=True, progress=40)
        state, result = task1.run('test3/task1')
        self.assertEqual(state, TaskManager.VALUE_EXCEPTION)
        self.assertEqual(str(result), "Task Unexpected Exception")
        self.wait_for_task('test3/task1')
        _, fn_t = TaskManager.list('test3/*')
        self.assertEqual(len(fn_t), 1)
        self.assertIsNone(fn_t[0].ret_value)
        self.assertEqual(str(fn_t[0].exception), "Task Unexpected Exception")
        self.assertEqual(fn_t[0].progress, 40)

    def test_slow_task_with_failure(self):
        task1 = MyTask(1, fail=True, progress=70)
        state, result = task1.run('test4/task1', 0.5)
        self.assertEqual(state, TaskManager.VALUE_EXECUTING)
        self.assertIsNone(result)
        self.wait_for_task('test4/task1')
        _, fn_t = TaskManager.list('test4/*')
        self.assertEqual(len(fn_t), 1)
        self.assertIsNone(fn_t[0].ret_value)
        self.assertEqual(str(fn_t[0].exception), "Task Unexpected Exception")
        self.assertEqual(fn_t[0].progress, 70)

    def test_executing_tasks_list(self):
        task1 = MyTask(0, wait=True, progress=30)
        task2 = MyTask(0, wait=True, progress=60)
        state, result = task1.run('test5/task1', 0.5)
        self.assertEqual(state, TaskManager.VALUE_EXECUTING)
        self.assertIsNone(result)
        ex_t, _ = TaskManager.list()
        self.assertEqual(len(ex_t), 1)
        self.assertEqual(ex_t[0].namespace, 'test5/task1')
        self.assertEqual(ex_t[0].progress, 30)
        state, result = task2.run('test5/task2', 0.5)
        self.assertEqual(state, TaskManager.VALUE_EXECUTING)
        self.assertIsNone(result)
        ex_t, _ = TaskManager.list('test5/*')
        self.assertEqual(len(ex_t), 2)
        for task in ex_t:
            if task.namespace == 'test5/task1':
                self.assertEqual(task.progress, 30)
            elif task.namespace == 'test5/task2':
                self.assertEqual(task.progress, 60)
        task2.resume()
        self.wait_for_task('test5/task2')
        ex_t, _ = TaskManager.list()
        self.assertEqual(len(ex_t), 1)
        self.assertEqual(ex_t[0].namespace, 'test5/task1')
        task1.resume()
        self.wait_for_task('test5/task1')
        ex_t, _ = TaskManager.list()
        self.assertEqual(len(ex_t), 0)

    def test_task_idempotent(self):
        task1 = MyTask(0, wait=True)
        task1_clone = MyTask(0, wait=True)
        state, result = task1.run('test6/task1', 0.5)
        self.assertEqual(state, TaskManager.VALUE_EXECUTING)
        self.assertIsNone(result)
        ex_t, _ = TaskManager.list()
        self.assertEqual(len(ex_t), 1)
        self.assertEqual(ex_t[0].namespace, 'test6/task1')
        state, result = task1_clone.run('test6/task1', 0.5)
        self.assertEqual(state, TaskManager.VALUE_EXECUTING)
        self.assertIsNone(result)
        ex_t, _ = TaskManager.list()
        self.assertEqual(len(ex_t), 1)
        self.assertEqual(ex_t[0].namespace, 'test6/task1')
        task1.resume()
        self.wait_for_task('test6/task1')
        ex_t, fn_t = TaskManager.list('test6/*')
        self.assertEqual(len(ex_t), 0)
        self.assertEqual(len(fn_t), 1)

    def test_finished_cleanup(self):
        TaskManager.FINISHED_TASK_TTL = 0.5
        task1 = MyTask(0)
        state, result = task1.run('test7/task1')
        self.assertEqual(state, TaskManager.VALUE_DONE)
        self.assertTaskResult(result)
        self.wait_for_task('test7/task1')
        time.sleep(1)
        _, fn_t = TaskManager.list('test7/*')
        self.assertEqual(len(fn_t), 1)
        _, fn_t = TaskManager.list('test7/*')
        self.assertEqual(len(fn_t), 0)

    def test_task_serialization_format(self):
        task1 = MyTask(0, wait=True, progress=20)
        task2 = MyTask(1)
        task1.run('test8/task1', 0.5)
        task2.run('test8/task2', 0.5)
        self.wait_for_task('test8/task2')
        ex_t, fn_t = TaskManager.list_serialized('test8/*')
        self.assertEqual(len(ex_t), 1)
        self.assertEqual(len(fn_t), 1)
        # validate executing tasks attributes
        self.assertEqual(len(ex_t[0].keys()), 4)
        self.assertEqual(ex_t[0]['namespace'], 'test8/task1')
        self.assertEqual(ex_t[0]['metadata'], task1.metadata())
        self.assertIsNotNone(ex_t[0]['begin_time'])
        self.assertEqual(ex_t[0]['progress'], 20)
        # validate finished tasks attributes
        self.assertEqual(len(fn_t[0].keys()), 9)
        self.assertEqual(fn_t[0]['namespace'], 'test8/task2')
        self.assertEqual(fn_t[0]['metadata'], task2.metadata())
        self.assertIsNotNone(fn_t[0]['begin_time'])
        self.assertIsNotNone(fn_t[0]['end_time'])
        self.assertEqual(fn_t[0]['latency'], fn_t[0]['end_time'] - fn_t[0]['begin_time'])
        self.assertEqual(fn_t[0]['progress'], 100)
        self.assertTrue(fn_t[0]['success'])
        self.assertTaskResult(fn_t[0]['ret_value'])
        self.assertIsNone(fn_t[0]['exception'])
        task1.resume()
        self.wait_for_task('test8/task1')
