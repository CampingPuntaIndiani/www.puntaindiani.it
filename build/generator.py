# -*- coding: utf-8 -*-
__author__ = 'martin'

import gettext
import datetime
from os import listdir
from os.path import isfile, join
from gettext import gettext as _
from jinja2 import Environment, FileSystemLoader
from unipath import FSPath as Path

# CONFIG
BASE = Path(__file__).absolute().ancestor(2)
I18N_PATH = BASE.child('i18n')
TPL_PATH = BASE.child('pages')
DIST_PATH = BASE.child('dist')

TPL_SUFFIX = '.tpl.html'
DIST_SUFFIX = '.html'


# Langs to be rendered with
LANGS = ['it', 'en', 'nl', 'de']

# pages that has to be generated
PAGES = [f[:-len(TPL_SUFFIX)] for f in listdir(TPL_PATH) if isfile(join(TPL_PATH, f)) and f[-len(TPL_SUFFIX):] == TPL_SUFFIX]
print(PAGES)

def generate():
    env = Environment(loader=FileSystemLoader(TPL_PATH), extensions=['jinja2.ext.i18n'])

    for lang in LANGS:
        print "Building {}".format(lang)
        trans = gettext.translation('website',  localedir=I18N_PATH, languages=[lang])
        env.install_gettext_translations(trans)

        output_path = DIST_PATH.child(lang)
        output_path.rmtree()
        output_path.mkdir(True)

        for page in PAGES:
            tpl = env.get_template(page + TPL_SUFFIX)

            context = {
                'now': datetime.datetime.utcnow().isoformat(),
                'lang': lang,
                'filename': page,
            }

            with open(output_path.child(page + DIST_SUFFIX), 'w+') as out:
                out.write(tpl.render(**context).encode('ascii', 'xmlcharrefreplace'))
        env.uninstall_gettext_translations(trans)


if __name__ == '__main__':
    generate()
