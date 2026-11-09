"""Render the dated world edition and its public listings from reviewed records."""
from pathlib import Path
from datetime import date
import html
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'news/world/edition.json').read_text())
STORIES = DATA['stories']
E = html.escape
VERSION = '20261109-photos'


def display_date(value):
    return date.fromisoformat(value).strftime('%b %-d, %Y')


def external(url, text):
    return f'<a href="{E(url)}" target="_blank" rel="noopener noreferrer">{E(text)} ↗</a>'


def photo(story, compact=False):
    image = story['photo']
    css = 'world-photo world-photo-compact' if compact else 'world-photo'
    if image.get('preserveWhole'): css += ' world-photo-preserve'
    return f'''<figure class="{css}"><div class="world-photo-frame"><img src="{E(image['path'])}" alt="{E(image['alt'])}" width="{image['width']}" height="{image['height']}" loading="lazy" decoding="async"><span class="world-photo-label">{E(image['label'])}</span></div><figcaption>{E(image['caption'])} <span class="photo-credit">{external(image['sourceUrl'], image['credit'])} · {external(image['licenseUrl'], image['license'])}</span></figcaption></figure>'''


def brief(story, index):
    reports = ''.join(f'''<div class="world-report-link">{external(r['url'], r['label'])}<br><span>{E(r['title'])} · <time datetime="{r['date']}">{display_date(r['date'])}</time></span></div>''' for r in story['reporting'])
    return f'''<article class="world-brief" id="{story['id']}">{photo(story)}<div class="world-brief-body"><div class="world-category"><span>{E(story['place'])} / {E(story['topic'])}</span><span>0{index+1}</span></div><h2>{E(story['title'])}</h2><div class="world-stat"><strong>{E(story['metric'])}</strong><span>{E(story['metricLabel'])}</span></div><p>{E(story['summary'])}</p><p class="world-context"><strong>Why follow this</strong>{E(story['context'])}</p><div class="world-source"><strong>Reporting &amp; evidence</strong>{reports}<div class="world-report-link">{external(story['sourceUrl'], story['source']+' — primary report')}<br><time datetime="{story['sourceDate']}">{display_date(story['sourceDate'])}</time></div></div></div></article>'''


def home_story(story):
    image = story['photo']
    return f'''<article class="world-home-item"><a class="world-home-story" href="/news/world/#{story['id']}"><div class="world-home-picture"><img src="{E(image['path'])}" alt="{E(image['alt'])}" width="{image['width']}" height="{image['height']}" loading="lazy" decoding="async"><span>{E(image['label'])}</span></div><div><small>{E(story['place'])} / {E(story['topic'])}</small><h3>{E(story['title'])} ↗</h3><p>{E(story['reporting'][0]['publisher'])} + {E(story['source'])}</p></div></a><p class="world-home-photo-credit">{E(image.get('homeCaption',image['caption']))} {external(image['sourceUrl'], image.get('homeCredit',image['credit']))} · {external(image['licenseUrl'], image['license'])}</p></article>'''


def listing_card(story):
    p = story.get('photo')
    figure = ''
    if p:
        figure = f'''<figure class="news-documentary-photo"><a href="{E(story['url'])}"><img src="{E(p['path'])}" alt="{E(p['alt'])}" width="{p['width']}" height="{p['height']}" loading="lazy"><span>{E(p['label'])}</span></a><figcaption>{E(p['caption'])} {external(p['sourceUrl'],p['credit'])} · {external(p['licenseUrl'],p['license'])}</figcaption></figure>'''
    elif story.get('image'):
        figure = f'''<a class="news-picture-link" data-image-label="Editorial illustration" href="{E(story['url'])}"><img src="{E(story['image'])}" alt="{E(story['imageAlt'])}" width="1200" height="630" loading="lazy"></a>'''
    label = 'WORLD BRIEF / '+story['sourcePublisher'] if story.get('brief') else 'NYC HIGH LIFE RADIO / ARCHIVE'
    value = story.get('sourceDate',story['publishedAt'])
    prefix = 'Primary report: ' if story.get('brief') else 'Published: '
    return f'''<article class="news-card{' world-news-card' if p else ''}">{figure}<div class="news-card-content"><p class="news-source">{E(label)}</p><h3><a href="{E(story['url'])}">{E(story['title'])}</a></h3><p>{E(story['summary'])}</p><time datetime="{value}">{prefix}{display_date(value)}</time></div></article>'''


review = f'<time datetime="{DATA["reviewedAt"]}">{display_date(DATA["reviewedAt"])}</time>'
for story in STORIES:
    p = story['photo']
    assert (ROOT / p['path'].lstrip('/')).is_file(), p['path']
    assert all(p.get(k) for k in ['sourceUrl','licenseUrl','credit','caption','label','alt'])

page_path = ROOT / 'news/world/index.html'
page = page_path.read_text()
start = page.index('<div class="world-grid">')
end = page.index('<section class="world-method"',start)
page = page[:start] + '<div class="world-grid">' + ''.join(brief(s,i) for i,s in enumerate(STORIES)) + '</div>' + page[end:]
method = '''<section class="world-method" id="source-standards"><span class="eyebrow">FOLLOW THE EVIDENCE</span><h2>Where our news comes from.</h2><p>We prioritize reporting from <strong>Reuters and the Associated Press</strong>, alongside original documents and data. Ad Fontes Media currently places both in its reliable analysis / fact reporting category. Its ratings use samples assessed by panels with different political perspectives; they are a guide, not a guarantee that every report is correct.</p><div class="world-source-links"><a href="https://www.reuters.com/world/" target="_blank" rel="noopener noreferrer">Reuters World ↗</a><a href="https://apnews.com/world-news" target="_blank" rel="noopener noreferrer">AP World ↗</a><a href="https://www.bbc.com/news/world" target="_blank" rel="noopener noreferrer">BBC World ↗</a></div><p class="world-rating-links">Independent source assessments: <a href="https://adfontesmedia.com/reuters-bias-and-reliability/" target="_blank" rel="noopener noreferrer">Reuters</a> · <a href="https://adfontesmedia.com/ap-bias-and-reliability/" target="_blank" rel="noopener noreferrer">Associated Press</a> · <a href="https://app.adfontesmedia.com/methodology" target="_blank" rel="noopener noreferrer">Rating method</a>. Checked November 9, 2026.</p><div class="world-standards-grid"><div><h3>The report behind the number</h3><p>Each brief links its primary evidence and relevant news reporting. Related or older reporting is labeled separately. Two articles repeating the same underlying report do not count as two independent confirmations.</p></div><div><h3>Real photographs. Clear context.</h3><p>The images in this edition are genuine photographs, with photographer and reuse credits. Context and archive labels identify photos that do not depict the specific current event. No generated news photographs are used. Thumbnails may be cropped for layout; image files are unaltered. Any display adaptation of the MONUSCO photograph is also licensed CC BY-SA 2.0.</p></div></div><p><strong>About this edition:</strong> AI-assisted summaries prepared from the linked public reports. Figures and forecasts are attributed; “Why follow this” provides editorial context. These are source-based briefs, not on-the-ground reporting by this station. This is a dated edition, not a live news wire. Source publishers and photographers do not endorse this site.</p><a href="/editorial/">Editorial policy</a> · <a href="/contact/">Corrections &amp; contact</a></section>'''
page = re.sub(r'<section class="world-method".*?</section>',lambda _:method,page,flags=re.S)
page = re.sub(r'/world-news.css\?v=[^"\s]+',f'/world-news.css?v={VERSION}',page)
notice = '<p class="photo-use-notice">The appearance of U.S. Department of War (DoW) visual information does not imply or constitute DoW endorsement.</p>'
page = page.replace('</footer>',notice+'</footer>') if 'photo-use-notice' not in page else page
page_path.write_text(page)

home_path = ROOT / 'index.html'
home = home_path.read_text()
start = home.index('<section id="home-news"')
end = home.index('<section id="listen"',start)
section = f'''<section id="home-news" class="world-section" aria-labelledby="world-home-title"><span class="eyebrow">BEYOND THE HEADLINES</span><h2 id="world-home-title">World news.</h2><div class="world-edition">Edition reviewed {review}</div><div class="world-home-list">{''.join(home_story(s) for s in STORIES[:3])}</div><div class="world-home-footer"><a class="text-link" href="/news/world/">All six world briefs ↗</a><a href="/news/world/#source-standards">Our sources ↗</a><a href="/news/">Local &amp; Caribbean news ↗</a></div></section>'''
home = home[:start]+section+home[end:]
home = re.sub(r'/world-news.css\?v=[^"\s]+',f'/world-news.css?v={VERSION}',home)
home = home.replace('</footer>',notice+'</footer>') if 'photo-use-notice' not in home else home
home_path.write_text(home)

index_path = ROOT / 'news/index.json'
archive = [s for s in json.loads(index_path.read_text()) if not s.get('brief')]
current = []
for s in STORIES:
    current.append({'title':s['title'],'summary':s['summary'],'url':'/news/world/#'+s['id'],'region':'world','regions':['world','haiti'] if s['place']=='Haiti' else ['world'],'category':'news','publishedAt':DATA['reviewedAt'],'sourcePublisher':s['source'],'sourceDate':s['sourceDate'],'sourceUrl':s['sourceUrl'],'brief':True,'featured':False,'photo':s['photo'],'reporting':s['reporting']})
items = current+archive
index_path.write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
hub_path = ROOT / 'news/index.html'
hub = hub_path.read_text()
start = hub.index('<div id="news-feed"')
end = hub.index('</div></section></main>',start)
hub = hub[:start] + '<div id="news-feed" class="news-grid" aria-live="polite">'+''.join(listing_card(s) for s in items)+hub[end:]
hub = re.sub(r'/world-news.css\?v=[^"\s]+',f'/world-news.css?v={VERSION}',hub)
hub = re.sub(r'/news.js\?v=[^"\s]+',f'/news.js?v={VERSION}',hub)
hub = hub.replace('</footer>',notice+'</footer>') if 'photo-use-notice' not in hub else hub
hub_path.write_text(hub)

rss = ET.Element('rss',version='2.0'); channel=ET.SubElement(rss,'channel')
for tag,text in [('title','NYC High Life Radio News'),('link','https://nychighliferadio.com/news/'),('description','World briefs and local editorial. Check each story for its source date.'),('language','en-us')]:ET.SubElement(channel,tag).text=text
for story in items:
    item=ET.SubElement(channel,'item')
    for tag,text in [('title',story['title']),('link','https://nychighliferadio.com'+story['url']),('description',story['summary']),('guid','https://nychighliferadio.com'+story['url'])]:ET.SubElement(item,tag).text=text
    if story.get('sourceUrl'):ET.SubElement(item,'source',url=story['sourceUrl']).text=story['sourcePublisher']
ET.indent(rss);ET.ElementTree(rss).write(ROOT/'news/feed.xml',encoding='utf-8',xml_declaration=True)
print(f'Rendered {len(STORIES)} photographed briefs and {len(archive)} archive listings.')
