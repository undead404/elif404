from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import reverse

import jinja2
import webassets
import webassets.ext.jinja2


def environment(**options):
    assets_env = webassets.Environment('./static', '/static')
    env = jinja2.Environment(
        extensions=[webassets.ext.jinja2.AssetsExtension], **options)
    env.globals.update({
        'static': staticfiles_storage.url,
        'url': reverse,
    })
    env.assets_environment = assets_env
    return env
