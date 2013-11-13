import os
import subprocess
import atexit
import signal

from optparse import make_option
from django.conf import settings
from django.core.management.commands.runserver import Command as RunserverCommand


MESSAGES = {
    "NotFound": ">>> Could not find a config.rb at {path}",
    "StartingFor": ">>> Starting the compass watch command for path: {}",
    "StartingPid": ">>> Compass watch process on pid: {pid}",
    "Closing": ">>> Closing Compass watch process for pid: {pid}"
}


class Command(RunserverCommand):
    option_list = RunserverCommand.option_list + (
        make_option('--compass', dest='compass_project_path', default=None,
                    help='Specifies the project directory for a compass project'),
    )

    def run(self, *args, **options):
        """Runs the server and the compass watch process"""
        use_reloader = options.get('use_reloader')

        if settings.DEBUG and use_reloader and os.environ.get("RUN_MAIN") != "true":
            """RUN_MAIN Environment variable is set to None the first time the
            runserver command is start, on every reload after a code change if the
            option 'use_reloader' is set (by default it's) RUN_MAIN is set on 'true'.
            """

            project_path = options.get('compass_project_path')
            if not project_path:
                project_path = getattr(settings, 'COMPASS_PROJECT_PATH', None)
            config_path = os.path.join(project_path, 'config.rb')

            if project_path and not os.path.exists(config_path):
                self.stdout.write(MESSAGES.get("NotFound").format(path=project_path))
            else:
                self.start_compass_watch(project_path)

        super(Command, self).run(*args, **options)

    def start_compass_watch(self, path=None):
        self.compass_process = subprocess.Popen(
            ['compass watch %s' % path],
            shell=True,
            stdin=subprocess.PIPE,
            stdout=self.stdout,
            stderr=self.stderr,
        )

        def kill_compass_project(pid):
            self.stdout.write(self.style.NOTICE(MESSAGES.get("Closing").format(pid=self.compass_process.pid)) + "\n")
            os.kill(pid, signal.SIGTERM)

        atexit.register(kill_compass_project, self.compass_process.pid)
