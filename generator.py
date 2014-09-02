# -*- coding: utf-8 -*-
__author__ = 'martin'

from jinja2 import Environment, FileSystemLoader
from unipath import FSPath as Path

TPL_PATH = Path(__file__).absolute().ancestor(1).child('templates')
TPL_SUFFIX = '.tpl.html'

DIST_PATH = Path(__file__).absolute().ancestor(1).child('dist')
DIST_SUFFIX = '.html'


# Langs to be rendered with
LANGS = ['eng', "ita", "ger", "ned"]

# pages that has to be generated
PAGES = ['home']


def generate():
    env = Environment(loader=FileSystemLoader(TPL_PATH),
                      extensions=['jinja2.ext.i18n'])

    """
    enable i18n extension,
    generate localized
    put in dist/
    """

    for page in PAGES:
        tpl = env.get_template(page + TPL_SUFFIX)

        context = {
            'lang': 'eng',
            #'title': _(page),
            'title': page,
            'page': page,

        }

        # render to dist
        print tpl.render(**context)


if __name__ == '__main__':
    generate()
