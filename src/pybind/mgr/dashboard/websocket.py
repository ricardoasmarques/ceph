import json

from ws4py.websocket import WebSocket

from . import logger


class WebSocketBroker:
    _handlers = {}

    @classmethod
    def add_handler(cls, handler):
        logger.info('[WS] add_handler {}'.format(handler))
        cls._handlers[handler] = []

    @classmethod
    def remove_handler(cls, handler):
        logger.info('[WS] remove_handler {}'.format(handler))
        cls._handlers.pop(handler)

    @classmethod
    def subscribe(cls, handler, topic):
        logger.info('[WS] subscribe topic={} payload={}'.format(topic, handler))
        cls._handlers[handler].append(topic)

    @classmethod
    def send(cls, topic, payload):
        logger.info('[WS] send - topic={} payload={}'.format(topic, payload))
        for handler, topics in cls._handlers.items():
            if topic in topics:
                logger.info('[WS] sending - topic={} handler={}'.format(topic, handler))
                handler.send(json.dumps(payload))


class WebSocketHandler(WebSocket):
    def opened(self):
        logger.info('[WS] opened - handler={}'.format(self))
        WebSocketBroker.add_handler(self)

    def received_message(self, message):
        logger.info('[WS] received_message - {}'.format(message))
        topic = message.data.decode('utf-8')
        WebSocketBroker.subscribe(self, topic)

    def closed(self, code, reason=None):
        logger.info('[WS] closed - handler={} code={} reason={}'.format(self, code, reason))
        WebSocketBroker.remove_handler(self)
