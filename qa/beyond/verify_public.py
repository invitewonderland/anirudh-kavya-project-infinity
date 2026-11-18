from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request,urlopen
from urllib.parse import quote
import hashlib,json,sys,time
root=Path(__file__).resolve().parents[2]
dist=root/'publication/github-pages/dist'
base='https://invitewonderland.github.io/armaan-meher-noor-mahal/'
release=sys.argv[1]
text_types={'.html','.css','.js','.json','.webmanifest','.svg','.txt','.md'}
def verify(file):
 relative=file.relative_to(dist).as_posix()
 url=base+quote(relative,safe='/')+'?release='+release
 with urlopen(Request(url,headers={'User-Agent':'Invite-Wonderland-Release-Verification','Cache-Control':'no-cache'}),timeout=40) as response:
  status=response.status;data=response.read()
 expected=file.read_bytes()
 if file.suffix in text_types:
  a=data.replace(b'\r\n',b'\n');b=expected.replace(b'\r\n',b'\n')
 else:a,b=data,expected
 if status!=200 or a!=b:raise RuntimeError(f'{relative}: status {status}, content does not match release')
 return {'file':relative,'status':status,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'matchesRelease':True}
files=sorted(f for f in dist.rglob('*') if f.is_file())
with ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(verify,files))
result={'release':release,'url':base,'checkedFiles':len(results),'allMatched':all(r['matchesRelease'] for r in results),'files':results}
Path(__file__).with_name('public-assets.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='files'},indent=2))
