from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

if 'month1_rhythm' in s:
    print('Month 1 chapter already present; no changes needed.')
    raise SystemExit(0)

css = r'''
/* ══ MONTH 1 — INSTAGRAM SYSTEM ═════════════════════════════════════ */
.m1-kicker{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:8px;}
.m1-display{font-family:'Barlow Condensed',sans-serif;font-size:clamp(34px,6vw,54px);line-height:.98;letter-spacing:-.025em;margin:0 0 14px;font-weight:800;max-width:720px;}
.m1-lead{font-size:16px;line-height:1.65;color:var(--ink2);max-width:720px;margin:0 0 24px;}
.m1-note{border-left:2px solid var(--gold);padding:11px 0 11px 16px;font-size:13.5px;color:var(--ink2);max-width:720px;margin:20px 0;}
.m1-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:24px 0 14px;}
.m1-tab{min-height:58px;border:.5px solid var(--border);background:var(--card);border-radius:12px;padding:11px 14px;text-align:left;cursor:pointer;color:var(--ink);font-family:inherit;}
.m1-tab strong{display:block;font-size:15px;}.m1-tab span{display:block;font-size:10px;letter-spacing:.12em;color:var(--muted);margin-top:2px;font-weight:700;}
.m1-tab.active{background:var(--ink);color:#fff;border-color:var(--ink);}.m1-tab.active span{color:rgba(255,255,255,.65);}
.m1-rhythm-card{display:grid;grid-template-columns:minmax(140px,.65fr) 1.5fr;gap:26px;align-items:center;background:var(--card2);border:.5px solid var(--border);border-radius:16px;padding:24px;}
.m1-rhythm-day{font-family:'Barlow Condensed',sans-serif;font-size:clamp(38px,7vw,68px);font-weight:800;letter-spacing:-.04em;line-height:.9;text-transform:uppercase;}
.m1-rhythm-card h4{font-family:'Barlow Condensed',sans-serif;font-size:26px;line-height:1.05;margin:4px 0 10px;}.m1-rhythm-card p{font-size:14px;color:var(--ink2);line-height:1.55;margin:0 0 12px;}.m1-format{display:inline-block;border:.5px solid var(--border-strong);border-radius:999px;padding:6px 10px;font-size:11px;font-weight:700;}
.m1-color-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0;}.m1-color-card{min-height:270px;border-radius:16px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;border:.5px solid var(--border);}.m1-color-card.black{background:#0a0a0a;color:#fff;border-color:#0a0a0a;}.m1-color-card.cream{background:#F5F1E8;color:#0a0a0a;}.m1-color-card small{font-size:10px;letter-spacing:.12em;font-weight:800;}.m1-color-card h4{font-family:'Barlow Condensed',sans-serif;font-size:32px;line-height:.95;margin:auto 0 12px;}.m1-color-card p{font-size:13px;line-height:1.5;margin:0;opacity:.8;}
.m1-pattern{display:grid;grid-template-columns:repeat(8,1fr);height:44px;border:.5px solid var(--border);border-radius:10px;overflow:hidden;margin:18px 0 12px;}.m1-pattern span:nth-child(odd){background:#0a0a0a}.m1-pattern span:nth-child(even){background:#F5F1E8}
.m1-calendar{margin-top:20px;border-top:.5px solid var(--border);}.m1-cal-head,.m1-cal-row{display:grid;grid-template-columns:56px repeat(3,1fr);gap:8px;}.m1-cal-head{padding:10px 0;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;}.m1-cal-row{padding:8px 0;border-top:.5px solid var(--border);}.m1-week{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:800;display:flex;align-items:center;}.m1-cal-cell{min-height:118px;border-radius:12px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;border:.5px solid var(--border);}.m1-cal-cell.identity{background:#f7f7f8}.m1-cal-cell.story{background:#fff}.m1-cal-cell.community{background:#0a0a0a;color:#fff;border-color:#0a0a0a}.m1-cal-cell small{font-size:10px;letter-spacing:.1em;font-weight:800;opacity:.65}.m1-cal-cell strong{font-size:13px;line-height:1.35;}
.m1-reels{display:grid;gap:10px;margin:20px 0;}.m1-reel{display:grid;grid-template-columns:54px 1fr auto;gap:14px;align-items:center;padding:15px 16px;border:.5px solid var(--border);border-radius:14px;background:#fff;}.m1-reel-no{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:800;color:var(--muted);}.m1-reel h4{font-size:14px;margin:0 0 3px}.m1-reel p{font-size:12.5px;color:var(--muted);margin:0;line-height:1.4}.m1-status{font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:800;border:.5px solid var(--border);border-radius:999px;padding:5px 8px;white-space:nowrap;}.m1-status.now{background:var(--ink);color:#fff;border-color:var(--ink)}
.m1-open{background:#0a0a0a;color:#fff;border-radius:16px;padding:24px;margin:22px 0;}.m1-open .m1-kicker{color:rgba(255,255,255,.58)}.m1-open blockquote{font-family:'Barlow Condensed',sans-serif;font-size:clamp(25px,5vw,38px);line-height:1.08;font-weight:700;margin:8px 0 10px;}.m1-open p{font-size:12.5px;color:rgba(255,255,255,.7);margin:0;}
.m1-rule-list{border-top:.5px solid var(--border);margin-top:18px;}.m1-rule{display:grid;grid-template-columns:44px 1fr;gap:12px;padding:15px 0;border-bottom:.5px solid var(--border);align-items:start;}.m1-rule span{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:var(--muted)}.m1-rule p{font-size:14px;margin:0;line-height:1.5;}
.m1-handoff{background:#0a0a0a;color:#fff;border-radius:18px;padding:clamp(24px,5vw,42px);margin-top:18px;}.m1-handoff .m1-kicker{color:var(--gold)}.m1-handoff h4{font-family:'Barlow Condensed',sans-serif;font-size:clamp(30px,5vw,44px);line-height:1;margin:6px 0 16px;}.m1-handoff p{font-size:14px;color:rgba(255,255,255,.72);line-height:1.6;max-width:640px;}.m1-handoff-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px;}.m1-handoff-grid div{border:.5px solid rgba(255,255,255,.18);border-radius:12px;padding:14px;font-size:12.5px;line-height:1.45;}.m1-handoff-grid strong{display:block;color:#fff;margin-bottom:4px;}
@media(max-width:620px){.m1-tabs,.m1-color-grid,.m1-handoff-grid{grid-template-columns:1fr}.m1-rhythm-card{grid-template-columns:1fr}.m1-cal-head{display:none}.m1-cal-row{grid-template-columns:1fr}.m1-week{padding-top:12px}.m1-cal-cell{min-height:96px}.m1-reel{grid-template-columns:42px 1fr}.m1-status{grid-column:2;justify-self:start}.m1-pattern{grid-template-columns:repeat(4,1fr);height:72px}}
'''
anchor = '</style>\n</head>'
assert anchor in s, 'CSS anchor not found'
s = s.replace(anchor, css + '\n</style>\n</head>', 1)

old_steps = 'var STEPS=["welcome","followup","ch1","strategy","basics","mission","audience","voice","story","pillars","platforms","roadmap","rhythm","engagement","measurement","risk","summary","ch2_hero","ch2_cover","ch2_truth","ch2_responsibilities","ch2_runshow","ch2_operations","ch2_founder_prep","ch2_interview","ch2_readiness","ch2_eventday","ch2_results","ch2_buildon"];'
new_steps = 'var STEPS=["welcome","followup","ch1","strategy","month1_rhythm","month1_colors","month1_calendar","month1_reels","month1_handoff","basics","mission","audience","voice","story","pillars","platforms","roadmap","rhythm","engagement","measurement","risk","summary","ch2_hero","ch2_cover","ch2_truth","ch2_responsibilities","ch2_runshow","ch2_operations","ch2_founder_prep","ch2_interview","ch2_readiness","ch2_eventday","ch2_results","ch2_buildon"];'
assert old_steps in s, 'STEPS anchor not found'
s = s.replace(old_steps, new_steps, 1)

# Align the earlier high-level strategy page with the approved Month 1 cadence.
s = s.replace("'<div class=\"strat-day\"><strong>'+t('Monday')+'</strong><p>'+t('Mission, leadership, or youth.')+'</p></div>'+", "'<div class=\"strat-day\"><strong>'+t('Monday')+'</strong><p>'+m1('Identity — who ASC3ND is and what it believes.','Identidad — quién es ASC3ND y en qué cree.')+'</p></div>'+", 1)
s = s.replace("'<div class=\"strat-day\"><strong>'+t('Wednesday')+'</strong><p>'+t('Program, resource, or tip.')+'</p></div>'+", "'<div class=\"strat-day\"><strong>'+t('Wednesday')+'</strong><p>'+m1('Story Reel — real voices, real footage, human story.','Reel de historia — voces reales, imágenes reales, historia humana.')+'</p></div>'+", 1)
s = s.replace("'<div class=\"strat-day\"><strong>'+t('Friday')+'</strong><p>'+t('Human story, team, or community.')+'</p></div>'+", "'<div class=\"strat-day\"><strong>'+t('Friday')+'</strong><p>'+m1('Community — invitation, proof, event, or next action.','Comunidad — invitación, evidencia, evento o siguiente acción.')+'</p></div>'+", 1)

month1_js = r'''
/* ══ MONTH 1 — INSTAGRAM SYSTEM ═════════════════════════════════════ */
function m1(en,es){return lang==='es'?es:en;}

var M1_RHYTHM=[
  {day:'Monday',dayEs:'Lunes',role:'IDENTITY',roleEs:'IDENTIDAD',title:'Introduce ASC3ND and who you are as a nonprofit.',titleEs:'Presentar ASC3ND y quiénes son como organización sin fines de lucro.',body:'Monday creates clarity. Someone discovering ASC3ND should understand the mission before being asked to attend, donate, volunteer, or share.',bodyEs:'El lunes crea claridad. Alguien que descubre ASC3ND debe entender la misión antes de que se le pida asistir, donar, ser voluntario o compartir.',format:'Static post / brand statement',formatEs:'Publicación estática / declaración de marca'},
  {day:'Wednesday',dayEs:'Miércoles',role:'STORY',roleEs:'HISTORIA',title:'Let people hear and feel the story through video.',titleEs:'Permitir que las personas escuchen y sientan la historia a través del video.',body:'Wednesday is the human center of the week. Real voices and real footage create connection and show the people behind the mission.',bodyEs:'El miércoles es el centro humano de la semana. Las voces y las imágenes reales crean conexión y muestran a las personas detrás de la misión.',format:'Reel / documentary clip',formatEs:'Reel / clip documental'},
  {day:'Friday',dayEs:'Viernes',role:'COMMUNITY',roleEs:'COMUNIDAD',title:'Turn trust into community action.',titleEs:'Convertir la confianza en acción comunitaria.',body:'Friday gives people somewhere to go with the feeling: attend, share, support, volunteer, partner, or see what happened in the community.',bodyEs:'El viernes convierte ese sentimiento en una acción: asistir, compartir, apoyar, ser voluntario, colaborar o ver lo que ocurrió en la comunidad.',format:'Community / event / proof post',formatEs:'Publicación de comunidad / evento / evidencia'}
];

function rMonth1Rhythm(){
  return'<div class="page">'+
    '<div class="m1-kicker">'+m1('MONTH 1 · INSTAGRAM SYSTEM','MES 1 · SISTEMA DE INSTAGRAM')+'</div>'+
    '<h3 class="m1-display">'+m1('Three posts a week. One story people can relate to.','Tres publicaciones por semana. Una historia con la que la gente puede conectar.')+'</h3>'+
    '<p class="m1-lead">'+m1('Hello Otha and Elisha. Our first approach is a simple weekly rhythm: Monday explains who ASC3ND is, Wednesday lets people hear and feel the story through video, and Friday turns that trust into community action.','Hola Otha y Elisha. Nuestro primer enfoque es un ritmo semanal sencillo: el lunes explica quién es ASC3ND, el miércoles permite que las personas escuchen y sientan la historia a través del video, y el viernes convierte esa confianza en acción comunitaria.')+'</p>'+
    '<div class="m1-tabs" role="tablist" aria-label="'+m1('Weekly content rhythm','Ritmo semanal de contenido')+'">'+
      M1_RHYTHM.map(function(x,i){return'<button type="button" class="m1-tab '+(i===0?'active':'')+'" role="tab" aria-selected="'+(i===0?'true':'false')+'" data-m1-day="'+i+'"><strong>'+m1(x.day,x.dayEs)+'</strong><span>'+m1(x.role,x.roleEs)+'</span></button>';}).join('')+
    '</div>'+
    '<div class="m1-rhythm-card" id="m1-rhythm-panel"></div>'+
    '<div class="m1-note"><strong>'+m1('Why this works: ','Por qué funciona: ')+'</strong>'+m1('Monday explains. Wednesday makes people feel it. Friday gives them somewhere to go with that feeling.','El lunes explica. El miércoles hace que las personas lo sientan. El viernes les da un lugar a donde llevar ese sentimiento.')+'</div>'+
  '</div>';
}
function bMonth1Rhythm(c){
  function show(i){
    var x=M1_RHYTHM[i]||M1_RHYTHM[0];
    c.querySelectorAll('.m1-tab').forEach(function(btn,j){btn.classList.toggle('active',j===i);btn.setAttribute('aria-selected',j===i?'true':'false');});
    var panel=c.querySelector('#m1-rhythm-panel');
    if(panel)panel.innerHTML='<div class="m1-rhythm-day">'+m1(x.day,x.dayEs)+'</div><div><div class="m1-kicker">'+m1(x.role,x.roleEs)+'</div><h4>'+m1(x.title,x.titleEs)+'</h4><p>'+m1(x.body,x.bodyEs)+'</p><span class="m1-format">'+m1(x.format,x.formatEs)+'</span></div>';
  }
  c.querySelectorAll('.m1-tab').forEach(function(btn){btn.addEventListener('click',function(){show(parseInt(btn.dataset.m1Day,10)||0);});});
  show(0);
}

function rMonth1Colors(){
  return'<div class="page">'+
    '<div class="m1-kicker">02 · '+m1('WHY BLACK + CREAM','POR QUÉ NEGRO + CREMA')+'</div>'+
    '<h3 class="m1-display">'+m1('The color rhythm becomes part of the strategy.','El ritmo de color se convierte en parte de la estrategia.')+'</h3>'+
    '<p class="m1-lead">'+m1('We are building from the colors in ASC3ND’s original flyer. The workbook stays black, white, and gold; these two campaign colors are shown here as a visual reference for the Instagram feed.','Estamos construyendo a partir de los colores del volante original de ASC3ND. El cuaderno mantiene negro, blanco y dorado; estos dos colores de campaña se muestran aquí como referencia visual para el feed de Instagram.')+'</p>'+
    '<div class="m1-color-grid">'+
      '<article class="m1-color-card black"><small>BLACK · #050505</small><h4>'+m1('Strength + structure','Fuerza + estructura')+'</h4><p>'+m1('Strength, focus, seriousness, and structure. Black gives the mission authority and keeps important statements from feeling casual or disposable.','Fuerza, enfoque, seriedad y estructura. El negro da autoridad a la misión y evita que los mensajes importantes se sientan casuales o desechables.')+'</p></article>'+
      '<article class="m1-color-card cream"><small>CREAM · #F5F1E8</small><h4>'+m1('Warmth + possibility','Calidez + posibilidad')+'</h4><p>'+m1('Humanity, warmth, possibility, and breathing room. Cream softens the system and makes the organization feel welcoming rather than institutional.','Humanidad, calidez, posibilidad y espacio para respirar. El crema suaviza el sistema y hace que la organización se sienta acogedora en lugar de institucional.')+'</p></article>'+
    '</div>'+
    '<div class="m1-pattern" aria-hidden="true">'+[0,1,2,3,4,5,6,7].map(function(){return'<span></span>';}).join('')+'</div>'+
    '<div class="m1-note"><strong>'+m1('Why alternate? ','¿Por qué alternar? ')+'</strong>'+m1('The contrast creates rhythm. Instead of twelve posts competing for attention, the grid breathes: strong / open / strong / open. It stays recognizable without becoming a puzzle that falls apart when a post is delayed.','El contraste crea ritmo. En vez de que doce publicaciones compitan por atención, el grid respira: fuerte / abierto / fuerte / abierto. Se mantiene reconocible sin convertirse en un rompecabezas que se rompe si una publicación se retrasa.')+'</div>'+
  '</div>';
}

var M1_CALENDAR=[
  ['01','ASC3ND is here to help young people rise.','Why We Started','Empower Youth. Elevate Futures.','ASC3ND está aquí para ayudar a los jóvenes a crecer.','Por Qué Comenzamos','Empoderar a la juventud. Elevar futuros.'],
  ['02','Education. Mentorship. Leadership.','What a Mentor Can Do','Community Cuts for Kids','Educación. Mentoría. Liderazgo.','Lo Que Puede Hacer un Mentor','Community Cuts for Kids'],
  ['03','A fresh start builds confidence.','Getting Ready','This Sunday. Arrive early.','Un nuevo comienzo crea confianza.','Preparándonos','Este domingo. Llega temprano.'],
  ['04','Thank you for showing up.','Community in Action','This is only the beginning.','Gracias por estar presentes.','Comunidad en Acción','Esto es solo el comienzo.']
];
function rMonth1Calendar(){
  var rows=M1_CALENDAR.map(function(r){return'<div class="m1-cal-row"><div class="m1-week"><span style="font-size:11px;color:var(--muted);margin-right:5px;">'+m1('WEEK','SEM')+'</span>'+r[0]+'</div><div class="m1-cal-cell identity"><small>'+m1('MON · IDENTITY','LUN · IDENTIDAD')+'</small><strong>'+m1(r[1],r[4])+'</strong></div><div class="m1-cal-cell story"><small>'+m1('WED · STORY REEL','MIÉ · REEL')+'</small><strong>'+m1(r[2],r[5])+'</strong></div><div class="m1-cal-cell community"><small>'+m1('FRI · COMMUNITY','VIE · COMUNIDAD')+'</small><strong>'+m1(r[3],r[6])+'</strong></div></div>';}).join('');
  return'<div class="page">'+
    '<div class="m1-kicker">03 · '+m1('THE FIRST-MONTH CALENDAR','CALENDARIO DEL PRIMER MES')+'</div>'+
    '<h3 class="m1-display">'+m1('Four weeks. Twelve primary Feed posts.','Cuatro semanas. Doce publicaciones principales en el Feed.')+'</h3>'+
    '<p class="m1-lead">'+m1('Instagram displays three posts across. Monday publishes first and lands on the right, Wednesday becomes the center Reel, and Friday publishes last and lands on the left. Four weeks create four complete rows.','Instagram muestra tres publicaciones por fila. El lunes se publica primero y queda a la derecha, el miércoles se convierte en el Reel central y el viernes se publica al final y queda a la izquierda. Cuatro semanas crean cuatro filas completas.')+'</p>'+
    '<div class="m1-calendar" role="table" aria-label="'+m1('First month Instagram calendar','Calendario de Instagram del primer mes')+'"><div class="m1-cal-head" role="row"><span>'+m1('WEEK','SEMANA')+'</span><span>'+m1('MON · IDENTITY','LUN · IDENTIDAD')+'</span><span>'+m1('WED · REEL','MIÉ · REEL')+'</span><span>'+m1('FRI · COMMUNITY','VIE · COMUNIDAD')+'</span></div>'+rows+'</div>'+
    '<div class="m1-note">'+m1('Each post must still make sense by itself. The grid is a rhythm, not one image sliced into twelve pieces.','Cada publicación debe tener sentido por sí sola. El grid es un ritmo, no una sola imagen cortada en doce piezas.')+'</div>'+
  '</div>';
}

function rMonth1Reels(){
  var reels=[
    ['01','Why We Started','Por Qué Comenzamos',m1('THIS WEEK','ESTA SEMANA'),'now',m1('Founder story · real interview · approximately 27 seconds','Historia de los fundadores · entrevista real · aproximadamente 27 segundos')],
    ['02','What a Mentor Can Do','Lo Que Puede Hacer un Mentor',m1('NEXT','SIGUIENTE'),'',''],
    ['03','Getting Ready','Preparándonos',m1('PLANNED','PLANIFICADO'),'',''],
    ['04','Community in Action','Comunidad en Acción',m1('PLANNED','PLANIFICADO'),'','']
  ];
  var list=reels.map(function(r){return'<div class="m1-reel"><div class="m1-reel-no">'+r[0]+'</div><div><h4>'+m1(r[1],r[2])+'</h4><p>'+(r[5]||m1('Real voice · real footage · one clear story','Voz real · imágenes reales · una historia clara'))+'</p></div><span class="m1-status '+r[4]+'">'+r[3]+'</span></div>';}).join('');
  return'<div class="page">'+
    '<div class="m1-kicker">04 · '+m1('WEDNESDAY REELS','REELS DE LOS MIÉRCOLES')+'</div>'+
    '<h3 class="m1-display">'+m1('The human story sits in the middle of every week.','La historia humana está en el centro de cada semana.')+'</h3>'+
    '<p class="m1-lead">'+m1('Wednesday is where ASC3ND sounds like people, not a brochure. Use the founders’ real words, real community footage, and a short documentary structure. No invented narration.','El miércoles es donde ASC3ND suena como personas, no como un folleto. Usa las palabras reales de los fundadores, imágenes reales de la comunidad y una estructura documental breve. Sin narración inventada.')+'</p>'+
    '<div class="m1-open"><div class="m1-kicker">'+m1('WEEK 1 · COLD OPEN','SEMANA 1 · APERTURA EN FRÍO')+'</div><blockquote>“'+m1('Growing up in life and not having the right mentors around me…','Al crecer en la vida y no tener a los mentores adecuados a mi alrededor…')+'”</blockquote><p>'+m1('Open on the strongest face/frame. No opening logo. Move directly into the founder’s story, then resolve into why ASC3ND exists.','Abre con el rostro/encuadre más fuerte. Sin logo al inicio. Entra directamente en la historia del fundador y luego resuelve por qué existe ASC3ND.')+'</p></div>'+
    '<div class="m1-reels">'+list+'</div>'+
    '<div class="m1-note"><strong>'+m1('Editing rule: ','Regla de edición: ')+'</strong>'+m1('Preserve the meaning of the real interview. Captions support the speaker; they do not rewrite the speaker.','Preserva el significado de la entrevista real. Los subtítulos apoyan al orador; no reescriben sus palabras.')+'</div>'+
  '</div>';
}

function rMonth1Handoff(){
  var rules=[
    [m1('Every post should make sense by itself.','Cada publicación debe tener sentido por sí sola.')],
    [m1('The grid should feel related, not like one image cut into twelve pieces.','El grid debe sentirse relacionado, no como una imagen cortada en doce partes.')],
    [m1('Use real ASC3ND people and real community footage for documentary storytelling.','Usa personas reales de ASC3ND e imágenes reales de la comunidad para contar historias documentales.')],
    [m1('Keep one dominant message per post. Clarity wins.','Mantén un mensaje dominante por publicación. La claridad gana.')],
    [m1('Consistency matters more than posting constantly.','La consistencia importa más que publicar constantemente.')]
  ];
  var ruleHtml=rules.map(function(r,i){return'<div class="m1-rule"><span>'+String(i+1).padStart(2,'0')+'</span><p>'+r[0]+'</p></div>';}).join('');
  return'<div class="page">'+
    '<div class="m1-kicker">05 · '+m1('MONTH 1 HANDOFF','ENTREGA DEL MES 1')+'</div>'+
    '<h3 class="m1-display">'+m1('A repeatable system, not a one-time campaign.','Un sistema repetible, no una campaña de una sola vez.')+'</h3>'+
    '<p class="m1-lead">'+m1('The goal is to make it easy to know what kind of story belongs on each day, why the grid looks the way it does, and how to keep the rhythm going after the event.','El objetivo es facilitar saber qué tipo de historia corresponde a cada día, por qué el grid se ve como se ve y cómo mantener el ritmo después del evento.')+'</p>'+
    '<div class="m1-rule-list">'+ruleHtml+'</div>'+
    '<div class="m1-handoff"><div class="m1-kicker">ASC3ND · '+m1('CLIENT HANDOFF','ENTREGA AL CLIENTE')+'</div><h4>'+m1('With your approval, this becomes the operating rhythm for Month 1.','Con su aprobación, este se convierte en el ritmo operativo del Mes 1.')+'</h4><p>'+m1('The strategy stays simple enough for your team to continue: identify the Monday message, choose the real story for Wednesday, give the community a clear next step on Friday, then repeat.','La estrategia se mantiene lo suficientemente simple para que su equipo continúe: identificar el mensaje del lunes, elegir la historia real del miércoles, dar a la comunidad un siguiente paso claro el viernes y repetir.')+'</p><div class="m1-handoff-grid"><div><strong>'+m1('Monday','Lunes')+'</strong>'+m1('Explain who ASC3ND is.','Explica quién es ASC3ND.')+'</div><div><strong>'+m1('Wednesday','Miércoles')+'</strong>'+m1('Let a real person carry the story.','Deja que una persona real cuente la historia.')+'</div><div><strong>'+m1('Friday','Viernes')+'</strong>'+m1('Give the community a next action.','Da a la comunidad una siguiente acción.')+'</div><div><strong>'+m1('Always','Siempre')+'</strong>'+m1('Protect trust, consent, and accuracy.','Protege la confianza, el consentimiento y la precisión.')+'</div></div></div>'+
  '</div>';
}

'''
nav_anchor = '/* ══ NAVIGATION ══════════════════════════════════════════════════════ */'
assert nav_anchor in s, 'Navigation anchor not found'
s = s.replace(nav_anchor, month1_js + nav_anchor, 1)

# Navigation titles.
title_anchor = "'strategy':'Initial Social Media Strategy',"
assert title_anchor in s, 'sTitle strategy anchor not found'
s = s.replace(title_anchor, title_anchor + "'month1_rhythm':'Month 1 — Instagram Rhythm','month1_colors':'Month 1 — Color Rhythm','month1_calendar':'Month 1 — Calendar','month1_reels':'Month 1 — Wednesday Reels','month1_handoff':'Month 1 — Handoff',", 1)

# Router.
router_anchor = "  else if(id==='strategy')h=rStrategy();\n"
assert router_anchor in s, 'render router anchor not found'
s = s.replace(router_anchor, router_anchor + "  else if(id==='month1_rhythm')h=rMonth1Rhythm();\n  else if(id==='month1_colors')h=rMonth1Colors();\n  else if(id==='month1_calendar')h=rMonth1Calendar();\n  else if(id==='month1_reels')h=rMonth1Reels();\n  else if(id==='month1_handoff')h=rMonth1Handoff();\n", 1)

bind_anchor = "    else if(id==='strategy')bStrategy(body);\n"
assert bind_anchor in s, 'bind router anchor not found'
s = s.replace(bind_anchor, bind_anchor + "    else if(id==='month1_rhythm')bMonth1Rhythm(body);\n", 1)

p.write_text(s, encoding='utf-8')
print('Month 1 Instagram chapter inserted successfully.')
