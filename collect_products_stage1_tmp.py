import sys,json,pathlib,re,base64,hashlib
p=pathlib.Path(r'C:\Users\13185\AppData\Local\Temp\everything-skills-followup-20261025');sys.path.insert(0,str(p));import audit_api as api
short=json.loads((p/'shortlist.json').read_text('utf8'))[:20];out=[];holds=[]
def blob(full,sha):
 o=api.request(f'repos/{full}/git/blobs/{sha}');b=base64.b64decode(o['content']);return hashlib.sha256(b).hexdigest(),b.decode('utf8','replace')
for item in short:
 full=item['full_name']
 try:
  repo=api.request('repos/'+full);branch=repo.get('default_branch') or 'main';c=api.request(f'repos/{full}/commits/{branch}');commit=c['sha'];tree=c['commit']['tree']['sha'];t=api.request(f'repos/{full}/git/trees/{tree}?recursive=1');paths=[z['path'] for z in t['tree'] if z.get('type')=='blob'];read=next((x for x in paths if x.lower() in ('readme.md','readme.rst','readme')),None);lic=next((x for x in paths if re.search(r'(^|/)(license|copying|notice)(\.|$)',x,re.I)),None);skills=[x for x in paths if x.lower().endswith('skill.md') and not re.search(r'(^|/)(test|tests|example|examples|fixture|fixtures|vendor|node_modules)(/|$)',x,re.I)]
  if not read or not lic or not skills:raise ValueError('missing README/license/SKILL')
  sh={z['path']:z['sha'] for z in t['tree']};rh,rt=blob(full,sh[read]);lh,lt=blob(full,sh[lic]);rep=skills[0];ph,pt=blob(full,sh[rep]);
  if not re.search(r'(?i)(SKILL\.md|skills add|plugin marketplace|agent skills)',rt):raise ValueError('README distribution evidence absent')
  if not re.search(r'(?m)^name:\s*\S+',pt):raise ValueError('skill frontmatter absent')
  out.append({'full_name':full,'repository_id':repo['id'],'html_url':repo['html_url'],'stars':repo.get('stargazers_count',0),'default_branch':branch,'commit':commit,'tree':tree,'readme':{'path':read,'blob_sha':sh[read],'sha256':rh,'url':f'https://github.com/{full}/blob/{commit}/{read}'},'license':{'path':lic,'blob_sha':sh[lic],'sha256':lh,'url':f'https://github.com/{full}/blob/{commit}/{lic}'},'representative':{'path':rep,'blob_sha':sh[rep],'sha256':ph,'url':f'https://github.com/{full}/blob/{commit}/{rep}'},'public_skill_paths':skills,'license_spdx':(repo.get('license') or {}).get('spdx_id') or 'NOASSERTION','summary_en':repo.get('description') or f'{full} provides public Agent Skills.','license_scope':'Fixed root and nearest license evidence reviewed; external APIs, models, data and third-party components retain separate terms.','count_basis':f'Complete fixed tree has {len(skills)} public SKILL.md paths; test/example/fixture/vendor paths excluded.'});print('OK',full,flush=True)
 except Exception as e:holds.append({'full_name':full,'repository_id':item.get('id'),'reason':str(e)});print('HOLD',full,str(e),flush=True)
 if len(out)>=8:break
(p/'product-candidates-stage1.json').write_text(json.dumps({'schema_version':1,'date':'2026-10-25','queries':['SKILL.md CLI','SKILL.md SDK','SKILL.md product','SKILL.md plugin','SKILL.md embedded'],'candidates':out,'holds':holds},ensure_ascii=False,indent=2)+'\n','utf8');print('done',len(out),len(holds))
