import os


HERE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_DIR = os.path.abspath(os.path.dirname(HERE_DIR))
ROOT_DIR = os.path.abspath(os.path.dirname(PROJECT_DIR))


def location(path):
    return os.path.abspath(os.path.join(PROJECT_DIR, path))
