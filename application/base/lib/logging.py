import logging


class NullHandler(logging.Handler):
    def emit(self, record):
        pass

null_handler = NullHandler()
