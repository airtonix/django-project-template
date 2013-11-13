from functools import wraps
import traceback
import sys

registry = {}

def autodiscover(submodule_name=None, variables=None, callback=None):
    """
    Auto-discover INSTALLED_APPS {submodule_name}.py modules and fail silently when
    not present.
    """

    import copy
    from django.conf import settings
    from django.utils.importlib import import_module
    from django.utils.module_loading import module_has_submodule
    registry = {}
    before_import_registry = None
    pointless_error_message = "No module named {}".format(submodule_name)

    for app in settings.INSTALLED_APPS:
        mod = import_module(app)
        # Attempt to import the app's submodule.
        try:
            before_import_registry = copy.copy(registry)
            path = '{app}.{submodule}'.format(
                app=app,
                submodule=submodule_name)
            module = import_module(path)

            if not variables == None:
                if isinstance(variables, str):
                    if "," in variables:
                        variables = variables.split(",")
                    else:
                        variables = (variables, )

                available_variables = ( getattr(module, variable, None) for variable in variables )
                callback(*available_variables)

        except Exception as error :
            if not pointless_error_message in error.message:
                print path
                print traceback.format_exc()
            # Reset the model registry to the state before the last import as
            # this import will have to reoccur on the next request and this
            # could raise NotRegistered and AlreadyRegistered exceptions
            # (see #8245).

            registry = before_import_registry

            # Decide whether to bubble up this error. If the app just
            # doesn't have an admin module, we can ignore the error
            # attempting to import it, otherwise we want it to bubble up.
            if module_has_submodule(mod, submodule_name):
                raise

