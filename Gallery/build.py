__author__ = 'martin'

from PIL import Image
import htmllib
import hashlib
import io
import unipath
from unipath import FSPath as Path
import threading
import StringIO

"""
From tree:
- orig
    - Album | Author
        image
Build
- orig /
- DIST
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
OUT = Path(__file__).ancestor(1).child('out.html')

BASE_NAME = 'CampingPuntaIndiani_'

STATIC_URL = '../static/img/'


class AlbumBuilder(threading.Thread):
    def __init__(self, album):
        super(AlbumBuilder, self).__init__()
        self.album = album
        self.output = StringIO.StringIO()

    def run(self):
        m = hashlib.md5()
        m.update(self.album.name)
        album_hash = m.hexdigest()
        self.output.write('<header class="gallery-title">{}</header>'.format(self.album.name))
        self.output.write('<section class="gallery-album" data-dir="{}">'.format(album_hash))


        # build album tree
        album_dir = DIST.child(album_hash)
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
        for photo in self.album.listdir(filter=unipath.FILES):
            if photo.name.startswith('.'):
                continue

            try:
                org_img = Image.open(photo)
            except Exception:
                print('skipping {}'.format(photo))
                continue

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

            self.output.write('<figure>')
            self.output.write('<a href="{}{}">'.format(STATIC_URL, path_big))
            self.output.write('<picture>')
            self.output.write('<source src="{}{}" media=(min-width:992px)>'.format(STATIC_URL, path_ico_big))
            self.output.write('<source src="{}{}" media=(max-width:991px)>'.format(STATIC_URL, path_ico_small))
            self.output.write('<img src="{}{}" alt="{}">'.format(STATIC_URL, path_ico_big, photo.name))
            self.output.write('</picture>')
            self.output.write('</a>')
            self.output.write('<figcaption>')
            self.output.write('<a href="{}{}" target="_blank">HD</a>'.format(STATIC_URL, path_org))
            self.output.write('</figcaption>')
            self.output.write('</figure>')
        self.output.write('</section>\n')



def himg(img):
    m = hashlib.md5()
    with io.BytesIO() as memf:
        img.save(memf, 'JPEG')
        data = memf.getvalue()
        m.update(data)
    return m.hexdigest()


def chunks(l, n):
    """ Yield successive n-sized chunks from l.
    """
    for i in xrange(0, len(l), n):
        yield l[i:i+n]

def build(source, html):
    print 'Starting.. source: {}'.format(source)
    DIST.mkdir()

    albums = []
    for album in source.listdir(filter=unipath.DIRS):
        A = AlbumBuilder(album)
        albums.append(A)

    for c in chunks(albums, 4):
        for a in c:
            print 'Start album: {}'.format(a.album)
            a.start()
        for a in c:
            print 'Join album: {}'.format(a.album)
            a.join()

    for album in albums:
        html.write(album.output.getvalue())
        
if __name__ == '__main__':
    with open(OUT, 'w+') as html:
        build(SOURCE, html)
