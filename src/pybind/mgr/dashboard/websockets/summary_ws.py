from ws4py.websocket import WebSocket

from .. import logger

class SummaryWebSocket(WebSocket):
    def received_message(self, message):
        logger.info('[WS] received_message - {}'.format(message))
        self.send(message.data, message.is_binary)
