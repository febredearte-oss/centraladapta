const ROUTE_PREFIX = "/pautaoficialdiretoria+";
const ARCHIVE_PATH = "/arquivopautasdiretoria";

const RECIPIENTS = {
  tonio: { id: "tonio", label: "Tonio" },
  oton: { id: "oton", label: "Oton" },
  isabela: { id: "isabela", label: "Isabela Luiza" },
  gabriela: { id: "gabriela", label: "Gabriela Dias" },
};

const REPORT_2708_PT = [
  ["Conclusão central", "A gravação sustenta comunicação informal e fragmentada, não ausência absoluta de comunicação. Oton afirma que sabia das mudanças, mas que não compreendia facilmente o quadro completo."],
  ["1. Objetivo, método e limites", "Registro formal, verificável e neutro da reunião de 27 de agosto de 2026 sobre a Febre de Arte 2026. A síntese foi elaborada a partir da gravação original e de transcrição automática, com organização, comparação e classificação assistidas por IA. Em caso de divergência, prevalece a gravação original. O relatório separa fatos verificáveis, declarações individuais, avaliações subjetivas, pontos controvertidos, acordos e encaminhamentos, sem determinar intenção, culpa, boa-fé ou má-fé."],
  ["2. Contexto imediato", "Antes da gravação, Isabela apresentou uma linha do tempo sobre mudanças de datas, escopo, modelo econômico, situação contratual com o Dragão do Mar e captação. A discussão gravada tomou como referência a descoberta, em 31/07, da sobreposição com a Auê e a confirmação da colaboração em 03/08, deslocando a controvérsia para a qualidade e a tempestividade da comunicação."],
  ["3. Posição apresentada por Tonio", "Tonio afirmou que a equipe responsável pela execução também deveria comunicar alterações relevantes aos demais tomadores de decisão. Segundo sua percepção, a mudança para um formato menor, integrado à Auê e sem bilheteria não teria sido adequadamente reportada. Também questionou se cancelamento ou adiamento haviam sido considerados e registrou avaliações críticas sobre a produção, tratadas no relatório como avaliações pessoais, não como fatos consensuais."],
  ["4. Posição inicial de Oton", "Oton afirmou que a apresentação anterior havia sido esclarecedora e concentrou sua primeira preocupação no contrato com o Dragão do Mar. Perguntou sobre risco de o aditivo não ser concluído a tempo. Isabela exibiu mensagem de Fabrício informando inexistência de pendências documentais e expectativa de encaminhamento do contrato para assinatura."],
  ["5. Controvérsia central: comunicação das mudanças", "Isabela contestou que as mudanças tivessem sido ocultadas e perguntou diretamente a Oton se ele concordava que havia permanecido no escuro. Oton respondeu que não concordava, declarou que sabia da situação, mas acrescentou que precisou perguntar e que faltaram informações para compreender facilmente o quadro completo."],
  ["6. Confirmação de comunicação informal", "Isabela afirmou que havia compartilhado mudanças em conversas informais. Oton respondeu expressamente que determinadas informações haviam sido compartilhadas com ele. O trecho não demonstra comunicação completa de todos os detalhes, mas afasta ausência absoluta de comunicação sobre a situação da Auê e mudanças associadas."],
  ["7. Posição de Tonio sobre sua própria informação", "Tonio afirmou que, na percepção dele, passou aproximadamente três semanas sem conhecer adequadamente o andamento do trabalho e reiterou que caberia à produção melhorar a comunicação. A gravação não permite reconstruir integralmente todas as conversas externas à reunião."],
  ["8. Distinção analítica extraída da reunião", "O conteúdo gravado distingue ausência total de comunicação de comunicação informal, fragmentada ou insuficientemente consolidada. Não ficou estabelecido que nenhuma informação tenha sido comunicada; ficou demonstrado que não existia processo formal, periódico e documentado capaz de garantir visão consolidada das mudanças operacionais, financeiras e contratuais."],
  ["9. Reconhecimento de falhas de governança", "Isabela reconheceu sua parcela de responsabilidade por não estruturar reuniões formais periódicas específicas da Febre e registrou que a comunicação ocorria no cotidiano sem atas, calendário fixo de reporte ou consolidação escrita recorrente. Ao mesmo tempo, rejeitou associar a falha de formalização a ocultação deliberada ou desonestidade."],
  ["10. Documentação e gravação das reuniões", "Isabela propôs que futuras reuniões fossem gravadas, acompanhadas de atas e registros formais, e que decisões passassem a ser documentadas. Tonio respondeu favoravelmente. Ficou registrado consenso sobre substituir a informalidade por mecanismos formais de governança e rastreabilidade."],
  ["11. Participação de Oton no projeto", "Oton relatou sentir participação insuficiente na condução da Febre e afirmou que gostaria de fazer mais perguntas, apresentar opiniões e compreender melhor as decisões. Para o futuro, expressou preferência por uma definição clara sobre sua inserção efetiva no processo."],
  ["12. Cancelamento do evento", "Tonio questionou se o cancelamento ou adiamento havia sido considerado. Isabela declarou que havia considerado o cancelamento diversas vezes, embora essa possibilidade não tivesse sido apresentada a Tonio como proposta formal durante o processo."],
  ["13. Autocrítica, humildade e avaliações pessoais", "Tonio afirmou não ter percebido demonstração suficiente de humildade ou autocrítica por parte da produção. Isabela contestou essa avaliação e reconheceu explicitamente falhas de governança e de convocação de reuniões formais. As expressões permanecem registradas como avaliações subjetivas, não como conclusões factuais."],
  ["14. Referências à edição anterior", "Tonio relacionou problemas percebidos em 2026 a dificuldades da edição anterior. Isabela contestou o uso automático de acontecimentos anteriores como prova de conduta no projeto atual. A reunião não realizou auditoria documental ou financeira de 2025."],
  ["15. Situação financeira discutida", "Isabela reiterou que os R$ 11.000 inicialmente previstos pela BTO não haviam sido utilizados nem transferidos. Também foram mencionados aproximadamente R$ 30.000 como expectativa anterior de receita de ingressos e R$ 50.000 como exemplo hipotético de exposição financeira. O novo contrato do Dragão do Mar foi posteriormente esclarecido como aproximadamente R$ 3.500."],
  ["16. Retirada financeira da BTO", "Tonio informou que a BTO não participaria financeiramente do novo modelo da Febre, encerrando a previsão de uso dos R$ 11.000 originalmente associados à participação da BTO. Informou ainda que a produção poderia contar com R$ 15.000 da Adapta, sujeitos à formalização própria."],
  ["17. CNPJ da BTO no contrato do Dragão do Mar", "Após comunicar a saída financeira da BTO, Tonio perguntou se seria possível retirar completamente seu CNPJ do contrato. Isabela respondeu que outra forma de contratação seria tecnicamente possível, mas poderia exigir novo processamento documental, adicionar aproximadamente 15 dias e prejudicar a realização do evento."],
  ["18. Reavaliação do risco contratual", "Oton esclareceu que o novo contrato do Dragão do Mar era de aproximadamente R$ 3.500. Após esse esclarecimento, Tonio indicou que o valor não representava o risco financeiro amplo que havia motivado sua preocupação inicial."],
  ["19. Participação financeira da Adapta — R$ 15.000", "Tonio informou que a produção poderia contar com R$ 15.000 da Adapta. Isabela esclareceu que eventual utilização seria formalizada através de contrato de patrocínio com valor, finalidade, responsabilidades, contrapartidas, entregas, condições e obrigações previamente definidas."],
  ["20. Clima organizacional da reunião", "A reunião teve momentos de elevada tensão, interrupções e linguagem forte. Foram misturados temas de governança, críticas profissionais, experiências anteriores, confiança, sentimentos de exclusão e percepções de desrespeito. O relatório não atribui valor moral a essas manifestações."],
  ["21. Fatos que a gravação permite estabelecer", "Houve divergência grave sobre a qualidade da comunicação; Oton rejeitou a formulação de que permaneceu completamente no escuro e confirmou conhecimento de informações relevantes; a gravação sustenta comunicação informal e fragmentada sem mecanismo adequado de consolidação; a ausência de reuniões formais, atas e reportes periódicos foi reconhecida como problema; a BTO foi retirada financeiramente do novo modelo; o aporte de R$ 15.000 da Adapta foi condicionado à formalização; não houve decisão final gravada pelo cancelamento da Febre."],
  ["22. Pontos que não podem ser tratados como fatos apenas com base na reunião", "Sem evidências adicionais, não podem ser convertidas em conclusões objetivas: intenção de esconder informações, desonestidade, certeza de demissão em outra empresa, ausência absoluta de autocrítica ou humildade, reprodução integral de problemas de 2025, existência de dívida de R$ 50.000, receita garantida de R$ 30.000 em ingressos ou afirmação de que nenhum diretor recebeu informação alguma."],
  ["23. Encaminhamentos e regras de governança", "Reuniões materiais deverão ser gravadas; cada reunião deverá gerar ata ou relatório formal para ciência; alterações relevantes deverão ser comunicadas por escrito; decisões financeiras deverão identificar entidade responsável, valor, finalidade, condições e contrapartidas; aprovações relevantes deverão possuir manifestação formal e, quando aplicável, assinatura; a participação financeira da BTO no novo modelo deve ser considerada encerrada; os R$ 15.000 da Adapta deverão ser formalizados por contrato de patrocínio; a situação perante o Dragão do Mar deverá ser atualizada após o aditivo; divergências futuras deverão ser verificadas prioritariamente pelas gravações e registros formais."],
  ["24. Conclusão neutra", "A gravação demonstra falha relevante de governança e formalização da comunicação. Não havia rotina estruturada de reuniões, atas, reportes periódicos ou confirmação escrita das principais alterações. Ao mesmo tempo, a gravação não sustenta narrativa de ausência total de comunicação. A formulação mais compatível é: houve comunicação informal sobre mudanças relevantes, porém sem governança, periodicidade e consolidação suficientes para garantir compreensão uniforme entre todos os envolvidos."],
  ["25. Preservação do registro", "Recomenda-se manter arquivados conjuntamente a gravação original integral, a transcrição, o relatório de nivelamento apresentado antes da gravação, este relatório, eventuais correções dos participantes e eventual versão final aprovada. Correções futuras devem ser feitas contra o áudio e registradas de forma rastreável."],
];

const REPORT_2708_EN = [
  ["Core finding", "The recording supports informal and fragmented communication, not a total absence of communication. Oton states that he knew about the changes, but did not easily understand the full picture."],
  ["1. Purpose, method and limitations", "A formal, verifiable and neutral record of the meeting held on 27 August 2026 regarding Febre de Arte 2026. The summary was prepared from the original recording and an automated transcript with AI-assisted organization, comparison and classification. If there is any discrepancy, the original recording prevails. The report separates verifiable facts, individual statements, subjective assessments, disputed points, agreements and action items without determining intent, fault, good faith or bad faith."],
  ["2. Immediate context", "Before recording began, Isabela presented an alignment timeline covering date changes, scope, business model, the contractual status with Dragao do Mar and sponsorship efforts. The recorded discussion then focused on the quality and timeliness of communication after the 31 July discovery of the overlap with Aue and the 3 August confirmation of the collaboration."],
  ["3. Position presented by Tonio", "Tonio stated that the team responsible for executing the event was also responsible for communicating material changes to other decision-makers. In his view, the move to a smaller model integrated with Aue and without ticketing had not been adequately reported. He also asked whether cancellation or postponement had been considered and made critical assessments of the production team, recorded as personal assessments rather than unanimously established facts."],
  ["4. Oton's initial position", "Oton stated that the earlier presentation had been clarifying and first focused on the contractual status with Dragao do Mar. He asked whether the amendment might not be completed in time. Isabela showed a recent message from Fabricio stating that there were no pending documentation issues and that the contract should be sent for signature."],
  ["5. Central dispute: communication of the changes", "Isabela expressly disputed the claim that the changes had been concealed and asked Oton whether he agreed that he had been kept in the dark. Oton said that he did not agree, stated that he knew about the situation, while adding that he had needed to ask questions and that information was missing from the full picture."],
  ["6. Confirmation of informal communication", "Isabela stated that she had shared changes through informal conversations. Oton expressly confirmed that certain information had been shared with him. This does not establish that every operational and financial detail was communicated completely, but it rules out a total absence of communication regarding the Aue situation and related changes."],
  ["7. Tonio's position regarding his own information", "Tonio stated that, in his perception, he went for approximately three weeks without adequately knowing what was happening with the project and reiterated that the production team had a duty to improve communication. The recording cannot reconstruct every conversation outside the meeting."],
  ["8. Analytical distinction arising from the meeting", "The recorded content distinguishes complete absence of communication from communication that existed but was informal, fragmented or insufficiently consolidated. It was not established that no information had been communicated; it was established that there was no formal, periodic and documented process ensuring a consolidated view of operational, financial and contractual changes."],
  ["9. Acknowledgement of governance failures", "Isabela acknowledged her share of responsibility for not establishing formal periodic meetings specifically for Febre and stated that information had been shared through day-to-day conversations without minutes, a fixed reporting schedule or recurring written consolidation. She rejected equating lack of formalization with deliberate concealment or dishonesty."],
  ["10. Documentation and recording of future meetings", "Isabela proposed that future meetings be recorded, accompanied by minutes and formal records, and that material decisions be documented. Tonio responded positively. There was therefore recorded agreement on replacing informal practices with formal governance and traceability mechanisms."],
  ["11. Oton's participation in the project", "Oton described feeling insufficiently involved in the management of Febre and stated that he wanted to ask more questions, provide opinions and better understand decisions. For the future, he expressed a preference for clarity about whether he would be effectively included in the process."],
  ["12. Cancellation of the event", "Tonio asked whether cancelling or postponing Febre had been considered. Isabela expressly stated that she had considered cancellation several times, although it had not been formally presented to Tonio as a proposal during the process."],
  ["13. Self-criticism, humility and personal assessments", "Tonio stated that he had not perceived sufficient humility or self-criticism from the production team. Isabela disputed that assessment and explicitly acknowledged shortcomings in governance and in calling formal meetings. These expressions remain subjective assessments rather than factual conclusions."],
  ["14. References to the previous edition", "Tonio connected perceived problems in 2026 to difficulties from the previous edition. Isabela disputed using prior events automatically as proof of conduct in the current project. The meeting did not conduct a documentary or financial audit of the 2025 edition."],
  ["15. Financial situation discussed", "Isabela reiterated that the BRL 11,000 originally contemplated from BTO had not been used or transferred. Approximately BRL 30,000 was mentioned as an earlier ticket-revenue expectation and BRL 50,000 as a hypothetical example of financial exposure. The revised Dragao do Mar contract was later clarified as approximately BRL 3,500."],
  ["16. BTO's financial withdrawal", "Tonio stated that BTO would no longer participate financially in the revised Febre de Arte model, ending the contemplated use of the BRL 11,000 associated with BTO. He also stated that the production could count on BRL 15,000 from Adapta, subject to formal documentation."],
  ["17. BTO CNPJ on the Dragao do Mar contract", "After stating that BTO would withdraw financially, Tonio asked whether its CNPJ could be removed completely from the contract. Isabela responded that another contracting arrangement could technically be pursued, but that doing so at that stage could require new processing, add approximately 15 days and jeopardize the event."],
  ["18. Reassessment of contractual risk", "Oton clarified that the revised Dragao do Mar contract was approximately BRL 3,500. Following that clarification, Tonio indicated that the amount was not material enough to represent the broad financial risk that had driven his initial concern."],
  ["19. Adapta financial participation — BRL 15,000", "Tonio stated that the production could count on BRL 15,000 from Adapta. Isabela clarified that any use of those funds would be formalized through a sponsorship agreement defining in advance the amount, purpose, responsibilities, consideration, deliverables, conditions and obligations."],
  ["20. Organizational climate of the meeting", "The meeting included periods of significant tension, interruptions and strong language. Governance matters, professional criticism, previous experiences, trust, feelings of exclusion and perceptions of disrespect were at times discussed together. The report assigns no moral judgment to those exchanges."],
  ["21. Facts the recording supports", "There was a serious disagreement regarding the quality of communication; Oton rejected the formulation that he had been completely kept in the dark and confirmed awareness of relevant information; the recording supports informal and fragmented communication without an adequate consolidation mechanism; the lack of formal meetings, minutes and periodic reporting was acknowledged as a problem; BTO withdrew financially from the revised model; the BRL 15,000 Adapta contribution was conditioned on formal documentation; no final recorded decision was made to cancel Febre."],
  ["22. Points that cannot be treated as facts based on this meeting alone", "Without additional evidence, the following cannot be converted into objective findings: intent to hide information, dishonesty, certainty that someone would be fired in another company, complete absence of self-criticism or humility, full repetition of 2025 problems, existence of a BRL 50,000 debt, guaranteed BRL 30,000 ticket revenue, or a claim that no director received any information at all."],
  ["23. Action items and governance rules", "Material project meetings should be recorded; each meeting should generate formal minutes or a report for circulation; material changes should be communicated in writing; financial decisions should identify the responsible entity, amount, purpose, conditions and consideration; material approvals should have formal confirmation and, where applicable, signatures; BTO's financial participation in the revised model should be treated as ended; Adapta's BRL 15,000 participation should be formalized through a dedicated sponsorship agreement; the Dragao do Mar status should be updated once the revised contract/amendment is received; future disputes should be checked primarily against recordings and formal records."],
  ["24. Neutral conclusion", "The recording demonstrates a material failure of governance and communication formalization. There was no structured routine of meetings, minutes, periodic reports or written confirmation of major changes. At the same time, the recording does not support a narrative of total absence of communication. The formulation most consistent with the record is that relevant changes were communicated informally, but without sufficient governance, cadence and consolidation to ensure uniform understanding among all parties."],
  ["25. Record preservation", "It is recommended that the full original recording, transcript, alignment report presented before recording, this report, any corrections submitted by participants and any final approved version be archived together. Future corrections should be checked against the audio and recorded in a traceable manner."],
];

const MEETINGS = {
  "27-08-2026": {
    title: { pt: "Febre de Arte 2026 — Registro formal e síntese da reunião", en: "Febre de Arte 2026 — Formal meeting record and summary" },
    subtitle: { pt: "Governança, comunicação, responsabilidades e encaminhamentos", en: "Governance, communication, responsibilities and action items" },
    source: "WhatsApp Audio 2026-08-27 at 18.49.33.mp4",
    sourceHash: "77123af92e2d744b2f4df81ad34aacc798b9fd9636bf76e2b4c595e071a783ff",
    body: { pt: REPORT_2708_PT, en: REPORT_2708_EN },
    recipients: RECIPIENTS,
  },
  "04-09-2026": {
    title: { pt: "Pauta Oficial da Diretoria", en: "Official Board Agenda" },
    subtitle: { pt: "Registro de ciência dos direcionamentos gerais", en: "Acknowledgement of general directions" },
    body: { pt: [], en: [] },
    recipients: RECIPIENTS,
  },
};

function html(body, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store, no-cache, must-revalidate", "x-robots-tag": "noindex, nofollow, noarchive", "referrer-policy": "no-referrer" } });
}
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" } }); }
function escapeHtml(value) { return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function formatDate(date, lang="pt") { const [d,m,y]=date.split("-"); return lang === "en" ? `${y}-${m}-${d}` : `${d}/${m}/${y}`; }
function language(url) { return url.searchParams.get("lang") === "en" ? "en" : "pt"; }
function withLang(path, lang) { return `${path}${path.includes("?") ? "&" : "?"}lang=${lang}`; }

function parseRoute(pathname) {
  if (!pathname.startsWith(ROUTE_PREFIX)) return null;
  const value = pathname.slice(ROUTE_PREFIX.length);
  const individual = value.match(/^(\d{2}-\d{2}-\d{4})\+([a-z0-9-]+)$/i);
  if (individual) return { date: individual[1], recipientSlug: individual[2].toLowerCase(), mode: "individual" };
  const archived = value.match(/^(\d{2}-\d{2}-\d{4})$/);
  if (archived) return { date: archived[1], recipientSlug: null, mode: "archive" };
  return null;
}

async function ensureSchema(env) {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS board_acknowledgements (
      meeting_date TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      recipient_label TEXT NOT NULL,
      acknowledged_at TEXT,
      protocol TEXT,
      PRIMARY KEY (meeting_date, recipient_id)
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_board_ack_meeting ON board_acknowledgements(meeting_date, acknowledged_at)`),
  ]);
  try { await env.DB.prepare("ALTER TABLE board_acknowledgements ADD COLUMN protocol TEXT").run(); } catch {}
}
function resolveRecipient(date, slug) { return MEETINGS[date]?.recipients?.[slug] || null; }
function meetingRecipients(date) { return Object.values(MEETINGS[date]?.recipients || {}); }
async function seedMeeting(env, date) {
  await ensureSchema(env);
  for (const r of meetingRecipients(date)) await env.DB.prepare(`INSERT OR IGNORE INTO board_acknowledgements (meeting_date,recipient_id,recipient_label,acknowledged_at,protocol) VALUES (?,?,?,NULL,NULL)`).bind(date,r.id,r.label).run();
}
async function getRecord(env,date,recipient){ await seedMeeting(env,date); return env.DB.prepare(`SELECT * FROM board_acknowledgements WHERE meeting_date=? AND recipient_id=?`).bind(date,recipient.id).first(); }
async function meetingStatus(env,date){
  await seedMeeting(env,date);
  const expected=meetingRecipients(date);
  const rows=await env.DB.prepare(`SELECT * FROM board_acknowledgements WHERE meeting_date=? ORDER BY recipient_label COLLATE NOCASE`).bind(date).all();
  const records=rows.results||[];
  return {records,complete:expected.length>0 && records.length>=expected.length && records.every(r=>Boolean(r.acknowledged_at))};
}
function protocolFor(date,recipientId){ const compact=date.split("-").join(""); const stamp=Date.now().toString(36).toUpperCase().slice(-5); return `ADP-DIR-${compact}-${recipientId.toUpperCase()}-${stamp}`; }

function baseStyles(){ return `
:root{color-scheme:light;--ink:#17231d;--muted:#66736c;--line:#dce3de;--paper:#f5f7f5;--card:#fff;--green:#163d2a;--green2:#24583e;--soft:#edf3ef;--gold:#826a2d}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--paper);color:var(--ink);font-family:Montserrat,Arial,sans-serif;padding:20px}main{width:min(920px,100%);margin:24px auto;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:clamp(24px,5vw,48px);box-shadow:0 14px 45px rgba(23,35,29,.07)}
.top{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--green2);margin:0 0 12px}h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(30px,6vw,46px);font-weight:400;line-height:1.06;margin:0 0 10px}h2{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:26px;margin:34px 0 12px}.date,.muted{font-size:14px;color:var(--muted)}.date{margin:0 0 28px}.lang{display:flex;gap:4px;border:1px solid var(--line);padding:4px;border-radius:999px;background:white}.lang a{padding:8px 11px;border-radius:999px;text-decoration:none;color:var(--muted);font-size:12px;font-weight:800}.lang a.active{background:var(--green);color:white}
.meta{border:1px solid var(--line);border-radius:15px;padding:16px 18px;margin:22px 0;background:var(--soft);font-size:13px;line-height:1.55}.document{border-top:1px solid var(--line);margin-top:26px;padding-top:10px}.section{padding:22px 0;border-bottom:1px solid var(--line)}.section h3{font-size:17px;margin:0 0 9px}.section p{font-size:15px;line-height:1.7;margin:0}.statement{border:1px solid var(--line);border-radius:16px;padding:20px;margin:28px 0;font-size:16px;line-height:1.6;background:#fff}
.signatures{display:grid;gap:10px;margin:18px 0 30px}.signature{display:flex;justify-content:space-between;gap:18px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:#fff}.seal{font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;border:1px solid var(--green2);color:var(--green2);border-radius:999px;padding:7px 10px;white-space:nowrap}.pending{border-color:#b9c2bc;color:var(--muted)}.protocol{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--muted);margin-top:5px}.stamp{display:inline-flex;align-items:center;gap:8px;border:2px solid var(--green2);color:var(--green2);padding:10px 14px;border-radius:12px;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;transform:rotate(-1deg)}
button,.button{display:block;width:100%;border:0;border-radius:14px;padding:18px 22px;font:700 15px Montserrat,Arial,sans-serif;letter-spacing:.025em;background:var(--green);color:white;cursor:pointer;text-decoration:none;text-align:center}button:hover,.button:hover{background:var(--green2)}button:disabled{opacity:.55}.fine{font-size:12px;line-height:1.5;color:var(--muted);text-align:center;margin:12px 0 0}.archive-list{display:grid;gap:12px;margin-top:24px}.archive-item{display:block;border:1px solid var(--line);border-radius:16px;padding:18px;text-decoration:none;color:inherit;background:#fff}.archive-item:hover{background:var(--soft)}.archive-meta{display:flex;justify-content:space-between;gap:14px;align-items:center}.empty{padding:30px 0;color:var(--muted)}#msg{min-height:20px;color:#8a2f2f;font-size:13px;text-align:center;margin-top:12px}@media(max-width:640px){.top{display:block}.lang{width:max-content;margin:0 0 24px}.signature,.archive-meta{align-items:flex-start;flex-direction:column}.seal{white-space:normal}}
`; }

function reportHtml(meeting,lang){
  const body=meeting.body?.[lang]||[];
  if(!body.length) return `<div class="section"><p>${lang==="en"?"No detailed record has been attached to this agenda yet.":"Ainda não há registro detalhado anexado a esta pauta."}</p></div>`;
  return body.map(([title,text])=>`<section class="section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></section>`).join("");
}
function signatureRows(records,lang){
  return records.map(r=>{ const signed=Boolean(r.acknowledged_at); let when=""; if(signed){try{when=new Intl.DateTimeFormat(lang==="en"?"en-GB":"pt-BR",{timeZone:"America/Fortaleza",dateStyle:"short",timeStyle:"short"}).format(new Date(r.acknowledged_at));}catch{}}
    return `<div class="signature"><div><strong>${escapeHtml(r.recipient_label)}</strong>${signed?`<div class="protocol">${escapeHtml(r.protocol||"")}${when?` · ${escapeHtml(when)}`:""}</div>`:`<div class="protocol">${lang==="en"?"Awaiting acknowledgement":"Aguardando visto"}</div>`}</div><span class="seal ${signed?"":"pending"}">${signed?(lang==="en"?"Electronic acknowledgement":"Visto eletrônico"):(lang==="en"?"Pending":"Pendente")}</span></div>`;
  }).join("");
}
function languageSwitch(path,lang){ return `<nav class="lang" aria-label="Language"><a class="${lang==="pt"?"active":""}" href="${withLang(path,"pt")}">PT</a><a class="${lang==="en"?"active":""}" href="${withLang(path,"en")}">EN</a></nav>`; }

async function documentPage(env,date,recipient,lang){
  const meeting=MEETINGS[date], status=await meetingStatus(env,date), own=status.records.find(r=>r.recipient_id===recipient.id), signed=Boolean(own?.acknowledged_at);
  const title=meeting.title[lang], subtitle=meeting.subtitle[lang];
  return html(`<!doctype html><html lang="${lang==="en"?"en":"pt-BR"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} · Adapta</title><style>${baseStyles()}</style></head><body><main>
  <div class="top"><div><p class="eyebrow">Adapta · ${lang==="en"?"Board":"Diretoria"}</p><h1>${escapeHtml(title)}</h1><p class="date">${escapeHtml(subtitle)} · ${escapeHtml(formatDate(date,lang))}</p></div>${languageSwitch(`${ROUTE_PREFIX}${date}+${recipient.id}`,lang)}</div>
  ${meeting.source?`<div class="meta"><strong>${lang==="en"?"Primary source":"Fonte primária"}:</strong> ${escapeHtml(meeting.source)}<br><strong>SHA-256:</strong> ${escapeHtml(meeting.sourceHash)}</div>`:""}
  <div class="document">${reportHtml(meeting,lang)}</div>
  <h2>${lang==="en"?"Board acknowledgements":"Vistos da Diretoria"}</h2><div class="signatures">${signatureRows(status.records,lang)}</div>
  ${signed?`<div class="statement"><div class="stamp">✓ ${lang==="en"?"Acknowledged":"Visto eletrônico"} · ${escapeHtml(recipient.label)}</div>${own?.protocol?`<div class="protocol" style="margin-top:12px">${lang==="en"?"Protocol":"Protocolo"}: ${escapeHtml(own.protocol)}</div>`:""}</div>`:`<div class="statement">${lang==="en"?"By adding my acknowledgement, I confirm that I have read this formal meeting record and am aware of its contents and recorded action items.":"Ao adicionar meu visto, confirmo que li este registro formal da reunião e estou ciente de seu conteúdo e dos encaminhamentos nele registrados."}</div><button id="ack">${lang==="en"?"ADD MY ACKNOWLEDGEMENT":"ADICIONAR MEU VISTO"}</button><p class="fine">${lang==="en"?"Your acknowledgement will be recorded once and will generate an individual protocol.":"Seu visto será registrado uma única vez e gerará um protocolo individual."}</p><div id="msg"></div>`}
  ${status.complete?`<a class="button" style="margin-top:24px" href="${withLang(`${ROUTE_PREFIX}${date}`,lang)}">${lang==="en"?"VIEW FINAL RECORD":"VER REGISTRO FINAL"}</a>`:""}
</main>${signed?"":`<script>const b=document.getElementById('ack'),m=document.getElementById('msg');b.addEventListener('click',async()=>{b.disabled=true;try{const r=await fetch(location.pathname,{method:'POST'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'error');location.reload()}catch(e){m.textContent='${lang==="en"?"Unable to register now. Please try again.":"Não foi possível registrar agora. Tente novamente."}';b.disabled=false}});</script>`}</body></html>`);
}

function invalidPage(lang="pt"){ return html(`<!doctype html><html><head><meta charset="utf-8"><style>${baseStyles()}</style></head><body><main><h1>${lang==="en"?"Unavailable link":"Link indisponível"}</h1></main></body></html>`,404); }

async function finalPage(env,date,lang){
  const meeting=MEETINGS[date]; if(!meeting)return invalidPage(lang); const status=await meetingStatus(env,date);
  if(!status.complete) return html(`<!doctype html><html><head><meta charset="utf-8"><style>${baseStyles()}</style></head><body><main><h1>${lang==="en"?"Acknowledgements still pending":"Pauta ainda em coleta de vistos"}</h1><p class="muted">${lang==="en"?"The archived version will be released after all board members acknowledge the record.":"A versão de arquivo será liberada quando todos os diretores tiverem registrado o visto."}</p></main></body></html>`,409);
  return html(`<!doctype html><html lang="${lang==="en"?"en":"pt-BR"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(meeting.title[lang])}</title><style>${baseStyles()}</style></head><body><main>
  <div class="top"><div><p class="eyebrow">Adapta · ${lang==="en"?"Board archive":"Arquivo da Diretoria"}</p><h1>${escapeHtml(meeting.title[lang])}</h1><p class="date">${escapeHtml(formatDate(date,lang))} · ${lang==="en"?"Finalized":"Finalizada"}</p></div>${languageSwitch(`${ROUTE_PREFIX}${date}`,lang)}</div>
  ${meeting.source?`<div class="meta"><strong>${lang==="en"?"Primary source":"Fonte primária"}:</strong> ${escapeHtml(meeting.source)}<br><strong>SHA-256:</strong> ${escapeHtml(meeting.sourceHash)}</div>`:""}
  <div class="document">${reportHtml(meeting,lang)}</div><h2>${lang==="en"?"Electronic acknowledgements":"Vistos eletrônicos"}</h2><div class="signatures">${signatureRows(status.records,lang)}</div><a class="button" href="${withLang(ARCHIVE_PATH,lang)}">${lang==="en"?"BACK TO ARCHIVE":"VOLTAR AO ARQUIVO"}</a>
</main></body></html>`);
}

async function archivePage(env,lang){
  const completed=[]; for(const date of Object.keys(MEETINGS).sort().reverse()){const status=await meetingStatus(env,date);if(status.complete)completed.push({date,count:status.records.length,meeting:MEETINGS[date]});}
  const items=completed.length?completed.map(({date,count,meeting})=>`<a class="archive-item" href="${withLang(`${ROUTE_PREFIX}${date}`,lang)}"><div class="archive-meta"><div><strong>${escapeHtml(meeting.title[lang])}</strong><div class="muted">${lang==="en"?"Meeting":"Reunião"}: ${escapeHtml(formatDate(date,lang))}</div></div><span class="seal">${lang==="en"?`Finalized · ${count} acknowledgements`:`Finalizada · ${count} vistos`}</span></div></a>`).join(""):`<div class="empty">${lang==="en"?"There are no finalized board records yet.":"Ainda não há pautas finalizadas para consulta."}</div>`;
  return html(`<!doctype html><html lang="${lang==="en"?"en":"pt-BR"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lang==="en"?"Board Records Archive":"Arquivo de Pautas"} · Adapta</title><style>${baseStyles()}</style></head><body><main><div class="top"><div><p class="eyebrow">Adapta · ${lang==="en"?"Board":"Diretoria"}</p><h1>${lang==="en"?"Board Records Archive":"Arquivo de Pautas"}</h1><p class="date">${lang==="en"?"Finalized records with electronic acknowledgements and individual protocols.":"Registros finalizados com vistos eletrônicos e protocolos individuais."}</p></div>${languageSwitch(ARCHIVE_PATH,lang)}</div><div class="archive-list">${items}</div></main></body></html>`);
}

export async function handleBoardAcknowledgement(request,env){
  const url=new URL(request.url), lang=language(url);
  if(url.pathname===ARCHIVE_PATH && request.method==="GET") return archivePage(env,lang);
  const route=parseRoute(url.pathname); if(!route)return null;
  if(!MEETINGS[route.date])return invalidPage(lang);
  if(route.mode==="archive" && request.method==="GET")return finalPage(env,route.date,lang);
  const recipient=resolveRecipient(route.date,route.recipientSlug); if(!recipient)return invalidPage(lang);
  const record=await getRecord(env,route.date,recipient); if(!record)return invalidPage(lang);
  if(request.method==="GET"||request.method==="HEAD")return documentPage(env,route.date,recipient,lang);
  if(request.method==="POST"){
    if(record.acknowledged_at)return json({ok:true,alreadyAcknowledged:true,protocol:record.protocol,acknowledgedAt:record.acknowledged_at});
    const now=new Date().toISOString(), protocol=protocolFor(route.date,recipient.id);
    const result=await env.DB.prepare(`UPDATE board_acknowledgements SET acknowledged_at=?,protocol=? WHERE meeting_date=? AND recipient_id=? AND acknowledged_at IS NULL`).bind(now,protocol,route.date,recipient.id).run();
    if(!result.meta?.changes){const latest=await getRecord(env,route.date,recipient);return json({ok:true,alreadyAcknowledged:true,protocol:latest?.protocol,acknowledgedAt:latest?.acknowledged_at});}
    return json({ok:true,protocol,acknowledgedAt:now});
  }
  return json({error:"method_not_allowed"},405);
}
