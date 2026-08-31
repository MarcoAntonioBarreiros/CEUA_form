(function(){
const dogRows={
  'Cães':[
    'Cães — até 12 kg: área de piso 1,1 m²; altura 1 m.',
    'Cães — 12 a 30 kg: área de piso 1,86 m²; altura 2 m.',
    'Cães — acima de 30 kg: área de piso 2,2 m²; altura 2 m.',
    'Solário/área externa: no mínimo a mesma metragem da área coberta; espaço ≥ 2 m para afastamento do corredor.'
  ],
  'Gatos':[
    'Gaiola individual por menos de duas semanas: mínimo 1 m²/animal.',
    'Confinamento prolongado: mínimo 1,5 m²/animal; altura ≥ 0,6 m, com prateleiras/áreas elevadas.',
    'Grupo: pelo menos 1 m² de piso/animal; comedouro, bebedouro, cama e caixa sanitária distantes ≥ 60 cm entre si.'
  ]
};
const rodentSpace={
  'Camundongo':'Peso/área mínima: < 10 g — 38,7 cm²; 10–15 g — 51,6 cm²; 15–25 g — 77,4 cm²; > 25 g — > 96,7 cm²; fêmea com ninhada — 300 cm² por grupo. Altura mínima: 12,7 cm.',
  'Rato':'Peso/área mínima: < 100 g — 109,6 cm²; 100–200 g — 148,35 cm²; 200–300 g — 187,05 cm²; 300–400 g — 258 cm²; 400–500 g — 387 cm²; > 500 g — ≥ 451,5 cm²; fêmea com ninhada — 800 cm² por grupo. Altura mínima: 17,8 cm.',
  'Hamster':'Peso/área mínima: < 60 g — 64,5 cm²; 60–80 g — 83,8 cm²; 80–100 g — 103,2 cm²; > 100 g — ≥ 122,5 cm². Altura mínima: 15,2 cm.',
  'Cobaia':'Peso/área mínima: < 350 g — 387 cm²; ≥ 350 g — ≥ 651,5 cm². Altura mínima: 17,8 cm.',
  'Coelho':'Peso/área mínima: < 2 kg — 0,14 m²; 2–4 kg — 0,28 m²; 4–5,4 kg — 0,37 m²; > 5,4 kg — ≥ 0,46 m². Altura mínima: 40,5 cm.'
};
const pigTemp={
  maternidade:'Porca em lactação e leitegada: conforto da porca 15–26 °C; escamoteador com mínimo 32 °C; manejo de maternidade com escamoteador 32–26 °C e sala em torno de 18–22 °C.',
  creche:'Creche: 18–26 °C; em torno de 26 °C nos primeiros 14 dias e 24 °C até a saída.',
  crescimento:'Crescimento: 15–25 °C; evitar temperaturas abaixo de 15 °C e variações superiores a 6 °C.',
  terminacao:'Terminação: 10–25 °C; salas em torno de 16–18 °C conforme o desenvolvimento.',
  gestacao:'Gestação/matrizes: 10–25 °C na tabela geral; 16–22 °C na cobrição/gestação; evitar acima de 28 °C no primeiro mês após cobertura.',
  reprodutor:'Reprodutores/cachaços: 10–25 °C.'
};
const pigPhaseDetails={
  maternidade:{title:'Maternidade / lactação',param:'Quando usada, cela parideira com 3,6 a 4,0 m². Escamoteador para leitões com faixa 32–26 °C. Sala em torno de 18–22 °C, ventilação adequada, controle de correntes de ar e água à vontade para a porca.'},
  creche:{title:'Creche',param:'Sistema todos-dentro/todos-fora; sala limpa e desinfetada. Até 3 leitões/m² em baias suspensas/ripadas e até 2,5 leitões/m² nas demais baias; mínimo 1,4 m³ de ar/leitão; bebedouros com vazão de 1,0 a 1,5 L/min quando aplicável.'},
  crescimento:{title:'Crescimento e terminação',param:'Sistema todos-dentro/todos-fora, com lotes fechados. Evitar temperaturas inferiores a 15 °C, variações superiores a 6 °C e correntes de ar frio; manter limpeza das baias e manejo adequado dos dejetos.'},
  terminacao:{title:'Crescimento e terminação',param:'Para 70–100 kg: mínimo legal de 0,55–0,65 m²/suíno; recomendação de manejo ≥ 1 m²/suíno e ≥ 3 m³ de ar/suíno alojado; salas em torno de 16–18 °C.'},
  gestacao:{title:'Gestação / reprodução',param:'No intervalo desmame-cio, agrupar porcas em lotes de cinco a dez ou boxes individuais, com 3 m² por porca. Na cobrição/gestação, manter 16–22 °C e evitar acima de 28 °C no primeiro mês.'},
  reprodutor:{title:'Gestação / reprodução',param:'Manter instalação limpa e arejada, água à vontade e manejo que reduza agressões e estresse social; referência térmica de 10–25 °C para reprodutores/cachaços.'}
};
function joinLines(intro,rows){ return intro+'\n'+rows.map(x=>'• '+x).join('\n'); }
function dogDimension(ctx){
  const rows=ctx.subgrupo==='Cães e gatos'?[...dogRows.Cães,...dogRows.Gatos]:(dogRows[ctx.subgrupo]||[...dogRows.Cães,...dogRows.Gatos]);
  return joinLines('Comparar área, altura, peso/porte, número de animais e sistema com os parâmetros do Guia:',rows);
}
function fishWater(ctx){
  if(ctx.subgrupo!=='Peixes de laboratório') return '';
  const rows={
    Lambari:'O₂ dissolvido > 4 mg/L; amônia < 0,1 mg/L; pH 6,5–8,0; temperatura 24–28 °C.',
    Tilápia:'O₂ dissolvido > 4 mg/L; amônia < 0,20 mg/L; pH 6,0–8,5; temperatura 24–32 °C.',
    Zebrafish:'O₂ dissolvido ≈ 7,8 mg/L; amônia < 0,002 mg/L; pH 7,0–8,0; temperatura 24–28 °C; nitrito < 0,5 ppm.'
  };
  const selected=rows[ctx.especie]?[rows[ctx.especie]]:Object.entries(rows).map(([k,v])=>k+': '+v);
  return joinLines('Peixes de laboratório — parâmetros do capítulo 5 do Guia:',selected);
}
function fishDensity(ctx){
  if(ctx.subgrupo!=='Peixes de laboratório') return '';
  const rows={
    Lambari:'manutenção entre 0,5 e 2 g/L; em densidades elevadas, trocar água a cada 24 h ou no máximo 48 h.',
    Zebrafish:'até 5 peixes adultos/L com aeração, biofiltro, renovação de 70%/dia e boa qualidade da água; sem biofiltro, 1–2 animais/L.',
    Tilápia:'definir pela biomassa, capacidade de suporte do sistema, comportamento, acesso ao alimento e parâmetros de água.'
  };
  return rows[ctx.especie]?'Conferir densidade: '+rows[ctx.especie]:'Conferir densidade segundo espécie, biomassa e capacidade do sistema. Lambari: 0,5–2 g/L. Zebrafish: até 5 adultos/L nas condições descritas no Guia; sem biofiltro, 1–2/L.';
}
function pigDimension(ctx,base){
  const specific=ctx.fases.flatMap(k=>{
    if(k==='maternidade') return ['Cela parideira, quando usada: 3,6 a 4,0 m².'];
    if(k==='creche') return ['Creche ripada: até 3 leitões/m² e mínimo 1,4 m³ de ar/leitão; demais baias: até 2,5 leitões/m².'];
    if(k==='terminacao') return ['Terminação 70–100 kg: 0,55–0,65 m²/suíno; recomendação de manejo ≥ 1 m² e ≥ 3 m³ de ar/suíno.'];
    if(k==='gestacao') return ['Marrã após cobrição: ≥ 1,64 m²; porca: ≥ 2,25 m²; intervalo desmame-cio: aproximadamente 3 m²/porca.'];
    return [];
  });
  return specific.length?joinLines(base.replace(/Selecione[^.]+\./i,'').trim(),specific):base;
}
function largeDimension(ctx,base){
  const r=[];
  if(ctx.tipos.includes('bezerreiro')) r.push('Bezerreiro individual: 1,10 m de altura × 1,10 m de largura × 1,80 m de comprimento; baias coletivas: 2,0–2,5 m²/animal.');
  if(ctx.tipos.includes('piquete')) r.push('Piquetes: mínimo 15 m²/animal; lotação conforme pastagem/forragem.');
  if(ctx.tipos.includes('reproducao')) r.push('Touros: repouso de 1 m² para cada 60 kg e exercício de no mínimo 25 m².');
  if(ctx.tipos.includes('confinamento')) r.push('Confinamento a céu aberto: mínimo 10 m²/animal para bovinos e 17 m²/animal para búfalos.');
  if(ctx.tipos.some(x=>x==='piquete'||x==='confinamento')) r.push('Sombreamento: mínimo 0,7 m²/animal jovem e 3 m²/animal adulto; altura ≥ 3 m; ampliar para búfalos.');
  return r.length?joinLines('Comparar área, lotação, categoria, sistema e recursos:',r):base;
}
const configs={
  'roedores-lagomorfos':{
    especie:{label:'Espécie/grupo avaliado',options:['Camundongo','Rato','Hamster','Cobaia','Coelho','Vários grupos']},
    tipos:{criacao:'Biotério de criação/reprodução',manutencao:'Biotério de manutenção',experimentacao:'Biotério de utilização',racks:'Racks ventilados (IVC)',convencional:'Gaiolas em estante aberta'},
    append:{
      'rn-57-2022-art-2o-i-g':['Verificar vestiário para paramentação/troca, compatível com o fluxo de barreira da instalação.'],
      'rn-57-2022-art-2o-i-i':['Verificar estrados, estantes ou sistema equivalente que evite contato dos alimentos e da forração com piso e paredes.']
    },
    extras:[{id:'dimensionamento-guia',step:'amb',title:'Dimensionamento / espaço mínimo por animal',base:'Parâmetro complementar das Tabelas 1 e 2 do Guia; não altera a classificação normativa.',param:ctx=>joinLines('Comparar área/animal, altura, peso e tamanho do grupo.',ctx.especie&&rodentSpace[ctx.especie]?[rodentSpace[ctx.especie]]:Object.entries(rodentSpace).map(([k,v])=>k+': '+v))}]
  },
  'caes-gatos':{
    subgrupos:['Cães','Gatos','Cães e gatos'],
    tipos:{criacao:'Instalação de criação/reprodução',cirurgia:'Salas cirúrgicas/laboratórios',gaiolas:'Gaiolas individuais',grupos:'Alojamento coletivo/baias',solario:'Solário/área externa'},
    parametro:(ctx,it,base)=>it.id==='rn-59-2023-art-2o-i-g'?dogDimension(ctx):base
  },
  primatas:{
    especie:{label:'Espécie(s) / táxon avaliado',free:true,placeholder:'Ex.: Callithrix, Sapajus, Alouatta'},
    tipos:{interno:'Alojamento interno',externo:'Alojamento externo',producao:'Produção/reprodução',quarentena:'Área de quarentena'}
  },
  peixes:{
    subgrupos:['Peixes de laboratório','Demais espécies'],
    especiesPorSubgrupo:{'Peixes de laboratório':['Lambari','Tilápia','Zebrafish','Vários grupos'],'Demais espécies':['Tilápia','Tambaqui','Pacu','Jundiá (Rhamdia)','Dourado','Outras nativas','Vários grupos']},
    tipos:{aquarios:'Aquários/caixas',tanques:'Tanques',ras:'Recirculação/biofiltro',escavado:'Tanque escavado/viveiro',lona:'Tanque de lona',rede:'Tanque-rede',experimento:'Experimentação/toxicidade',larval:'Embriões/larvas'},
    parametro:(ctx,it,base)=>{
      if(it.id==='rn-61-2023-art-2o-i-l'&&ctx.subgrupo==='Peixes de laboratório') return fishWater(ctx);
      if(it.id==='rn-61-2023-art-2o-i-f') return ctx.subgrupo==='Peixes de laboratório'?'Verificar rotina de claro/escuro adequada à espécie e ao protocolo, evitando iluminação instável.':base;
      if(it.id==='rn-61-2023-art-2o-ii-b'&&ctx.subgrupo==='Peixes de laboratório') return fishDensity(ctx);
      if(it.id==='rn-61-2023-art-2o-ii-e'&&ctx.subgrupo==='Peixes de laboratório') return 'Verificar enriquecimento compatível com a espécie: substrato, abrigos/canos e plantas sem aumentar disputa territorial; variar dieta e manter espécies gregárias em grupo.';
      return base;
    }
  },
  'anfibios-serpentes':{
    subgrupos:['Anfíbios','Serpentes','Anfíbios e serpentes'],
    tipos:{terrario:'Terrário/gaiola',serpaberto:'Serpentário aberto',aquaterrario:'Aquário/aquaterrário',quarentena:'Área de quarentena',ambulatorio:'Ambulatório/centro cirúrgico'},
    append:{
      'rn-62-2023-art-4o-i-a-serpentes':['Verificar contenção, travas e manejo seguro. Serpentário aberto: aproximadamente 1 serpente média/m² e laterais com cerca de 150 cm; animais acima de 2 m: 3–4 m²/animal. Espécies arborícolas exigem suportes em diferentes alturas.','Verificar gradiente térmico protegido, higrômetro, ciclo claro/escuro e renovação de ar conforme a espécie.'],
      'rn-62-2023-art-4o-i-b-serpentes':['Verificar água corrente ou rotina de troca diária que evite algas e bactérias.'],
      'rn-62-2023-art-4o-ii-a-serpentes':['Verificar registro individualizado da frequência de alimentação.'],
      'rn-62-2023-art-4o-ii-c-serpentes':['Verificar registros de inspeção arquivados e disponíveis.'],
      'rn-62-2023-art-5o-iii-serpentes':['Para serpentes, conferir abrigos, suportes para espécies arborícolas e substrato adequado.'],
      'rn-62-2023-art-5o-iv-serpentes':['Para serpentes, os POPs devem abranger manejo, ambiente, alimentação, biossegurança e acidentes.'],
      'rn-62-2023-art-5o-v-serpentes':['Verificar registro documentado da higienização dos recintos.']
    }
  },
  equideos:{
    especie:{label:'Espécie/grupo avaliado',options:['Equinos','Asininos','Muares','Vários grupos']},
    tipos:{piquete:'Pastagem/piquetes',cavalarica:'Cavalariça/baias',curral:'Área de manejo/curral',reproducao:'Baias-maternidade/reprodução',transporte:'Transporte próprio'},
    append:{
      'rn-65-2023-art-2o-i-c':['Verificar depósito de alimentos e forragem protegido de umidade, pragas e contaminação.'],
      'rn-65-2023-art-2o-i-e':['Verificar espaço para movimento, posturas naturais, alimentação, água, pastejo e interação social; restrições exigem aprovação da CEUA.']
    },
    extras:[{id:'manejo-sanitario-guia',step:'req',title:'Manejo e sanidade — conferências recomendadas',base:'Parâmetros complementares do Guia; não alteram a classificação normativa.',param:'Quando aplicável, conferir curral compartimentado, cobertura, corredor tipo seringa, limpeza/desinfecção, vazio sanitário, depósito de resíduos isolado e barreira física.'}]
  },
  'pequenos-ruminantes':{
    especie:{label:'Espécie/grupo avaliado',options:['Caprinos','Ovinos','Caprinos e ovinos']},
    gm:true,
    tipos:{piquete:'Piquetes/pastagem',confinamento:'Confinamento/engorda',curral:'Curral/brete/tronco',reproducao:'Baias de reprodutores',hospital:'Baia hospitalar',metabolica:'Gaiolas metabólicas',camara:'Câmaras climáticas/respirométricas'}
  },
  'grandes-ruminantes':{
    especie:{label:'Espécie/grupo avaliado',options:['Bovinos','Bubalinos','Bovinos e bubalinos']},
    gm:true,
    tipos:{piquete:'Piquetes/pastagem',confinamento:'Confinamento/semiconfinamento',curral:'Curral/brete/tronco',reproducao:'Produção/reprodução',cirurgia:'Procedimentos cirúrgicos',hospital:'Piquete/baia hospitalar',bezerreiro:'Bezerreiro',metabolica:'Gaiolas metabólicas',camara:'Câmaras climáticas/respirométricas'},
    parametro:(ctx,it,base)=>it.id==='rn-64-2023-art-2o-i-d'?largeDimension(ctx,base):base
  },
  suinos:{
    gm:true,
    fases:{maternidade:'Maternidade / lactação',creche:'Creche / leitões',crescimento:'Crescimento',terminacao:'Terminação',gestacao:'Gestação / matrizes',reprodutor:'Reprodutores / cachaços'},
    tipos:{gaiolas:'Gaiolas suspensas',baias:'Baias coletivas',cela:'Celas parideiras',ripado:'Piso ripado',compacto:'Piso compacto',cama:'Cama sobreposta',piquete:'Piquete/área externa',outro:'Outro'},
    parametro:(ctx,it,base)=>it.id==='rn-66-2023-art-2o-i-m'?pigDimension(ctx,base):base,
    extras:[
      {id:'temperatura-guia',step:'amb',title:'Temperatura, umidade e conforto térmico',base:'Parâmetro do Guia vinculado à segurança e ao bem-estar; não cria novo dispositivo.',param:ctx=>joinLines('Umidade relativa aceitável: 30% a 70%; acima de 80% é excessiva. Avaliar também o comportamento dos animais.',ctx.fases.length?ctx.fases.map(k=>pigTemp[k]).filter(Boolean):['Selecione a(s) fase(s) na etapa 2 para exibir as faixas correspondentes.'])},
      {id:'ventilacao-guia',step:'amb',title:'Ventilação e qualidade do ar',base:'Parâmetro do Guia vinculado à segurança e ao bem-estar.',param:'Fornecer oxigênio, remover calor e diluir contaminantes; evitar correntes diretas sobre leitões. No inverno, não ficar abaixo de 6 renovações/h; 10–15 trocas de ar fresco/h é referência geral.'},
      {id:'iluminacao-guia',step:'amb',title:'Iluminação e fotoperíodo',base:'Parâmetro do Guia vinculado à segurança e ao bem-estar.',param:'Sistema elétrico protegido; iluminação difundida e suficiente para bem-estar, inspeção e segurança; ciclo claro-escuro uniforme quando aplicável.'},
      {id:'ruido-guia',step:'amb',title:'Ruído e vibrações',base:'Parâmetro do Guia vinculado à segurança e ao bem-estar.',param:'Separar atividades ruidosas. Sons acima de 85 dB podem causar efeitos auditivos e não auditivos; identificar e isolar vibrações excessivas.'},
      {id:'agua-alimento-guia',step:'amb',title:'Água, ração, comedouros e bebedouros',base:'Parâmetro do Guia vinculado à segurança e ao bem-estar.',param:'Água ad libitum; comedouros e bebedouros funcionais, acessíveis e limpos; alimentação adequada à fase e livre de contaminantes.'},
      ...Object.entries(pigPhaseDetails).map(([id,x])=>({id:'fase-'+id,step:'req',title:x.title,base:'Parâmetro do Guia aplicável à fase selecionada; não cria novo dispositivo.',param:x.param,when:ctx=>ctx.fases.includes(id)})),
      {id:'sala-hospital-guia',step:'req',title:'Sala hospital / baia hospital',base:'Recomendação do Guia; não é item obrigatório da RN 66/2023.',param:'Local separado ou com circulação independente; baias secas, limpas e aquecidas. Referências: 1,5 m²/animal em baias pequenas, 1,2 m²/animal em baias maiores e 3,0 m²/animal para reprodutores.'}
    ]
  },
  aves:{
    especie:{label:'Espécie/categoria avaliada',options:['Frangos de corte','Galinhas poedeiras','Reprodução/matrizes','Codornas','Outras aves']},
    tipos:{piso:'Criação em piso com cama',gaiola:'Criação em gaiolas',pintinhos:'Pintinhos/incubatório',climatizada:'Aviário climatizado/câmara'},
    extras:[{id:'ambiencia-guia',step:'amb',title:'Conforto térmico, ventilação e qualidade do ar',base:'Parâmetro do Guia vinculado à segurança e ao bem-estar; não cria novo dispositivo.',param:'Manter ventilação, resfriamento/nebulização, umidade e qualidade do ar. Pintinhos à chegada: aproximadamente 31–32 °C a 5 cm da cama; umidade relativa 40–65%; água limpa e fresca, aproximadamente 20 °C.'}]
  }
};
window.CIUCA_PARECERISTA_CONFIG=configs;
})();
