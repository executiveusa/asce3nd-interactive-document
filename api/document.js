const fs = require('fs');
const path = require('path');

const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzc2NjczLCJleHAiOjE5MzA0NTY2NzN9.rl1mc-GgpG6nQArbEfFAKOcMvzL7rrgzPFT-LlCiCy4';

const ES_EXTRA = {
  'A working strategy document':'Un documento estratégico en funcionamiento',
  '90-Day Social Presence Builder':'Constructor de presencia en redes sociales de 90 días',
  'A guided workbook for building a consistent, trusted, and mission-driven social media presence — filled out together, saved automatically, and revisited as you grow.':'Un cuaderno guiado para construir una presencia constante, confiable y orientada por la misión en redes sociales; se completa en equipo, se guarda automáticamente y se actualiza a medida que crecen.',
  'Your first 90 days should build trust before asking for attention.':'Tus primeros 90 días deben construir confianza antes de pedir atención.',
  'Prepared by':'Preparado por','for':'para','Begin the workbook':'Comenzar el cuaderno','Continue the workbook':'Continuar el cuaderno','Share':'Compartir',
  'From Macs Digital Media':'De Macs Digital Media','Welcome.':'Bienvenidos.',
  'We want to thank you for choosing Mac Digital Media. We appreciate your trust and will be here with you every step of the way.':'Queremos agradecerles por elegir Macs Digital Media. Valoramos su confianza y estaremos con ustedes en cada paso del proceso.',
  'The following chapters are an interactive guide to your social media strategy. This document can be updated and changed as we proceed and will serve as a baseline for us to share ideas, track feedback and keep track of our progress as we build your brand and social media presence.':'Los siguientes capítulos son una guía interactiva para su estrategia de redes sociales. Este documento puede actualizarse a medida que avancemos y servirá como base para compartir ideas, registrar comentarios y dar seguimiento al progreso mientras construimos su marca y presencia digital.',
  'We invite your questions and feedback and are excited to see what we can create.':'Los invitamos a compartir sus preguntas y comentarios. Nos entusiasma ver lo que podemos crear juntos.',
  'After our kickoff':'Después de nuestra sesión inicial','Follow-up from Session 1':'Seguimiento de la sesión 1',
  'A short list to keep us moving. Check off what’s done, add anything we missed, and leave questions or comments in the box on the right. We’ll review together at the next session.':'Una lista breve para mantener el avance. Marquen lo que ya está hecho, agreguen lo que falte y dejen sus preguntas o comentarios en el espacio de la derecha. Lo revisaremos juntos en la próxima sesión.',
  'Action items for ASC3ND':'Tareas para ASC3ND','Tap to check off. Add your own below.':'Toquen para marcar una tarea. También pueden agregar una nueva abajo.',
  'Add an action item…':'Agregar una tarea…','Add':'Agregar','complete':'completado','completed':'completado',
  'Questions & comments':'Preguntas y comentarios','Anything you’d like clarified, changed, or explored. We read every note.':'Escriban cualquier tema que quieran aclarar, cambiar o explorar. Leemos cada nota.',
  'Type your questions or comments here…':'Escriban aquí sus preguntas o comentarios…','Saved automatically as you type':'Se guarda automáticamente mientras escriben','No items yet. Add one below.':'Todavía no hay tareas. Agreguen una abajo.',
  'Confirm the 3 priority platforms: Instagram, Facebook, LinkedIn.':'Confirmar las 3 plataformas prioritarias: Instagram, Facebook y LinkedIn.',
  'Send Macs Digital Media the existing logo files and brand colors.':'Enviar a Macs Digital Media los archivos existentes del logotipo y los colores de marca.',
  'Share 8–12 real photos of team, programs, or community moments.':'Compartir entre 8 y 12 fotos reales del equipo, los programas o momentos de la comunidad.',
  'Confirm image-use permissions (especially where minors appear).':'Confirmar los permisos de uso de imagen, especialmente cuando aparezcan menores.',
  'Identify 2–3 team members who will be the social media point people.':'Identificar a 2 o 3 integrantes del equipo que serán responsables de redes sociales.',
  'Reply with any names, roles, or bios to feature first.':'Compartir los nombres, cargos o biografías que deban presentarse primero.',
  'Build awareness':'Construir reconocimiento','Build trust':'Construir confianza','Starting point':'Punto de partida','Positioning first, conversion later':'Primero el posicionamiento; después, la conversión',
  '90-day objective':'Objetivo de 90 días','Recommended channels':'Canales recomendados','Key audiences':'Audiencias clave','Content pillars':'Pilares de contenido','Phased strategy':'Estrategia por fases','Weekly calendar':'Calendario semanal','First ideas':'Primeras ideas','Key recommendations':'Recomendaciones clave','Closing and next steps':'Cierre y próximos pasos',
  'Introduce who you are, what you do, why you exist, and why your work matters.':'Presentar quiénes son, qué hacen, por qué existen y por qué su trabajo es importante.',
  'Six pillars to build brand and community':'Seis pilares para construir marca y comunidad','Who you are':'Quiénes son','Your programs':'Sus programas','Human stories':'Historias humanas','Education and resources':'Educación y recursos','Community and participation':'Comunidad y participación','Impact and transparency':'Impacto y transparencia',
  'Present Asc3nd’s mission, values, story, team, and reason for existing.':'Presentar la misión, los valores, la historia, el equipo y la razón de ser de ASC3ND.',
  'Explain the areas of education, mentorship, leadership, community, and well-being.':'Explicar las áreas de educación, mentoría, liderazgo, comunidad y bienestar.',
  'Show people, voices, moments, and experiences that reflect your organization’s purpose.':'Mostrar personas, voces, momentos y experiencias que reflejen el propósito de su organización.',
  'Deliver practical value to youth, families, volunteers, and mentors.':'Ofrecer valor práctico a jóvenes, familias, voluntariado y mentores.',
  'Invite people to get involved, attend, collaborate, share, and become part of the movement.':'Invitar a las personas a participar, asistir, colaborar, compartir y formar parte del movimiento.',
  'Reinforce trust through progress, learnings, results, and public-facing development.':'Reforzar la confianza mediante avances, aprendizajes, resultados y desarrollo comunicado públicamente.',
  'A three-month launch path':'Una ruta de lanzamiento de tres meses','Month 1: introduction and identity':'Mes 1: presentación e identidad','Month 2: trust and value':'Mes 2: confianza y valor','Month 3: participation and community':'Mes 3: participación y comunidad',
  'Focus content on explaining who Asc3nd is, what it represents, what programs it supports, and why it exists.':'Enfocar el contenido en explicar quién es ASC3ND, qué representa, qué programas impulsa y por qué existe.',
  'Publish resources, educational messages, updates, and content that demonstrates seriousness, usefulness, and approachability.':'Publicar recursos, mensajes educativos, novedades y contenido que demuestre seriedad, utilidad y cercanía.',
  'Invite volunteers, mentors, families, partners, and potential donors to participate in a more direct way.':'Invitar al voluntariado, mentores, familias, aliados y posibles donantes a participar de manera más directa.',
  'Strategic note: the bilingual version will be evaluated after this first stage, once the brand has greater clarity, awareness, and traction.':'Nota estratégica: la versión bilingüe se evaluará después de esta primera etapa, cuando la marca tenga mayor claridad, reconocimiento y tracción.',
  'A simple rhythm for consistent publishing':'Un ritmo sencillo para publicar con constancia','Monday':'Lunes','Wednesday':'Miércoles','Friday':'Viernes','Stories':'Historias','Mission, leadership, or youth.':'Misión, liderazgo o juventud.','Program, resource, or tip.':'Programa, recurso o consejo.','Human story, team, or community.':'Historia humana, equipo o comunidad.','Polls, progress updates, questions, and reminders.':'Encuestas, avances, preguntas y recordatorios.','Weekly or biweekly institutional update.':'Actualización institucional semanal o quincenal.',
  'Initial content to open the conversation':'Contenido inicial para abrir la conversación','Welcome to Asc3nd Collective':'Bienvenidos a ASC3ND Collective','Our mission':'Nuestra misión','What Asc3nd stands for':'Lo que representa ASC3ND','Meet the team':'Conozcan al equipo','Our core programs':'Nuestros programas principales','What a mentor can do':'Lo que puede aportar un mentor','How to get involved':'Cómo participar','Volunteer with us':'Haz voluntariado con nosotros','What we are building in the community':'Lo que estamos construyendo en la comunidad',
  'Principles for communicating with trust':'Principios para comunicar con confianza','Positioning first':'Primero, posicionamiento','Real material':'Material real','Image permissions':'Permisos de imagen','Dignified communication':'Comunicación digna',
  'Focus the first stage on building awareness and brand clarity before expanding language.':'Enfocar la primera etapa en construir reconocimiento y claridad de marca antes de ampliar los idiomas.',
  'Use real photos and videos, documenting meetings, activities, and partnerships.':'Usar fotos y videos reales que documenten reuniones, actividades y alianzas.','Have image-use permissions in place, especially when minors appear.':'Contar con permisos de uso de imagen, especialmente cuando aparezcan menores.','Avoid charity-framed communication and show young people through their potential, not through deficit.':'Evitar una comunicación basada en la caridad y mostrar a los jóvenes desde su potencial, no desde sus carencias.',
  'The goal is not just to gain followers':'El objetivo no es solamente ganar seguidores','The initial strategy aims to help the community understand who Asc3nd is, trust the organization, and know how to participate.':'La estrategia inicial busca que la comunidad entienda quién es ASC3ND, confíe en la organización y sepa cómo participar.','Next steps':'Próximos pasos','Validate initial channels.':'Validar los canales iniciales.','Define the visual tone.':'Definir el tono visual.','Create the first-month calendar.':'Crear el calendario del primer mes.','Prepare templates.':'Preparar plantillas.','Gather visual material.':'Reunir material visual.','Launch profiles.':'Lanzar los perfiles.','Final message':'Mensaje final',
  'Asc3nd should enter social media as an organization with clear purpose, a human voice, and a trustworthy presence. The community should feel that it is seeing the beginning of something serious, necessary, and capable of growing.':'ASC3ND debe entrar a las redes sociales como una organización con un propósito claro, una voz humana y una presencia confiable. La comunidad debe sentir que está presenciando el inicio de algo serio, necesario y con capacidad de crecer.',
  'Visual and tone reference: Asc3nd Collective’s official Spanish website, reviewed to maintain brand consistency.':'Referencia visual y de tono: el sitio oficial en español de ASC3ND Collective, revisado para mantener la coherencia de marca.',
  'Organization Basics':'Datos básicos de la organización','Mission & Impact':'Misión e impacto','Audience & Community':'Audiencia y comunidad','Brand Voice':'Voz de marca','Story Bank':'Banco de historias','Engagement Playbook':'Guía de interacción','Risk & Consent':'Riesgo y consentimiento',
  'Who are the main people you serve?':'¿Quiénes son las principales personas a las que sirven?','Who are the main people you need to reach?':'¿A quiénes necesitan llegar principalmente?','Who are your supporters, donors, sponsors, volunteers, or partners?':'¿Quiénes son sus seguidores, donantes, patrocinadores, voluntarios o aliados?','What does each audience care about?':'¿Qué le importa a cada audiencia?','What objections or doubts might they have?':'¿Qué objeciones o dudas podrían tener?','What language do they use to describe the problem?':'¿Qué lenguaje utilizan para describir el problema?','5 local organizations or leaders who already have community trust':'Cinco organizaciones o líderes locales que ya cuentan con la confianza de la comunidad',
  'Words your organization should use often':'Palabras que su organización debe usar con frecuencia','Words your organization should avoid':'Palabras que su organización debe evitar','Should the tone feel more like a…':'El tono debe sentirse más como el de un…','What should every caption sound like?':'¿Cómo debe sonar cada texto de publicación?','What should your organization never sound like?':'¿Cómo nunca debe sonar su organización?','Do you need bilingual content?':'¿Necesitan contenido bilingüe?','If yes, which languages or dialects?':'En caso afirmativo, ¿qué idiomas o dialectos?',
  'Mentor':'Mentor','Organizer':'Organizador','Teacher':'Educador','Advocate':'Defensor','Coach':'Orientador','Trusted neighbor':'Vecino de confianza',
  'What is the origin story?':'¿Cuál es la historia de origen?','Who founded it, and why?':'¿Quién fundó la organización y por qué?','What moment made the work urgent?':'¿Qué momento hizo que este trabajo se volviera urgente?','A small win you can tell publicly':'Una pequeña victoria que pueden contar públicamente','What behind-the-scenes work can people safely see?':'¿Qué trabajo detrás de cámaras puede mostrarse de forma segura?','What stories require consent before posting?':'¿Qué historias requieren consentimiento antes de publicarse?','What stories should never be posted?':'¿Qué historias nunca deben publicarse?','What faces, places, symbols, colors, or objects belong in the visual identity?':'¿Qué rostros, lugares, símbolos, colores u objetos forman parte de la identidad visual?',
  'What comments should you always respond to?':'¿A qué comentarios deben responder siempre?','What topics are sensitive?':'¿Qué temas son sensibles?','What is the response tone?':'¿Cuál debe ser el tono de respuesta?','What is the DM response policy?':'¿Cuál es la política para responder mensajes directos?','How quickly can the organization respond?':'¿Con qué rapidez puede responder la organización?','Who handles criticism?':'¿Quién gestiona las críticas?','What safety boundaries matter?':'¿Qué límites de seguridad son importantes?',
  'Are minors involved in your content?':'¿Aparecen menores en su contenido?','Are vulnerable people involved?':'¿Participan personas en situación de vulnerabilidad?','What consent is required before posting?':'¿Qué consentimiento se requiere antes de publicar?','What images should not be posted?':'¿Qué imágenes no deben publicarse?','What topics require board or leadership approval?':'¿Qué temas requieren aprobación de la junta o del liderazgo?','What claims must be verified before posting?':'¿Qué afirmaciones deben verificarse antes de publicar?','What donation claims must be documented?':'¿Qué afirmaciones sobre donaciones deben documentarse?',
  'Mission and belief':'Misión y convicciones','Founder story':'Historia de la fundación','Community education':'Educación comunitaria','Behind the scenes':'Detrás de cámaras','Program updates':'Novedades de programas','Volunteer recruitment':'Captación de voluntariado','Donor trust':'Confianza de donantes','Partner spotlight':'Presentación de aliados','Youth/community voice':'Voz de jóvenes y comunidad','Event promotion':'Promoción de eventos','Myth vs fact':'Mito frente a realidad','Local culture and community':'Cultura local y comunidad','Resources and opportunities':'Recursos y oportunidades','Celebration and gratitude':'Celebración y agradecimiento','Fundraising transparency':'Transparencia en la recaudación','Merch or campaign products':'Productos o artículos de campaña','Advocacy and awareness':'Incidencia y sensibilización',
  'Content Pillars':'Pilares de contenido','Choose 4–6 pillars. Consistency across a few pillars beats scattering across many.':'Elijan entre 4 y 6 pilares. La constancia en pocos pilares funciona mejor que dispersarse en demasiados.','Why do these pillars matter for this audience right now?':'¿Por qué estos pilares son importantes para esta audiencia en este momento?',
  'Platform Strategy':'Estrategia de plataformas','Focus only on the channels that support trust, community, partnerships, and owned audience growth.':'Enfóquense únicamente en los canales que fortalecen la confianza, la comunidad, las alianzas y el crecimiento de una audiencia propia.','Email newsletter':'Boletín por correo electrónico','Website/blog':'Sitio web/blog','Landing Page':'Página de aterrizaje',
  'Visual trust, Reels, carousels, Stories, community proof.':'Confianza visual, Reels, carruseles, Historias y evidencia comunitaria.','Local community, parents, older supporters, events, donation updates.':'Comunidad local, madres y padres, seguidores de mayor edad, eventos y novedades sobre donaciones.','Sponsors, partners, grant readiness, board/advisor trust.':'Patrocinadores, aliados, preparación para subvenciones y confianza de la junta y asesores.','Owned audience, donor updates, volunteer reminders, deeper trust. Not the first focus, but always collect emails. It is free to do and helps build a list for the future.':'Audiencia propia, novedades para donantes, recordatorios para voluntariado y una confianza más profunda. No es el primer enfoque, pero siempre conviene recopilar correos electrónicos. Es gratuito y ayuda a construir una lista para el futuro.','Permanent home for stories, program pages, impact proof, and search visibility.':'Espacio permanente para historias, páginas de programas, evidencia de impacto y visibilidad en buscadores.','Landing page for your first event — already in process as discussed.':'Página de aterrizaje para su primer evento; ya está en proceso, como se conversó.',
  'Which 2 platforms can you consistently manage for the next 90 days?':'¿Qué dos plataformas pueden gestionar de manera constante durante los próximos 90 días?','Which platform matters most for donors or partners?':'¿Qué plataforma es más importante para donantes o aliados?','Which platform matters most for the community you serve?':'¿Qué plataforma es más importante para la comunidad a la que sirven?',
  'Make the organization understandable and credible.':'Hacer que la organización sea comprensible y creíble.','Profile setup, clear bio, brand consistency, founder intro, first story posts, initial content pillars.':'Configurar perfiles, redactar una biografía clara, mantener coherencia de marca, presentar a la fundación, publicar las primeras historias y establecer los pilares iniciales.','12–16 posts · 4 Reels · 4 carousels · first donor/volunteer CTA':'12–16 publicaciones · 4 Reels · 4 carruseles · primer llamado a donantes o voluntariado',
  'Build posting rhythm and audience participation.':'Construir un ritmo de publicación y participación de la audiencia.','Weekly rhythm, community comments, volunteer stories, educational posts, partner tagging.':'Ritmo semanal, comentarios de la comunidad, historias de voluntariado, publicaciones educativas y etiquetas a aliados.','16–20 posts · 6 short videos · 4 carousels · 2 direct asks':'16–20 publicaciones · 6 videos cortos · 4 carruseles · 2 llamados directos',
  'Turn attention into support, donations, and partnerships.':'Convertir la atención en apoyo, donaciones y alianzas.','Stronger CTAs, campaign theme, impact transparency, 90-day recap.':'Llamados a la acción más claros, tema de campaña, transparencia de impacto y resumen de 90 días.','18–24 posts · 8 short videos · 3 donor posts · 1 impact recap':'18–24 publicaciones · 8 videos cortos · 3 publicaciones para donantes · 1 resumen de impacto',
  '2 posts/week · 1 video/week · 2 story sets/week':'2 publicaciones por semana · 1 video por semana · 2 series de Historias por semana','3 posts/week · 2 videos/week · 3–5 story sets/week':'3 publicaciones por semana · 2 videos por semana · 3–5 series de Historias por semana','4–5 posts/week · 3 videos/week · daily stories':'4–5 publicaciones por semana · 3 videos por semana · Historias diarias',
  'We start small with the light option until we gain traction. This takes time. Focus on organic followers and the people you already know. Do not worry so much about paid ads, going viral, or different algorithms. Real stories, real people, real impact.':'Comenzamos poco a poco con la opción ligera hasta ganar tracción. Esto requiere tiempo. Enfóquense en seguidores orgánicos y en las personas que ya conocen. No se preocupen demasiado por anuncios pagados, volverse virales o los distintos algoritmos. Historias reales, personas reales, impacto real.',
  'Saving to cloud…':'Guardando en la nube…','Saved to cloud':'Guardado en la nube','Saved locally — cloud unavailable':'Guardado localmente; la nube no está disponible','Submitted and saved to cloud':'Enviado y guardado en la nube','Saved locally. Cloud save failed.':'Guardado localmente. No se pudo guardar en la nube.','Submit':'Enviar','Not saved':'Sin guardar','Saved':'Guardado',
  'Exported':'Exportado','Workbook loaded':'Cuaderno cargado','Invalid JSON':'Archivo JSON no válido','Share this workbook':'Compartir este cuaderno','Anyone with this link can open the workbook in its current state. A snapshot is embedded in this URL. The live workbook also saves to the ASC3ND cloud database.':'Cualquier persona con este enlace puede abrir el cuaderno en su estado actual. La URL incluye una copia del contenido y el cuaderno activo también se guarda en la base de datos de ASC3ND.','Snapshot encoded':'Copia incluida en el enlace','Copy link':'Copiar enlace','Close':'Cerrar','Link copied!':'Enlace copiado','Copy:':'Copiar:','Copy':'Copiar',  'Share workbook':'Compartir cuaderno','Print / PDF':'Imprimir / PDF','Current step':'Paso actual','Contents':'Contenido','Import':'Importar','Export JSON':'Exportar JSON',
  'Chapter 2 — THE EVENT': 'Capítulo 2 — EL EVENTO',
  'Stage 1 — Founder Interview': 'Etapa 1 — Entrevista con fundadores',
  'Stage 2 — Event Readiness': 'Etapa 2 — Preparación para el evento',
  'Stage 3 — Event Day': 'Etapa 3 — Día del evento',
  'Stage 4 — See What Happened': 'Etapa 4 — Qué pasó',
  'Stage 5 — Build On It': 'Etapa 5 — Seguir construyendo',
  'THE EVENT': 'EL EVENTO',
  'From Plan to First Public Activation': 'Del plan al primer evento público',
  'Founder Interview': 'Entrevista con fundadores',
  'July 24, 2026 at 6:00 PM — Founder Residence (Address shared privately). Use responses to build the campaign\'s story spine.': '24 de julio de 2026 a las 6:00 p.m. — Residencia del fundador (dirección compartida en privado). Usar respuestas para armar la historia de la campaña.',
  'Camera Operator Production Brief': 'Resumen de producción para el operador de cámara',
  'Printable shot list, technical rules, and privacy controls for the camera operator.': 'Lista imprimible de tomas, reglas técnicas y controles de privacidad para el operador de cámara.',
  'Open Camera Brief': 'Abrir resumen de cámara',
  'Otha — Individual Interview Questions': 'Otha — Preguntas para entrevista individual',
  'What was happening before Asc3nd existed?': '¿Qué estaba pasando antes de que existiera Asc3nd?',
  'What was he seeing in young people/community?': '¿Qué veía él en los jóvenes y la comunidad?',
  'Where does his belief in mentorship come from?': '¿De dónde viene su convicción sobre la mentoría?',
  'Who believed in him—or who did he wish had?': '¿Quién creyó en él o quién le hubiera gustado que creyera?',
  'When did concern become a decision to build something?': '¿Cuándo se transformó la preocupación en la decisión de construir algo?',
  'What do adults misunderstand about young people?': '¿Qué no entienden los adultos sobre los jóvenes?',
  'What should a young person feel through Asc3nd?': '¿Qué debería sentir un joven a través de Asc3nd?',
  'What would success look like ten years from now?': '¿Cómo sería el éxito dentro de diez años?',
  'Elisha — Individual Interview Questions': 'Elisha — Preguntas para entrevista individual',
  'What made this personal for her?': '¿Qué hizo que esto fuera personal para ella?',
  'What did she see missing for young people?': '¿Qué veía ella que faltaba para los jóvenes?',
  'What does "someone believing in you" mean to her?': '¿Qué significa para ella que "alguien crea en ti"?',
  'What happens when a young person experiences genuine support?': '¿Qué sucede cuando un joven experimenta apoyo genuino?',
  'What can Asc3nd provide beyond a program?': '¿Qué puede ofrecer Asc3nd más allá de un programa?',
  'What should parents understand?': '¿Qué deberían entender las madres y padres?',
  'What is difficult about this work?': '¿Qué es lo difícil de este trabajo?',
  'What would make the work worth it long-term?': '¿Qué haría que el trabajo valiera la pena a largo plazo?',
  'Founders Joint Conversation Questions': 'Preguntas para conversación conjunta de los fundadores',
  'How did the two of you decide to actually create Asc3nd?': '¿Cómo decidieron realmente crear Asc3nd entre ambos?',
  'What could Asc3nd never become?': '¿Qué no podría convertirse jamás Asc3nd?',
  'How do your strengths differ?': '¿En qué se diferencian sus fortalezas?',
  'What keeps you going?': '¿Qué los mantiene en marcha?',
  'Direct-Camera Pickups': 'Tomas directas a cámara',
  'Event Day Operations Dashboard': 'Panel de operaciones del día del evento',
  'Low-stress operational check-in surface for August 30, 2026. Designed for offline use or quick mobile check-in.': 'Superficie de registro operativa sin estrés para el 30 de agosto de 2026. Diseñada para uso sin conexión o registro rápido desde móvil.',
  'Checked In Families': 'Familias registradas',
  'Haircuts Completed': 'Cortes de cabello completados',
  'Target capacity': 'Capacidad objetivo',
  'Backpacks Distributed': 'Mochilas distribuidas',
  'Total supply': 'Suministro total',
  'Operational incident or feedback notes': 'Incidentes operativos o notas de comentarios',
  'Post-Event Strategy & Metrics': 'Estrategia y métricas posteriores al evento',
  'Record factual outcomes to evaluate impact and draft partner progress briefs.': 'Registrar resultados reales para evaluar el impacto y redactar resúmenes para aliados.',
  'Factual Metrics': 'Métricas reales',
  'Total Families Attended': 'Total de familias asistentes',
  'Walk-in Families': 'Familias sin cita previa',
  'Supply Kits / Materials Leftover': 'Materiales o mochilas sobrantes',
  'Evidence & Approval': 'Evidencias y aprobación',
  'Testimonial notes or quotes': 'Notas de testimonios o citas',
  'Media approved for social campaign': 'Material aprobado para campaña en redes',
  'Video consent files collected & archived': 'Documentos de consentimiento de video reunidos y archivados',
  'Retrospective Learnings': 'Aprendizajes retrospectivos',
  'Evaluate structural learnings to scale future community operations.': 'Evaluar aprendizajes estructurales para escalar futuras operaciones comunitarias.',
  'What worked well operationally?': '¿Qué funcionó bien a nivel operativo?',
  'What surprised us or broke?': '¿Qué nos sorprendió o falló?',
  'Where did we experience queues or bottlenecks?': '¿Dónde tuvimos colas o cuellos de botella?',
  'What did families ask for most?': '¿Qué fue lo que más pidieron las familias?',
  'Key strategy changes for the next activation': 'Cambios clave en la estrategia para el próximo evento'
};

function applyEdits(source) {
  let html = source;

  html = html.replace('Introduce who they are, what they do, why they exist, and why their work matters.','Introduce who you are, what you do, why you exist, and why your work matters.');
  html = html.replace("<h4>'+t('Who we are')+'</h4>", "<h4>'+t('Who you are')+'</h4>");
  html = html.replace("<h4>'+t('Our programs')+'</h4>", "<h4>'+t('Your programs')+'</h4>");
  html = html.replace('Show people, voices, moments, and experiences that reflect the organization\\u2019s purpose.','Show people, voices, moments, and experiences that reflect your organization\\u2019s purpose.');
  html = html.replace('    {k:"trustedOrgs",label:"5 local organizations or leaders who already have community trust",type:"textarea"},\n    {k:"neverProp",label:"Who should never be treated like a marketing prop in your content?",type:"textarea"}\n','    {k:"trustedOrgs",label:"5 local organizations or leaders who already have community trust",type:"textarea"}\n');
  html = html.replace(',neverProp:""', '');
  html = html.replace(/var PLATFORM_OPTIONS=\[[^\n]+\];/,'var PLATFORM_OPTIONS=["Instagram","Facebook","LinkedIn","Email newsletter","Website/blog","Landing Page"];');

  html = html.replace('};\nfunction t(s){', '};\nObject.assign(ES,'+JSON.stringify(ES_EXTRA)+' );\nfunction t(s){');

  html = html.replace("'<h1>90-Day Social<br>Presence Builder</h1>'+", "'<h1>'+t('90-Day Social Presence Builder').replace(' de 90 días','<br> de 90 días').replace('90-Day Social','90-Day Social<br>')+'</h1>'+" );
  html = html.replace("'<p class=\"sub\">A guided workbook for building a consistent, trusted, and mission-driven social media presence — filled out together, saved automatically, and revisited as you grow.</p>'+", "'<p class=\"sub\">'+t('A guided workbook for building a consistent, trusted, and mission-driven social media presence — filled out together, saved automatically, and revisited as you grow.')+'</p>'+" );

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
  var roleHTML=Object.keys(roles).map(function(k){return'<div style="margin-bottom:10px;"><span class="k">'+t(k)+'</span> — '+t(roles[k])+'</div>';}).join('');
  return'<h3 class="section-title">'+t('Platform Strategy')+'</h3><p class="consultant-note">'+t('Focus only on the channels that support trust, community, partnerships, and owned audience growth.')+'</p><div class="chips" style="margin-bottom:14px;">'+chips+'</div><div class="refcard">'+roleHTML+'</div><div class="field"><label>'+t('Which 2 platforms can you consistently manage for the next 90 days?')+'</label><input type="text" data-sec="platforms" data-k="which2" value="'+esc(state.platforms.which2)+'"></div><div class="field"><label>'+t('Which platform matters most for donors or partners?')+'</label><input type="text" data-sec="platforms" data-k="donorPlatform" value="'+esc(state.platforms.donorPlatform)+'"></div><div class="field"><label>'+t('Which platform matters most for the community you serve?')+'</label><input type="text" data-sec="platforms" data-k="communityPlatform" value="'+esc(state.platforms.communityPlatform)+'"></div>';
}`;
  html = html.replace(/function rPlatforms\(\)\{[\s\S]*?\n\}/, platformFunction);

  html = html.replace("return'<h3 class=\"section-title\">Content Pillars</h3><p class=\"consultant-note\">Choose 4–6 pillars. Consistency across a few pillars beats scattering across many.</p>", "return'<h3 class=\"section-title\">'+t('Content Pillars')+'</h3><p class=\"consultant-note\">'+t('Choose 4–6 pillars. Consistency across a few pillars beats scattering across many.')+'</p>");
  html = html.replace('<div class="field"><label>Why do these pillars matter for this audience right now?</label>', '<div class="field"><label>'+"'+t('Why do these pillars matter for this audience right now?')+'"+'</label>');
  html = html.replace('defaultItems.map(function(t){return{text:t,done:false};})','defaultItems.map(function(item){return{text:t(item),done:false};})');
  html = html.replace('Pick the cadence your team can actually maintain, not the one that sounds impressive.','We start small with the light option until we gain traction. This takes time. Focus on organic followers and the people you already know. Do not worry so much about paid ads, going viral, or different algorithms. Real stories, real people, real impact.');

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
async function saveToCloud(showToast){if(cloudSaving)return false;cloudSaving=true;saveLocal();var el=document.getElementById('save-msg');if(el)el.textContent=t('Saving to cloud…');try{var res=await fetch(SUPABASE_RPC+'save_submission',{method:'POST',headers:cloudHeaders(),body:JSON.stringify({p_project_id:PROJECT_ID,p_device_id:getDeviceId(),p_payload:{workbook:state,saved_at:new Date().toISOString()}})});if(!res.ok)throw new Error('Cloud save failed: '+res.status);if(el)el.textContent=t('Saved to cloud');if(showToast)toast(t('Submitted and saved to cloud'));return true;}catch(err){console.error(err);if(el)el.textContent=t('Saved locally — cloud unavailable');if(showToast)toast(t('Saved locally. Cloud save failed.'));return false;}finally{cloudSaving=false;}}
async function loadFromCloud(){try{var res=await fetch(SUPABASE_RPC+'load_submission',{method:'POST',headers:cloudHeaders(),body:JSON.stringify({p_device_id:getDeviceId()})});if(!res.ok)return;var data=await res.json();var row=Array.isArray(data)?data[0]:data;var payload=row&&row.payload;if(payload&&payload.workbook){state=Object.assign(blank(),payload.workbook);saveLocal();if(started)renderStep();}}catch(err){console.warn('Cloud load unavailable',err);}}
function loadLocal(){var hash=window.location.hash;if(hash&&hash.startsWith('#state=')){try{var d=JSON.parse(decodeURIComponent(atob(hash.slice(7))));state=Object.assign(blank(),d);window.location.hash='';return;}catch(e){}}try{var saved=localStorage.getItem(STORAGE_KEY);if(saved)state=Object.assign(blank(),JSON.parse(saved));}catch(e){}}
function updateSaveMsg(){var el=document.getElementById('save-msg');if(!el)return;if(!state.lastSaved){el.textContent=t('Not saved');return;}var d=new Date(state.lastSaved);el.textContent=t('Saved')+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
`;
  html = html.replace(/\/\* ══ PERSISTENCE [\s\S]*?function updateSaveMsg\(\)[\s\S]*?\n/, persistence);

  html = html.replace("toast('Exported')", "toast(t('Exported'))");
  html = html.replace("toast('Workbook loaded')", "toast(t('Workbook loaded'))");
  html = html.replace("alert('Invalid JSON')", "alert(t('Invalid JSON'))");
  html = html.replace("mo.innerHTML='<h3>Share this workbook</h3><p>Anyone with this link can open the workbook in its current state. A snapshot is embedded in this URL. The live workbook also saves to the ASC3ND cloud database.</p><div class=\"modal-slug\" style=\"word-break:break-all;font-size:13px;background:var(--card3);\">Snapshot encoded</div>", "mo.innerHTML='<h3>'+t('Share this workbook')+'</h3><p>'+t('Anyone with this link can open the workbook in its current state. A snapshot is embedded in this URL. The live workbook also saves to the ASC3ND cloud database.')+'</p><div class=\"modal-slug\" style=\"word-break:break-all;font-size:13px;background:var(--card3);\">'+t('Snapshot encoded')+'</div>");
  html = html.replace('<button class="cta-btn" id="mcb">Copy link</button><button class="tbtn" id="mcl">Close</button>', '<button class="cta-btn" id="mcb">'+"'+t('Copy link')+'"+'</button><button class="tbtn" id="mcl">'+"'+t('Close')+'"+'</button>');
  html = html.replace("toast('Link copied!')", "toast(t('Link copied!'))");
  html = html.replace("prompt('Copy:',url)", "prompt(t('Copy:'),url)");

  const staticLanguage = `function syncStaticLanguage(){
  var q=function(s){return document.querySelector(s);};
  var el=q('.mh-sub');if(el)el.textContent=t('Contents');
  var buttons=document.querySelectorAll('.menu-foot-actions button');
  if(buttons[0])buttons[0].textContent=t('Import');if(buttons[1])buttons[1].textContent=t('Export JSON');if(buttons[2])buttons[2].textContent=t('Share');
  document.documentElement.lang=lang==='es'?'es':'en';
}
`;
  html = html.replace('function renderCover(){', staticLanguage+'function renderCover(){\n  syncStaticLanguage();');
  html = html.replace('function renderStep(){', 'function renderStep(){\n  syncStaticLanguage();');
  html = html.replace("lang=lang==='en'?'es':'en';renderCover();", "lang=lang==='en'?'es':'en';syncStaticLanguage();renderCover();");
  html = html.replace("lang=lang==='en'?'es':'en';renderStep();", "lang=lang==='en'?'es':'en';syncStaticLanguage();renderStep();");

  html = html.replace('Data is embedded in the URL — no server storage needed. Recipients can edit, save locally, and share a new link.','A snapshot is embedded in this URL. The live workbook also saves to the ASC3ND cloud database.');
  const shareButton = `      '<button class="ebtn" onclick="openShareModal()">Share workbook <svg class="svg-icon sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></button>'+\n`;
  html = html.replace(shareButton, `      '<button class="ebtn" onclick="openShareModal()">'+t('Share workbook')+' <svg class="svg-icon sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></button>'+\n      '<button class="ebtn p" id="s-submit">'+t('Submit')+'</button>'+\n`);
  html = html.replace("var cp=document.getElementById('s-copy');var pr=document.getElementById('s-print');var ar=document.getElementById('s-area');", "var cp=document.getElementById('s-copy');var pr=document.getElementById('s-print');var sub=document.getElementById('s-submit');var ar=document.getElementById('s-area');");
  html = html.replace("if(pr)pr.addEventListener('click',function(){window.print();});", "if(pr)pr.addEventListener('click',function(){window.print();});\n  if(sub)sub.addEventListener('click',function(){saveToCloud(true);});");
  html = html.replace("(isLast?t('View final plan'):t('Next'))", "(isLast?t('Submit'):t('Next'))");
  html = html.replace("if(nb)nb.addEventListener('click',function(){if(stepIndex<STEPS.length-1){playPageTurn();stepIndex++;renderStep();}else renderStep();});", "if(nb)nb.addEventListener('click',function(){if(stepIndex<STEPS.length-1){playPageTurn();stepIndex++;renderStep();}else saveToCloud(true);});");
  html = html.replace('loadLocal();\ninitMenu();\nrenderCover();','loadLocal();\ninitMenu();\nrenderCover();\nloadFromCloud();\nsetInterval(function(){saveToCloud(false);},10000);');

  const offerStart = html.indexOf('<!-- ── OFFER DIVIDER ── -->');
  const footerStart = html.indexOf('<!-- FOOTER -->');
  if (offerStart >= 0 && footerStart > offerStart) html = html.slice(0, offerStart) + html.slice(footerStart);
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