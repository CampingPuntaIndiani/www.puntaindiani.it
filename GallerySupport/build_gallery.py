__author__ = 'martin'

from PIL import Image
import htmllib
import hashlib
import io
import unipath
from unipath import FSPath as Path

"""
From tree:
- orig
    - Album | Author
        image
Build
- orig /
- dist
    - Album | Author
        - original
        - icon-h
        - icon-l
        - big
"""

NAME_ORIGINAL = 'original'
EXT_ORIGINAL = 'org.jpg'

NAME_ICON_BIG = 'icon_big'
EXT_ICON_BIG = '.icon_big.jpg'

NAME_ICON_SMALL = 'icon_small'
EXT_ICON_SMALL = '.icon_small.jpg'

NAME_BIG = 'big'
EXT_BIG = '.big.jpg'

SIZE_ICON_BIG = (170, 125)
SIZE_ICON_SMALL = (104, 77)
SIZE_BIG_W = 800
SIZE_BIG_H = 600

SOURCE = Path(__file__).ancestor(1).child('original')
DIST = Path(__file__).ancestor(1).child('gallery')

BASE_NAME = 'CampingPuntaIndiani_'

STATIC_URL = '../static/img/'


def himg(img):
    m = hashlib.md5()
    with io.BytesIO() as memf:
        img.save(memf, 'JPEG')
        data = memf.getvalue()
        m.update(data)
    return m.hexdigest()


def build(source, dist, html):
    print 'Starting.. source: {}'.format(source)
    DIST.mkdir()

    for album in source.listdir(filter=unipath.DIRS):
        print 'Processing album: {}'.format(album)

        m = hashlib.md5()
        m.update(album.name)
        album_hash = m.hexdigest()
        html.write('<header class="gallery-title">{}</header>'.format(album.name))
        html.write('<section class="gallery-album" data-dir="{}">'.format(album_hash))


        # build album tree
        album_dir = dist.child(album_hash)
        album_dir.mkdir()

        # build tree
        org = album_dir.child(NAME_ORIGINAL)
        org.mkdir()
        ico_big = album_dir.child(NAME_ICON_BIG)
        ico_big.mkdir()
        ico_small = album_dir.child(NAME_ICON_SMALL)
        ico_small.mkdir()
        big = album_dir.child(NAME_BIG)
        big.mkdir()

        # process photos
        for photo in album.listdir(filter=unipath.FILES):

            org_img = Image.open(photo)
            hname = himg(org_img)

            img = org_img.resize(SIZE_ICON_BIG, Image.ANTIALIAS)
            path_ico_big = ico_big.child(BASE_NAME+hname+EXT_ICON_BIG)
            img.save(path_ico_big, "JPEG", quality=90)

            img = org_img.resize(SIZE_ICON_SMALL, Image.ANTIALIAS)
            path_ico_small = ico_small.child(BASE_NAME+hname+EXT_ICON_SMALL)
            img.save(path_ico_small, "JPEG", quality=90)

            (ow, oh) = org_img.size
            if ow > oh:
                w = SIZE_BIG_W
                h = w*oh/ow
            else:
                h = SIZE_BIG_H
                w = h*ow/oh

            img = org_img.resize((w, h), Image.ANTIALIAS)
            path_big = big.child(BASE_NAME+hname+EXT_BIG)
            img.save(path_big, "JPEG", quality=90)

            path_org = org.child(BASE_NAME+hname+'.jpg')
            org_img.save(path_org, "JPEG", quality=90)

            html.write('<figure>')
            html.write('<a href="{}{}">'.format(STATIC_URL, path_big))
            html.write('<picture>')
            html.write('<source src="{}{}" media=(min-width:992px)>'.format(STATIC_URL, path_ico_big))
            html.write('<source src="{}{}" media=(max-width:991px)>'.format(STATIC_URL, path_ico_small))
            html.write('<img src="{}{}" alt="{}">'.format(STATIC_URL, path_ico_big, photo.name))
            html.write('</picture>')
            html.write('</a>')
            html.write('<figcaption>')
            html.write('<a href="{}{}">HD</a>'.format(STATIC_URL, path_org))
            html.write('</figcaption>')
            html.write('</figure>')
        html.write('</section>')

if __name__ == '__main__':
    with open('out.html', 'w+') as html:
        build(SOURCE, DIST, html)
