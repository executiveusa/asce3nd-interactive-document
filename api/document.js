const fs = require('fs');
const path = require('path');

const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzc2NjczLCJleHAiOjE5MzA0NTY2NzN9.rl1mc-GgpG6nQArbEfFAKOcMvzL7rrgzPFT-LlCiCy4';

function applyEdits(source) {
  let html = source;

  html = html.replace(
    'Introduce who they are, what they do, why they exist, and why their work matters.',
    'Introduce who you are, what you do, why you exist, and why your work matters.'
  );
  html = html.replace("<h4>'+t('Who we are')+'</h4>", "<h4>'+t('Who you are')+'</h4>");
  html = html.replace("<h4>'+t('Our programs')+'</h4>", "<h4>'+t('Your programs')+'</h4>");
  html = html.replace(
    'Show people, voices, moments, and experiences that reflect the organization\\u2019s purpose.',
    'Show people, voices, moments, and experiences that reflect your organization\\u2019s purpose.'
  );

  html = html.replace(
    '    {k:"trustedOrgs",label:"5 local organizations or leaders who already have community trust",type:"textarea"},\n' +
      '    {k:"neverProp",label:"Who should never be treated like a marketing prop in your content?",type:"textarea"}\n',
    '    {k:"trustedOrgs",label:"5 local organizations or leaders who already have community trust",type:"textarea"}\n'
  );
  html = html.replace(',neverProp:""', '');

  html = html.replace(
    /var PLATFORM_OPTIONS=\[[^\n]+\];/,
    'var PLATFORM_OPTIONS=["Instagram","Facebook","LinkedIn","Email newsletter","Website/blog","Landing Page"];'
  );

  const platformFunction = `function rPlatforms(){
  var sel=state.platforms.selected;
  var chips=PLATFORM_OPTIONS.map(function(p){var on=sel.indexOf(p)>-1;return'<label class="chip'+(on?' on':'')+'" data-plat="'+esc(p)+'"><input type="checkbox" '+(on?'checked':'')+'>'+t(p)+'</label>';}).join('');
  var roles={
    "Instagram":"Visual trust, Reels, carousels, Stories, community proof.",
    "Facebook":"Local community, parents, older supporters, events, donation updates.",
    "LinkedIn":"Sponsors, partners, grant readiness, board/advisor trust.",
    "Email newsletter":"Owned audience, donor updates, volunteer reminders, deeper trust. Not the first focus, but always collect emails. It is free to do and helps build a list for the future.",
    "Website/blog":"Permanent home for stories, program pages, impact proof, and search visibility.",
    "Landing Page":"Landing page for your first event — already in process as discussed."
  };
  var roleHTML=Object.keys(roles).map(function(k){return'<div style="margin-bottom:10px;"><span class="k">'+k+'</span> — '+roles[k]+'</div>';}).join('');
  return'<h3 class="section-title">Platform Strategy</h3><p class="consultant-note">Focus only on the channels that support trust, community, partnerships, and owned audience growth.</p><div class="chips" style="margin-bottom:14px;">'+chips+'</div><div class="refcard">'+roleHTML+'</div><div class="field"><label>Which 2 platforms can you consistently manage for the next 90 days?</label><input type="text" data-sec="platforms" data-k="which2" value="'+esc(state.platforms.which2)+'"></div><div class="field"><label>Which platform matters most for donors or partners?</label><input type="text" data-sec="platforms" data-k="donorPlatform" value="'+esc(state.platforms.donorPlatform)+'"></div><div class="field"><label>Which platform matters most for the community you serve?</label><input type="text" data-sec="platforms" data-k="communityPlatform" value="'+esc(state.platforms.communityPlatform)+'"></div>';
}`;
  html = html.replace(/function rPlatforms\(\)\{[\s\S]*?\n\}/, platformFunction);

  html = html.replace(
    'Pick the cadence your team can actually maintain, not the one that sounds impressive.',
    'We start small with the light option until we gain traction. This takes time. Focus on organic followers and the people you already know. Do not worry so much about paid ads, going viral, or different algorithms. Real stories, real people, real impact.'
  );

  const persistence = `/* ══ PERSISTENCE — local-first with Supabase cloud mirror ═════════════ */
var SUPABASE_RPC='https://api.thepaulieffect.com/supabase/rest/v1/rpc/';
var SUPABASE_ANON='${SUPABASE_ANON}';
var PROJECT_ID='d0000000-0000-0000-0000-000000000001';
var DEVICE_KEY='asc3nd-device-id-v1';
var cloudSaving=false;
function getDeviceId(){var id='';try{id=localStorage.getItem(DEVICE_KEY)||'';}catch(e){}if(!id){id='asc3nd-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);try{localStorage.setItem(DEVICE_KEY,id);}catch(e){}}return id;}
function cloudHeaders(){return{'Content-Type':'application/json','apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON,'Content-Profile':'work'};}
function saveLocal(){state.lastSaved=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}updateSaveMsg();}
function queueSave(){if(saveTimer)clearTimeout(saveTimer);saveTimer=setTimeout(function(){saveLocal();},900);}
async function saveToCloud(showToast){if(cloudSaving)return false;cloudSaving=true;saveLocal();var el=document.getElementById('save-msg');if(el)el.textContent='Saving to cloud…';try{var res=await fetch(SUPABASE_RPC+'save_submission',{method:'POST',headers:cloudHeaders(),body:JSON.stringify({p_project_id:PROJECT_ID,p_device_id:getDeviceId(),p_payload:{workbook:state,saved_at:new Date().toISOString()}})});if(!res.ok)throw new Error('Cloud save failed: '+res.status);if(el)el.textContent='Saved to cloud';if(showToast)toast('Submitted and saved to cloud');return true;}catch(err){console.error(err);if(el)el.textContent='Saved locally — cloud unavailable';if(showToast)toast('Saved locally. Cloud save failed.');return false;}finally{cloudSaving=false;}}
async function loadFromCloud(){try{var res=await fetch(SUPABASE_RPC+'load_submission',{method:'POST',headers:cloudHeaders(),body:JSON.stringify({p_device_id:getDeviceId()})});if(!res.ok)return;var data=await res.json();var row=Array.isArray(data)?data[0]:data;var payload=row&&row.payload;if(payload&&payload.workbook){state=Object.assign(blank(),payload.workbook);saveLocal();if(started)renderStep();}}catch(err){console.warn('Cloud load unavailable',err);}}
function loadLocal(){
  var hash=window.location.hash;
  if(hash&&hash.startsWith('#state=')){
    try{var d=JSON.parse(decodeURIComponent(atob(hash.slice(7))));state=Object.assign(blank(),d);window.location.hash='';return;}catch(e){}
  }
  try{var saved=localStorage.getItem(STORAGE_KEY);if(saved)state=Object.assign(blank(),JSON.parse(saved));}catch(e){}
}
function updateSaveMsg(){var el=document.getElementById('save-msg');if(!el)return;if(!state.lastSaved){el.textContent='Not saved';return;}var d=new Date(state.lastSaved);el.textContent=t('Saved')+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
`;
  html = html.replace(
    /\/\* ══ PERSISTENCE [\s\S]*?function updateSaveMsg\(\)[\s\S]*?\n/,
    persistence
  );

  html = html.replace(
    'Data is embedded in the URL — no server storage needed. Recipients can edit, save locally, and share a new link.',
    'A snapshot is embedded in this URL. The live workbook also saves to the ASC3ND cloud database.'
  );

  const shareButton = `      '<button class="ebtn" onclick="openShareModal()">Share workbook <svg class="svg-icon sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></button>'+\n`;
  html = html.replace(
    shareButton,
    shareButton + `      '<button class="ebtn p" id="s-submit">Submit</button>'+\n`
  );
  html = html.replace(
    "var cp=document.getElementById('s-copy');var pr=document.getElementById('s-print');var ar=document.getElementById('s-area');",
    "var cp=document.getElementById('s-copy');var pr=document.getElementById('s-print');var sub=document.getElementById('s-submit');var ar=document.getElementById('s-area');"
  );
  html = html.replace(
    "if(pr)pr.addEventListener('click',function(){window.print();});",
    "if(pr)pr.addEventListener('click',function(){window.print();});\n  if(sub)sub.addEventListener('click',function(){saveToCloud(true);});"
  );
  html = html.replace("(isLast?t('View final plan'):t('Next'))", "(isLast?t('Submit'):t('Next'))");
  html = html.replace(
    "if(nb)nb.addEventListener('click',function(){if(stepIndex<STEPS.length-1){playPageTurn();stepIndex++;renderStep();}else renderStep();});",
    "if(nb)nb.addEventListener('click',function(){if(stepIndex<STEPS.length-1){playPageTurn();stepIndex++;renderStep();}else saveToCloud(true);});"
  );
  html = html.replace(
    'loadLocal();\ninitMenu();\nrenderCover();',
    'loadLocal();\ninitMenu();\nrenderCover();\nloadFromCloud();\nsetInterval(function(){saveToCloud(false);},10000);'
  );

  const offerStart = html.indexOf('<!-- ── OFFER DIVIDER ── -->');
  const footerStart = html.indexOf('<!-- FOOTER -->');
  if (offerStart >= 0 && footerStart > offerStart) {
    html = html.slice(0, offerStart) + html.slice(footerStart);
  }

  return html;
}

module.exports = function handler(req, res) {
  const file = path.join(process.cwd(), 'index.html');
  const source = fs.readFileSync(file, 'utf8');
  const html = applyEdits(source);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send(html);
};
