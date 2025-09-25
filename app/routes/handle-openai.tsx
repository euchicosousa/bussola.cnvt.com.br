import { OpenAI } from "openai";
import type { ActionFunctionArgs } from "react-router";
import { AI_INTENTS } from "~/lib/constants";

export const config = { runtime: "edge" };

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  let {
    title,
    description,
    prompt,
    intent,
    model,
    context,
    length,
    tense,
    mission,
    tactic,
    intensity,
  } = Object.fromEntries(formData.entries()) as Record<string, string>;

  if (!intent) {
    return { message: "Defina a sua intenção nesse comando." };
  }

  let system =
    "Você é um especialista em storytelling e copywriting para redes sociais.";

  const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });

  let content = "";

  if (intent === AI_INTENTS.generateIdeas) {
    // Gera ideias PDF 1 idea 10 conteúdos
    system =
      "Você é Jéssica, uma Social Media Storyteller, especialista em transformar uma única ideia em vários conteúdos envolventes para o Instagram.";

    content = `Sua tarefa é pegar um tópico central fornecido pelo usuário e gerar 10 conteúdos únicos em português, adaptados ao nicho e público-alvo especificados, se fornecidos. Se não houver nicho ou público definido, assuma um público geral e crie conteúdos amplamente atraentes.
    
    Requisitos de Entrada:
- Esse é o tópico central: ${description}.
- Opcionalmente, o usuário pode especificar um nicho (ex.: nutrição, educação, relacionamentos) e público-alvo (ex.: jovens adultos, casais, entusiastas de fitness).
- Requisitos de Saída:Gere 10 conteúdos para o Instagram baseados no tópico central, usando os seguintes formatos:


- Carrossel com Storytelling
- Carrossel com Conteúdo Técnico
- Reel Narrado
- Reel Tutorial
- Carrossel com Indicação
- Carrossel com Estudo de Caso
- Reel POV
- Reel Técnico
- Carrossel com Posicionamento
- Stories

Para cada conteúdo:

- Forneça um Título (cativante e envolvente, máx. 10 palavras).
- Forneça uma Descrição (explique o conteúdo, incluindo pontos-chave, tom e como engaja o público, máx. 100 palavras).
- Inclua um Chamada para Ação (CTA) (ex.: "Comente sua experiência!" ou "Salve este post!").
- Mantenha consistência de marca com um tom coeso (ex.: educativo, inspirador, divertido) e alinhado ao nicho/público.
- Incentive a interação do público (ex.: perguntas, enquetes ou conteúdo compartilhável).

Passos a Seguir:

- Use o tópico central como base para todos os conteúdos.
- Adapte o tópico a cada um dos 10 formatos, garantindo variedade na abordagem (ex.: histórias pessoais, insights técnicos, tutoriais).
- Diversifique os conteúdos para atrair diferentes segmentos do público (ex.: consumo rápido vs. aprofundado).
- Siga as melhores práticas: planeje postagens espaçadas, mantenha consistência e diversifique formatos para evitar saturação.

Restrições:

- Todos os conteúdos devem ser em português.
- Os conteúdos devem ser autênticos, envolventes e alinhados ao ecossistema dinâmico do Instagram (Reels, Stories, Carrosséis).
- Evite linguagem excessivamente promocional, a menos que especificado; foque em conteúdos baseados em valor (ex.: educação, inspiração).
- Se não houver nicho especificado, crie conteúdos adaptáveis a múltiplos nichos.
- Não repita a mesma abordagem ou mensagem entre os formatos; cada peça deve ser única.



Exemplo de Saída (para um formato):

<h3>Tópico Central: "Alimentos sem glúten"</h3>
<p>
<strong>Nicho</strong>: Nutrição <br/>
<strong>Público-Alvo:</strong> Pessoas com intolerância ao glúten 
</p>

<h4>1 - Carrossel com Storytelling</h4>
<p>
<strong>Título</strong>: "Minha jornada sem glúten mudou tudo!" <br/>
<strong>Descrição</strong>: Compartilhe uma história pessoal sobre descobrir a intolerância ao glúten, com 5 slides detalhando sintomas, desafios e adaptações. Use tom emotivo para criar conexão, incluindo uma citação inspiradora. Engaja ao mostrar vulnerabilidade e inspirar mudanças.<br/>
<strong>CTA</strong>: "Conte sua história nos comentários!"<br/>
</p>

Tom e Estilo:

- Use um tom conversacional e acessível, como se estivesse falando com um amigo.
- Incorpore nuances culturais brasileiras se adequado ao público.
- Seja criativa, prática e inspiradora, refletindo a ênfase em storytelling e engajamento.

Notas Adicionais:

- Se o usuário fornecer uma marca ou contexto específico, incorpore isso no tom e nos visuais.
- Para Stories, inclua elementos interativos como enquetes, quizzes ou stickers de perguntas.
- Para Reels, priorize conteúdos dinâmicos e curtos (15-30 segundos) com áudio em alta ou transições suaves.

Orientações sobre o retorno:

- Retorne o conteúdo em formato de parágrafos, com cada item numerado e separado por quebras de linha.
- Use apenas tags HTML para formatação como <p> e <br>.
- NÃO USE markdown.
- Não inclua informações adicionais ou comentários pessoais; concentre-se apenas no conteúdo solicitado.
- Retorne apenas o conteúdo sem aspas.

`;
  } else if (intent === AI_INTENTS.shrinkText) {
    // Reduzir o texto
    system = "Você é um copywritter experiente.";
    content = `Reduza o TEXTO em 25% sem alterar o sentido ou mudar o tom de voz, mas pode reescrever e mudar o número de parágrafos. TEXTO: ${description}.`;
  } else if (intent === AI_INTENTS.expandText) {
    // Aumentar o texto
    system = "Você é um copywritter experiente.";
    content = `Aumente o TEXTO em 25% sem alterar o sentido ou mudar o tom de voz. TEXTO: ${description}.`;
  } else if (intent === AI_INTENTS.executePrompt) {
    // Executa o prompt
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${prompt.toString()}. Retorne sem aspas e com tags html, sem markdown.`,
        },
      ],
      model: "gpt-4o-mini",
    });

    return { message: chatCompletion.choices[0].message.content };
  } else if (
    ["reels", "title", "carousel", "instagram_caption", "stories"].find(
      (i) => i === intent,
    )
  ) {
    switch (intent) {
      case "reels": {
        system =
          "Você é um especialista em storytelling e copywriting para redes sociais com ampla experiência em criar vídeos virais.";
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.reel[model as keyof typeof storytellingModels.reel].title}.

    Siga a estrutura abaixo:
${storytellingModels.reel[model as keyof typeof storytellingModels.reel].structure}

O objetivo principal é gerar ${storytellingModels.reel[model as keyof typeof storytellingModels.reel].effect.toLowerCase()}.


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use títulos genéricos. Comece com um gancho real que pare o scroll.
- Limite cada bloco (slide, cena ou etapa) a no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- O formato de saída deve ser HTML puro, com a estrutura abaixo:

<h4>Slide 1</h4>
<p>Seu conteúdo aqui</p>

<h4>Slide 2</h4>
<p>Seu conteúdo aqui</p>

... e assim por diante até o encerramento com CTA
Não use aspas, bullet points, markdown ou comentários adicionais.
O resultado deve conter somente o texto solicitado.

Tema a ser desenvolvido: ${title} - ${description}
`;

        break;
      }
      case "carousel": {
        let impactoEmocional = intensity.split("-")[0];
        let nivelPressao = intensity.split("-")[1];
        let proximidadeConversacional = intensity.split("-")[2];
        let complexidadeTecnica = intensity.split("-")[3];
        let orientacaoSolucao = intensity.split("-")[4];
        let suporteEmocional = intensity.split("-")[5];
        let slides = length || 7;

        let tema = `${title} - ${description}`;

        content = `
Crie um carrossel de ${slides} slides seguindo esta estrutura de micro-funil educacional:

CONTEXTO BASE:
Tema: ${tema} 
Contexto da marca e público: ${context}

PARÂMETROS DE INTENSIDADE:
- Impacto Emocional: ${impactoEmocional}/5
- Nível de Pressão: ${nivelPressao}/5
- Proximidade Conversacional: ${proximidadeConversacional}/5
- Complexidade Técnica: ${complexidadeTecnica}/5
- Orientação para Solução: ${orientacaoSolucao}/5
- Suporte Emocional: ${suporteEmocional}/5

ATENÇÃO: NESSE MOMENTO SE ESTIVEREM FALTANDO INFORMAÇÕES ACIMA, RETORNE AO USUÁRIO QUE ELE DEVE FORNECER ESSES DADOS E NÃO PROSSIGA. MAS CASO TENHA IDENTIFICADO TUDO, PODE PROSSEGUIR.

REGRAS ANTI-GENÉRICO:
NUNCA use estas expressões (exceto se absolutamente necessário):
- "No mundo de hoje" / "Na era digital" / "Nos dias atuais"
- "É importante lembrar" / "Vale ressaltar" / "É fundamental"
- "Cada caso/pessoa é único(a)" / "Não existe fórmula mágica"
- "Busque/Procure um profissional" (seja específico: qual profissional?)
- "Diversas opções" / "Várias alternativas" (liste especificamente)
- "Pode ser desafiador" / "Não é fácil" (mostre o desafio real)
- "Jornada" / "Processo" / "Caminho" (use termos concretos)
- "Impactar" / "Agregar valor" / "Fazer a diferença"
- "Solução inovadora" / "Resultado transformador"
- "De forma geral" / "Basicamente" / "Essencialmente"

SUBSTITUA POR:
- Dados específicos, números, porcentagens
- Exemplos concretos e situações reais
- Verbos de ação diretos (fazer, criar, mudar, parar)
- Consequências tangíveis e mensuráveis
- Linguagem cotidiana do público-alvo

IMPORTANTE: Analise o contexto fornecido e extraia/infira:
- Tom de voz ESPECÍFICO da marca (não "profissional e acessível")
- Público-alvo com características precisas (idade, dores, vocabulário)
- Problema EXATO que o tema aborda
- Solução CONCRETA que a marca oferece
- Gatilhos psicológicos ESPECÍFICOS ao contexto
- Fontes de autoridade NOMEADAS
- CTA com verbo de ação claro

REGRAS ANTI-VÍCIOS DE IA
PROIBIÇÕES ABSOLUTAS: - 
Frases curtas demais com ponto final a cada 3-4 palavra
Estrutura "Não é X. É Y.
Perguntas artificiais ("O resultado?", "O insight?"
Bullet points com emojis desnecessário
Repetição de ideias com palavras diferente
Tom sensacionalista/dramático/forçad
Excesso de adjetivos genérico
Texto impessoal sem voz autora
Abstrações vazias tentando parecer profundo
OBRIGATÓRIO APLICAR: Fluidez natural na leitura 
Voz autêntica e consistente 
Informações concretas e úteis 
Transições suaves entre ideias 

ESTRUTURA DO MICRO-FUNIL (a quantidade de slides deve ser adaptada para o numero de ${slides}. NUNCA ULTRAPASSE ESSA QUANTIDADE):

[SLIDE 1 - GANCHO/CAPTURA]
- Pergunta que mencione situação específica vivida pelo público
- OU estatística surpreendente com número exato
- OU contradição que o público experimenta diariamente
- Máximo 3 linhas
- Final: "Deslize" + promessa específica (não "descubra mais")

[SLIDE 2 - CONTEXTO/QUALIFICAÇÃO]
- Defina o problema com exemplo concreto ou analogia precisa
- Número/estatística REAL com fonte (não "muitas pessoas")
- Momento específico quando isso acontece
- Sentimento NOMEADO que surge (não "frustração" genérico)

[SLIDES 3-8 - DESENVOLVIMENTO EM TRÊS ATOS]

ESCOLHA a estrutura mais adequada ao tema ${tema}:
- Se há TIPOS/CATEGORIAS → use Estrutura Tipológica
- Se há PROGRESSÃO/PIORA → use Estrutura Temporal
- Se afeta MÚLTIPLAS ÁREAS → use Estrutura Dimensional
- Se há NÍVEIS/GRAUS → use Estrutura Intensidade
- Se há CAUSA-EFEITO → use Estrutura Causal

Para PRODUTOS/SERVIÇOS, adapte:
- Aspecto A = Problema mais comum/visível
- Aspecto B = Problema oculto/ignorado
- Aspecto C = Problema mais custoso/urgente

Para CONCEITOS/EDUCAÇÃO, adapte:
- Aspecto A = Conceito básico/introdutório
- Aspecto B = Aplicação/exemplo prático
- Aspecto C = Implicação/consequência maior

REGRA UNIVERSAL DOS PARES:
- Slide ímpar (3,5,7): APRESENTA o aspecto
- Slide par (4,6,8): HUMANIZA com impacto na vida real

A progressão deve sempre ESCALAR:
- Aspectos A→B→C = crescente em intensidade/importância
- Ajuste a escalada baseado no parâmetro ${nivelPressao}

[SLIDES 3-4 - ASPECTO A]
- Nome técnico/popular do primeiro aspecto
- Slide 3: O que acontece FISICAMENTE/PRATICAMENTE
- Slide 4: Situação ESPECÍFICA do dia (manhã/trabalho/casa)
- Consequência mensurável (tempo perdido, dinheiro gasto, energia)

[SLIDES 5-6 - ASPECTO B]
- Segundo aspecto com características distintas
- Slide 5: Mecanismo de ação (como/quando/onde ocorre)
- Slide 6: Exemplo de situação real (segunda-feira, reunião, jantar)
- Impacto em área específica da vida

[SLIDES 7-8 - ASPECTO C]
- Aspecto mais crítico/ignorado/surpreendente
- Slide 7: Fato contra-intuitivo ou pouco conhecido
- Slide 8: Consequência em cascata (se isso, então aquilo)
- Pergunta específica sobre experiência do leitor

[SLIDE 9 - SOLUÇÃO/ESPERANÇA]
- Abordagem específica: "Existem 3 formas comprovadas:"
- Liste opções NOMEADAS com características
- Mencione tempo/esforço/investimento realista
- Evite promessas vagas

[SLIDE 10 - CTA/CONVERSÃO]
- Ação física específica: "Abra o app X", "Marque na agenda"
- Prazo concreto quando relevante
- Benefício tangível da ação
- Urgência baseada em fato (não "quanto antes melhor")



DIRETRIZES DE COPY ESPECÍFICAS:
- Se ${proximidadeConversacional} ≤ 2: Vocabulário formal do nicho
- Se ${proximidadeConversacional} ≥ 4: Gírias/expressões do público
- Se ${complexidadeTecnica} ≤ 2: Analogias do cotidiano
- Se ${complexidadeTecnica} ≥ 4: Termos técnicos SEM simplificação excessiva
- Se ${impactoEmocional} ≥ 4: Palavras sensoriais (sangrar, sufocar, explodir)
- Se ${suporteEmocional} ≥ 4: Situações específicas de identificação

CALIBRAGEM POR PARÂMETROS:
- Intensidade < 2.5: Fatos e instruções práticas
- Intensidade 2.5-3.5: Exemplos e casos reais
- Intensidade > 3.5: Urgências específicas e consequências nomeadas

FORMATAÇÃO:
- Use HTML puro
- Cada slide deve ter um título em h4
- Cada slide deve ter um parágrafo em p
- Não use tags de formatação e retorne apenas o texto, sem aspas

SIGA ESSE MODELO:
<h4>Slide 1 - Motivo do Slide</h4>
<p>Conteúdo do Slide</p>
<p><strong>Apresentação:</strong>Sugestão de apresentação, se é imagem, apenas texto, ou gráfico que ilustre melhor o conteúdo.</p>
<p style={{ opacity: 0.5, text-size: '0.8rem'}}>Caso haja alguma observação necessária sobre o slide. Não necessáriamente completando o slide. Informação de fontes de notícia, deve estar no conteúdo do slide. aqui são observações para que vai fazer o carrossel.</p> 


TESTE FINAL:
Antes de finalizar, verifique:
1. Cada slide tem pelo menos um elemento ESPECÍFICO (número, nome, momento)?
2. Removeu todos os termos da lista proibida?
3. O leitor consegue VISUALIZAR a situação descrita?
4. As soluções são AÇÕES, não conceitos?
5. O texto soa como conversa real, não redação de IA?

Lembre-se: Especificidade gera identificação. Genericidade gera esquecimento.


`;

        break;
      }

      case "title": {
        const _tense = SintagmaHooks.filter((t) => t.id === tense)[0];
        const _mission = _tense.missions.filter((m) => m.id === mission)[0];
        const _tactic = _mission.tactics.filter((t) => t.id === tactic)[0];

        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram. O título tem a função de "${_tense.title}". Ele deve provocar esse sentimento: "${_mission.tension}". E também deve ter esse objetivo: "${_mission.role}". Use esses exemplos como modelos placeholder: "${_tactic.examples.join(" | ")}".
        
        Importante:
        - Utilize linguagem acessível e humana, adaptada para Instagram.
        - Não use títulos genéricos. Comece com um gancho real que pare o scroll.
        - Limite de 8 a 12 palavras. JAMAIS ULTRAPASSE ESSE LIMITE.
        - O formato de saída deve ser sem nenhuma formatação puro
        - Não use aspas, bullet points, markdown ou comentários adicionais.
        - O resultado deve conter somente o texto solicitado.

        Tema a ser desenvolvido: ${title} - ${description}.

        Esteja atento a esse contexto: ${context}
        `;

        break;
      }
      case "instagram_caption": {
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.legenda[model as keyof typeof storytellingModels.legenda].title}.

    Siga a estrutura abaixo:
${storytellingModels.legenda[model as keyof typeof storytellingModels.legenda].description}

O objetivo principal é gerar ${storytellingModels.legenda[model as keyof typeof storytellingModels.legenda].effect.toLowerCase()}.


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use expressões genéricos.
- O texto deve ter ${length} palavras. Nunca mais do que isso.
- Cada parágrafo deve ter no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- Não use tags, aspas, bullet points, markdown ou comentários adicionais.
- O resultado deve conter somente o texto solicitado.
- Inclua pelo menos um emoji por parágrafo

REGRAS ANTI-VÍCIOS DE IA
PROIBIÇÕES ABSOLUTAS: - 
Frases curtas demais com ponto final a cada 3-4 palavra
Estrutura "Não é X. É Y.
Perguntas artificiais ("O resultado?", "O insight?"
Bullet points com emojis desnecessário
Repetição de ideias com palavras diferente
Tom sensacionalista/dramático/forçad
Excesso de adjetivos genérico
Texto impessoal sem voz autora
Abstrações vazias tentando parecer profundo
OBRIGATÓRIO APLICAR: Fluidez natural na leitura 
Voz autêntica e consistente 
Informações concretas e úteis 
Transições suaves entre ideias 

Tema a ser desenvolvido: ${title} - ${description}

Siga as orientações de marca desse contexto: ${context}
`;

        break;
      }
      case "stories": {
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram, utilizando o modelo narrativo definido em ${storytellingModels.stories[model as keyof typeof storytellingModels.stories].title}.

    Siga a estrutura abaixo:
${storytellingModels.stories[model as keyof typeof storytellingModels.stories].structure}

O objetivo principal é gerar ${storytellingModels.stories[model as keyof typeof storytellingModels.stories].effect.toLowerCase()}.


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use títulos genéricos. Comece com um gancho real que pare o scroll.
- Limite cada bloco a no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- O formato de saída deve ser a estrutura abaixo:
- Sugira um elemento de engajamento dos stories de acordo com a necessidade

Story 1
Seu conteúdo aqui
Elemento de engajamento (Se for necessário)

Slide 2
Seu conteúdo aqui
Elemento de engajamento (Se for necessário)

... e assim por diante até o encerramento com CTA
Não use aspas, bullet points, tags, markdown ou comentários adicionais.
O resultado deve conter somente o texto solicitado.

Tema a ser desenvolvido: ${title} - ${description}
`;
        break;
      }
    }
  }

  const startDate = new Date();

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content,
      },
    ],

    model: "gpt-4o",
  });

  const endDate = new Date();
  // console.log(endDate.getTime() - startDate.getTime());

  // gpt-5-2025-08-07

  return { message: chatCompletion.choices[0].message.content };
};

export const storytellingModels = {
  carrossel: {
    storytelling: {
      title: "Storytelling Clássico",
      structure: `
  <h4>Slide 1</h4>
  <p>Gancho forte, emocional ou provocativo</p>
  <h4>Slide 2</h4>
  <p>Contexto inicial do personagem ou situação</p>
  <h4>Slide 3</h4>
  <p>Desejo ou objetivo do personagem</p>
  <h4>Slide 4</h4>
  <p>Obstáculo, desafio ou conflito</p>
  <h4>Slide 5</h4>
  <p>Virada, descoberta ou mudança</p>
  <h4>Slide 6</h4>
  <p>Resultado ou transformação</p>
  <h4>Slide 7</h4>
  <p>Encerramento com chamada para ação (CTA)</p>
      `.trim(),
      effect: "Conexão emocional, empatia e identificação",
    },
    educacional: {
      title: "Educacional / Conteúdo Rico",
      structure: `
  <h4>Slide 1</h4>
  <p>Título claro que mostra o valor do conteúdo</p>
  <h4>Slide 2–6</h4>
  <p>Conceito explicado em blocos simples e objetivos</p>
  <h4>Slide Final</h4>
  <p>Conclusão resumida + CTA direto</p>
      `.trim(),
      effect: "Credibilidade, valor prático e autoridade",
    },
    checklist: {
      title: "Checklist / Passo a Passo",
      structure: `
  <h4>Slide 1</h4>
  <p>Promessa de transformação ou ganho ao seguir os passos</p>
  <h4>Slide 2–6</h4>
  <p>Etapas claras e numeradas</p>
  <h4>Slide Final</h4>
  <p>Reforço do benefício + chamada para ação</p>
      `.trim(),
      effect: "Organização, ação imediata e clareza",
    },
    mitos: {
      title: "Mitos vs Verdades",
      structure: `
  <h4>Slide 1</h4>
  <p>Mito forte que o público provavelmente acredita</p>
  <h4>Slide 2–6</h4>
  <p>Mito → Verdade explicada e justificada</p>
  <h4>Slide Final</h4>
  <p>Reflexão ou alerta + CTA</p>
      `.trim(),
      effect: "Quebra de crenças, educação com impacto",
    },
    comparativo: {
      title: "Comparativo / A vs B",
      structure: `
  <h4>Slide 1</h4>
  <p>Pergunta ou título provocativo do tipo: “Você faz isso ou aquilo?"</p>,
  <h4>Slide 2–6</h4>
  <p>Comparações (ex: antes/depois, certo/errado, com/sem)</p>
  <h4>Slide Final</h4>
  <p>Resumo e convite à ação ou reflexão</p>
      `.trim(),
      effect: "Valorização de solução, contraste visual e clareza",
    },
    frases: {
      title: "Frases Fragmentadas",
      structure: `
  <h4>Slide 1–6</h4>
  <p>Frases curtas, fortes e impactantes, uma por slide</p>
  <h4>Slide Final</h4>
  <p>Conclusão com moral + CTA emocional</p>
      `.trim(),
      effect: "Impacto emocional, estilo literário e compartilhamento",
    },
    bastidores: {
      title: "Bastidores / Diário Pessoal",
      structure: `
  <h4>Slide 1</h4>
  <p>Introdução de uma situação pessoal ou confissão real</p>
  <h4>Slide 2–5</h4>
  <p>Detalhes do que aconteceu, como se sentiu, o que fez</p>
  <h4>Slide Final</h4>
  <p>Aprendizado ou reflexão + CTA</p>
      `.trim(),
      effect: "Humanização, autenticidade e aproximação",
    },
    analise: {
      title: "Análise de Caso",
      structure: `
  <h4>Slide 1</h4>
  <p>Nome, contexto ou título do caso</p>
  <h4>Slide 2–5</h4>
  <p>Situação, análise, o que funcionou ou não</p>
  <h4>Slide Final</h4>
  <p>Aprendizado central + chamada pra ação</p>
      `.trim(),
      effect: "Autoridade técnica com provas reais",
    },
    refraseamento: {
      title: "Refraseamento Estratégico",
      structure: `
  <h4>Slide 1</h4>
  <p>Frase problemática ou erro comum de comunicação</p>
  <h4>Slide 2–5</h4>
  <p>Antes: como é dito errado / Depois: como falar melhor</p>
  <h4>Slide Final</h4>
  <p>Conclusão com reforço de clareza + CTA</p>
      `.trim(),
      effect: "Clareza de comunicação, evolução de linguagem",
    },
    critica: {
      title: "Crítica Construtiva",
      structure: `
  <h4>Slide 1</h4>
  <p>Declaração crítica ou provocativa</p>
  <h4>Slide 2–4</h4>
  <p>Justificativa, exemplos, argumentação</p>
  <h4>Slide Final</h4>
  <p>Nova perspectiva e convite à ação</p>
      `.trim(),
      effect: "Engajamento crítico, polarização saudável",
    },
    ctaInvertido: {
      title: "CTA Invertido",
      structure: `
  <h4>Slide 1</h4>
  <p>Chamada direta pra ação (ex: agende agora, leia isso etc.)</p>
  <h4>Slide 2–5</h4>
  <p>Justificativas e reforços para essa chamada</p>
  <h4>Slide Final</h4>
  <p>Encerramento e reforço emocional do CTA</p>
      `.trim(),
      effect: "Cliques rápidos, senso de urgência, mobilização",
    },
    guiaSituacional: {
      title: "Mini Guia de Situação",
      structure: `
  <h4>Slide 1</h4>
  <p>Cenário real ou dúvida comum</p>
  <h4>Slide 2–5</h4>
  <p>O que fazer, como agir, pontos de atenção</p>
  <h4>Slide Final</h4>
  <p>Resumo e orientação final + CTA</p>
      `.trim(),
      effect: "Ajuda prática em contexto real, preparação",
    },
  } as const,
  reel: {
    storytelling: {
      title: "Storytelling Emocional",
      structure: `
  <h4>Gancho (0–3s)</h4>
  <p>Imagem ou fala que chama atenção. Pode ser um momento real ou uma pergunta provocativa.</p>
  <h4>Contexto (4–10s)</h4>
  <p>Apresentação rápida da situação ou personagem.</p>
  <h4>Conflito / Virada (10–20s)</h4>
  <p>Algo inesperado, preocupante ou revelador.</p>
  <h4>Transformação / Solução (20–35s)</h4>
  <p>O que mudou após a ação ou descoberta.</p>
  <h4>Encerramento + CTA (35–60s)</h4>
  <p>Reflexão final ou chamada direta: "Agende", "Compartilhe", "Comente".</p>
      `.trim(),
      effect: "Conexão profunda, emoção, identificação",
    },
    educacional: {
      title: "Reels Educacional",
      structure: `
  <h4>Gancho (0–3s)</h4>
  <p>Pergunta comum, erro frequente ou estatística chocante.</p>
  <h4>Explicação (4–15s)</h4>
  <p>Entregue o valor com clareza. Pode usar tópicos curtos.</p>
  <h4>Exemplificação (15–30s)</h4>
  <p>Mostre uma aplicação, um caso ou um visual que facilite o entendimento.</p>
  <h4>Resumo + CTA (30–60s)</h4>
  <p>“Se is"o faz sentido pra você… salva esse vídeo e compartilha."</p>,
      `.trim(),
      effect: "Credibilidade, autoridade, valor prático",
    },
    provocativo: {
      title: "Reels Provocativo",
      structure: `
  <h4>Frase de impacto (0–3s)</h4>
  <p>Algo que quebre expectativa, gere discordância ou dúvida.</p>
  <h4>Justificativa (4–15s)</h4>
  <p>Mostre por que você acredita naquilo. Exponha o erro comum.</p>
  <h4>Reenquadramento (15–30s)</h4>
  <p>Apresente uma nova forma de pensar sobre o assunto.</p>
  <h4>Fechamento + Convite à discussão (30–60s)</h4>
  <p>“Conco"da ou discorda? Me diz nos comentários."</p>,
      `.trim(),
      effect: "Engajamento polêmico, quebra de crenças, reação emocional",
    },
    checklist: {
      title: "Checklist em Reels",
      structure: `
  <h4>Introdução (0–3s)</h4>
  <p>“5 sin"is de que seu filho precisa de avaliação oftalmológica"</p>,
  <h4>Lista sequencial (4–25s)</h4>
  <p>Apresente os itens um por um, com texto e/ou voz. Use cortes rápidos.</p>
  <h4>Conclusão prática (25–45s)</h4>
  <p>“Se vo"ê marcou 2 ou mais… atenção!"</p>,
  <h4>Chamada direta (45–60s)</h4>
  <p>“Salva"esse vídeo e marque a consulta agora mesmo."</p>,
      `.trim(),
      effect: "Clareza, ação rápida, utilidade prática",
    },
    bastidor: {
      title: "Reels de Bastidor",
      structure: `
  <h4>Abertura natural (0–3s)</h4>
  <p>Imagem real, não roteirizada. Algo cotidiano.</p>
  <h4>Contexto leve (4–15s)</h4>
  <p>O que tá acontecendo? Por que você tá mostrando isso?</p>
  <h4>Momento-chave (15–30s)</h4>
  <p>Decisão, fala sincera ou reação espontânea que marca o vídeo.</p>
  <h4>Reflexão (30–45s)</h4>
  <p>“Nem t"do mundo mostra isso. Mas é aqui que tudo acontece."</p>,
  <h4>Encerramento (45–60s)</h4>
  <p>“Se vo"ê gostou de ver esse lado, comenta aqui."</p>,
      `.trim(),
      effect: "Humanização, verdade, aproximação real com o público",
    },
    mitos: {
      title: "Reels Mitos vs Verdades",
      structure: `
  <h4>Introdução provocativa (0–3s)</h4>
  <p>“Você "cha que coçar o olho é normal? MITO."</p>,
  <h4>Mito 1 + Verdade (4–15s)</h4>
  <p>Explica rapidamente e com clareza.</p>
  <h4>Mito 2 + Verdade (15–30s)</h4>
  <p>Continua mostrando contradições comuns.</p>
  <h4>Resumo e CTA (30–60s)</h4>
  <,p>“Agora"você já sabe. Compartilhe com quem ainda acha que isso é bobagem."</,p>
      `.trim(),
      effect: "Choque informativo, reposicionamento mental",
    },
    textOnly: {
      title: "Reels de Texto Sequencial",
      structure: `
  <h4>Slide 1 (0–3s)</h4>
  <p>Frase de impacto ou provocação inicial. Ex: “Você não percebe, mas tá perdendo " visão dele."</p>,
  <h4>Slide 2 (4–8s)</h4>
  <p>Frase ": Tensão crescente. Ex: “Coçar o olho TODO DIA não é normal."</p>,
  <h4>Slide 3 (8–13s)</h4>
  <p>Frase 3: Início de solução. Ex: “Pode ser alergia ocular. Pode ser ceratocon"."</p>,
  <h4>Slide 4 (13–18s)</h4>
  <,p>Frase ": Consequência real. Ex: “Ignorar agora pode custar caro depois."</,p>
  <h4>Slide 5 (18–25s)</h4>
  <p>Frase final + CTA. Ex: “Leve pro especialista. Marque a consulta. Não espera pi"rar."</p>,
      `.trim(),
      effect:
        "Impacto emocional rápido, fácil consumo, altamente compartilhável",
    },
  } as const,

  titulos: {
    question: {
      title: "Pergunta Provocativa",
      structure:
        "Use uma pergunta que provoque reflexão ou insegurança no leitor.",
      examples: [
        "Seu filho coça os olhos... ou você que não quer ver o problema?",
        "Você esperaria seu filho reclamar de dor pra marcar uma consulta?",
        "Por que ninguém te contou isso sobre alergia ocular infantil?",
      ],
    },
    statement: {
      title: "Declaração Impactante",
      structure: "Faça uma afirmação curta e direta que choque ou intrigue.",
      examples: [
        "Coçar o olho TODO DIA não é normal.",
        "Ignorar hoje pode custar a visão amanhã.",
        "A visão do seu filho tá pedindo socorro. E você não percebeu.",
      ],
    },
    promise: {
      title: "Promessa Direta",
      structure: "Mostre o benefício claro que o conteúdo vai entregar.",
      examples: [
        "3 formas simples de evitar problemas visuais em crianças",
        "Como proteger a visão do seu filho com uma ação por mês",
        "O passo a passo para evitar danos causados por alergia ocular",
      ],
    },
    error: {
      title: "Erro Comum",
      structure: "Apresente um erro que o público comete e não percebe.",
      examples: [
        "O erro silencioso que muitos pais cometem na introdução alimentar",
        "A coceira que parece inofensiva... mas não é",
        "Por que tratar em casa pode ser um problema sério",
      ],
    },
    checklist: {
      title: "Checklist camuflado",
      structure:
        "Antecipe que o conteúdo será uma lista sem entregar tudo no título.",
      examples: [
        "Se seu filho faz isso, você precisa ler esse post",
        "5 sinais de que algo está errado com a visão do seu filho",
        "Como saber se essa coceira é realmente só uma alergia",
      ],
    },
    story: {
      title: "Story Hook",
      structure:
        "Comece com uma frase de história real ou fictícia, gerando tensão.",
      examples: [
        "Achei que era só uma alergia. Hoje ele usa lente rígida.",
        "Ela só coçava o olho. Agora não consegue mais enxergar sem ajuda.",
        "Tudo começou com um colírio. E terminou numa cirurgia.",
      ],
    },
    contrast: {
      title: "Choque de Realidade",
      formula: "Crie contraste entre o que as pessoas pensam e a realidade.",
      examples: [
        "Você acha que coçar o olho é normal? A ciência diz outra coisa.",
        "A maioria só age quando é tarde demais.",
        "Não é frescura. É ceratocone em estágio inicial.",
      ],
    },
  } as const,
  legenda: {
    complementary: {
      title: "Complementar",
      description:
        "Expande o conteúdo do carrossel ou Reels com explicações adicionais.",
      effect:
        "Aprofunda a mensagem e gera autoridade através de clareza e contexto.",
      useWhen:
        "Quando o post é mais visual ou resumido e precisa de um complemento explicativo.",
    },
    confessional: {
      title: "Confessional",
      description:
        "Traz vulnerabilidade, bastidores e humanidade. Fala de forma pessoal.",
      effect: "Gera empatia e conexão emocional com o público.",
      useWhen: "Quando você quer humanizar a marca ou reforçar autenticidade.",
    },
    educational: {
      title: "Educativa",
      description:
        "Funciona como um mini-post técnico ou informativo na legenda.",
      effect: "Constrói autoridade, educa e gera salvamentos.",
      useWhen:
        "Quando o conteúdo tem potencial técnico e valor didático por si só.",
    },
    provocative: {
      title: "Provocativa",
      description:
        "Continua o tom de tensão ou desconstrução do conteúdo principal.",
      effect: "Choca, provoca reflexão ou engajamento emocional forte.",
      useWhen:
        "Quando você quer manter o impacto do post e incentivar reação ou debate.",
    },
    conversational: {
      title: "Conversacional",
      description: "Texto leve e direto, como um papo informal com o seguidor.",
      effect: "Gera proximidade, facilita comentários e compartilhamento.",
      useWhen:
        "Quando quer soar mais humano, gerar conversa e descomplicar o tom.",
    },
    emotionalPitch: {
      title: "Vendedora com Contexto Emocional",
      description:
        "Chama para ação de forma suave, com base em uma emoção real.",
      effect: "Gera conversão com empatia, sem parecer agressivo.",
      useWhen:
        "Quando você precisa vender consulta, produto ou serviço, mas com contexto sensível.",
    },

    checklistExplained: {
      title: "Checklist Prático com Explicação",
      description:
        "Lista enumerada com dicas e explicações diretas para o seguidor aplicar no dia a dia.",
      effect: "Organiza informações de forma clara, útil e com valor imediato.",
      useWhen:
        "Quando você quer entregar conteúdo prático que resolve dores ou dúvidas comuns.",
    },
    diagnosticList: {
      title: "Lista Diagnóstica",
      description:
        "Lista de comportamentos ou sinais que levam o seguidor a perceber um problema ou necessidade de ajuda.",
      effect: "Gera autoavaliação, senso de urgência e ação.",
      useWhen:
        "Quando você quer provocar o público e levá-lo à reflexão ou busca por atendimento.",
    },
    quickChecklist: {
      title: "Checklist Rápido",
      description:
        "Lista direta de itens para fazer ou evitar, sem explicações detalhadas.",
      effect: "Rapidez, clareza e consumo instantâneo.",
      useWhen:
        "Quando você quer entregar valor rápido ou reforçar visualmente uma ideia sem aprofundamento.",
    },

    descriptiveDesire: {
      title: "Desejo & Sensação (Gastronômico)",
      description:
        "Ativa o apetite e a curiosidade sensorial com frases que provocam a imaginação do sabor, textura e cheiro.",
      effect: "Gera desejo visceral e vontade imediata de provar.",
      useWhen:
        "Quando você quer apresentar um prato ou bebida e fazer o público salivar.",
    },
    processBackstage: {
      title: "Bastidor Real (Processo e Cuidado)",
      description:
        "Mostra os bastidores do preparo, segredos da cozinha ou diferenciais do produto.",
      effect: "Valorização do trabalho artesanal e percepção de qualidade.",
      useWhen:
        "Quando você quer mostrar que o produto é feito com atenção e não é mais do mesmo.",
    },
    eitherOr: {
      title: "Escolha do Dia (Interativo)",
      description:
        "Compara duas opções e estimula a participação do seguidor com perguntas simples.",
      effect: "Engajamento leve e interação nos comentários.",
      useWhen:
        "Quando você quer movimentar o perfil sem necessariamente fazer uma oferta.",
    },
    provocativeTaste: {
      title: "Provocação Gastronômica",
      description:
        "Posiciona o produto contra opções de baixa qualidade, ativando o senso de merecimento do público.",
      effect: "Reposicionamento com personalidade, reforça diferenciação.",
      useWhen:
        "Quando você quer mostrar que seu produto vale mais que o concorrente genérico.",
    },
    memoryHook: {
      title: "História & Emoção (Memória Afetiva)",
      description:
        "Usa storytelling afetivo para conectar o prato a lembranças, família ou tradições.",
      effect: "Conexão emocional e valorização simbólica do produto.",
      useWhen: "Quando você quer humanizar a marca e criar vínculo afetivo.",
    },
    tastyGuide: {
      title: "Guia de Combinações (Mini Educativo)",
      description:
        "Sugere combinações de sabores, harmonizações ou dicas gastronômicas práticas.",
      effect: "Autoridade leve + inspiração imediata.",
      useWhen: "Quando você quer ensinar e entreter ao mesmo tempo.",
    },
  },

  stories: {
    miniStory: {
      title: "Mini Story (Jornada Pessoal ou de um Paciente)",
      structure: `
    <h4>Story 1</h4>
    <p>“Deixa"eu te contar uma coisa que aconteceu…"</p>,
    <h4>Story 2</h4>
    <p>Situação incômoda ou início do problema</p>
    <h4>Story 3</h4>
    <p>Virada ou descoberta</p>
    <h4>Story 4</h4>
    <p>Solução aplicada ou conselho</p>
    <h4>Story 5</h4>
    <p>CTA le"e: “Responde aqui", “Me chama", “Desliza pro lado"</p>,
        `.trim(),
      effect: "Conexão e identificação com a audiência",
      useWhen: "Quando quiser gerar empatia e contexto antes de converter",
    },
    triviaStory: {
      title: "Você Sabia? (Storytelling Educacional + Curiosidade)",
      structure: `
    <h4>Story 1</h4>
    <p>Pergunta intrigante ou dado curioso</p>
    <h4>Story 2</h4>
    <p>Explicação simplificada com contexto</p>
    <h4>Story 3</h4>
    <p>“Isso "contece porque…"</p>,
    <h4>Story 4</h4>
    <p>Dica ou orientação prática</p>
    <h4>Story 5</h4>
    <p>CTA: “"uer saber mais? Me chama ou clica no link"</p>,
        `.trim(),
      effect: "Educação com valor prático",
      useWhen: "Quando quiser ensinar sem parecer palestra",
    },
    errorChallenge: {
      title: "Desafio ou Erro Comum",
      structure: `
    <h4>Story 1</h4>
    <p>“Se vo"ê faz isso com seu filho…"</p>,
    <h4>Story 2</h4>
    <p>Expõe o erro ou crença comum</p>
    <h4>Story 3</h4>
    <p>Mostra o risco/consequência</p>
    <h4>Story 4</h4>
    <p>“Aqui "á o que eu recomendo"</p>,
    <h4>Story 5</h4>
    <p>CTA com caixa de pergunta, DM ou link</p>
        `.trim(),
      effect: "Tensão e correção de rota",
      useWhen: "Quando quiser desafiar, reposicionar ou vender",
    },
    timeline: {
      title: "Linha do Tempo",
      structure: `
    <h4>Story 1</h4>
    <p>“Antes"" (como era a situação)</p>,
    <h4>Story 2</h4>
    <p>“O que"estava dando errado"</p>,
    <h4>Story 3</h4>
    <p>“O que"mudou"</p>,
    <h4>Story 4</h4>
    <p>“Como "stá hoje"</p>,
    <h4>Story 5</h4>
    <p>CTA com print, depoimento ou agendamento</p>
        `.trim(),
      effect: "Prova social e construção de autoridade",
      useWhen: "Quando quiser mostrar transformação real",
    },
    interactiveDecision: {
      title: "Você Faria Isso? (Decisão Interativa)",
      structure: `
    <h4>Story 1</h4>
    <p>Situaç"o real: “A criança coça o olho todo dia…"</p>,
    <h4>Story 2</h4>
    <p>Enquete com decisão (ex: Levar no médico / Esperar?)</p>
    <h4>Story 3</h4>
    <p>Revelação do certo com justificativa</p>
    <h4>Story 4</h4>
    <p>Explicação educativa breve</p>
    <h4>Story 5</h4>
    <p>CTA: “"uer mais? Responde aqui"</p>,
        `.trim(),
      effect: "Engajamento + educação + leads quentes",
      useWhen: "Quando quiser puxar interação e começar diálogo",
    },
    empathyPulse: {
      title: "Você Se Identifica? (Reflexão com Dor e Consolo)",
      structure: `
    <h4>Story 1</h4>
    <p>“Você "ente isso também?"</p>,
    <h4>Story 2</h4>
    <p>Descreve um problema emocional ou comum</p>
    <h4>Story 3</h4>
    <p>Mostra que outras pessoas passam por isso</p>
    <h4>Story 4</h4>
    <p>Apresenta solução ou direção</p>
    <h4>Story 5</h4>
    <p>CTA com caixinha ou convite pra conversar</p>
        `.trim(),
      effect: "Acolhimento e conversão suave",
      useWhen: "Quando o público tá na dor, mas ainda resiste à venda",
    },
  } as const,
};

type SintagmaType = {
  id: string;
  title: string;
  description: string;
  missions: {
    id: string;
    title: string;
    tension: string;
    role: string;
    tactics: {
      id: string;
      title: string;
      examples: string[];
    }[];
  }[];
};

export const SintagmaHooks: SintagmaType[] = [
  {
    id: "t1",
    title: "Encantar",
    description: `Cria tensão, desperta curiosidade e \nplanta a pergunta certa.`,
    missions: [
      {
        id: "t1-m1",
        title: "Criar Curiosidade",
        tension: "O que é isso?",
        role: "Parar o scroll",
        tactics: [
          {
            id: "t1-m1-t1",
            title: "Frase incompleta",
            examples: [
              "[pessoa] [fazia algo]... mas [algo não estava certo]",
              "[ação cotidiana]... até [quebra de expectativa]",
              "[rotina comum]... mas [detalhe estranho]",
            ],
          },
          {
            id: "t1-m1-t2",
            title: "Afirmação ambígua",
            examples: [
              "[situação comum]... ou era só o que parecia?",
              "[algo positivo]... e também [algo negativo]",
              "[pessoa] [parecia bem]... mas [sentia o oposto]",
            ],
          },
          {
            id: "t1-m1-t3",
            title: "Mini enigma",
            examples: [
              "[pessoa] [via o óbvio]... mas ignorava o essencial",
              "[cliente] [agia normalmente]... mas algo não batia",
              "[rotina] [se repetia]... mas com uma falha sutil",
            ],
          },
          {
            id: "t1-m1-t4",
            title: "Microcontraste",
            examples: [
              "[ação habitual] x [efeito inesperado]",
              "[palavra positiva] + [palavra desconfortável]",
              "[expressão comum] com [significado oculto]",
            ],
          },
          {
            id: "t1-m1-t5",
            title: "Suspense visual",
            examples: [
              "[imagem ambígua] com [legenda neutra]",
              "[detalhe fora do lugar] sem explicação",
              "[situação aparentemente normal] com [tensão não declarada]",
            ],
          },
        ],
      },
      {
        id: "t1-m2",
        title: "Causar contraste de percepção",
        tension: "Como nunca percebi isso antes?",
        role: "Quebrar expectativa com comparação",
        tactics: [
          {
            id: "t1-m2-t1",
            title: "Antes x Depois",
            examples: [
              "[pessoa] [fazia algo comum]... antes de [evento revelador]",
              "[cliente] [reagia de um jeito]... agora [muda completamente]",
              "[contexto antigo] x [nova percepção]",
            ],
          },
          {
            id: "t1-m2-t2",
            title: "Frase paradoxal",
            examples: [
              "[ação positiva]... que gerava [resultado negativo]",
              "[situação confortável]... com efeito devastador",
              "[aparência saudável]... com raiz problemática",
            ],
          },
          {
            id: "t1-m2-t3",
            title: "Tese provocativa",
            examples: [
              "[crença comum]... mas nunca foi verdade",
              "[ideia popular]... que esconde um erro perigoso",
              "[frase pronta]... que precisa ser revista",
            ],
          },
          {
            id: "t1-m2-t4",
            title: "Dupla imagem mental",
            examples: [
              "[situação segura]... que esconde [risco oculto]",
              "[rotina leve]... com fundo silencioso de alerta",
              "[ambiente previsível]... com detalhe revelador",
            ],
          },
        ],
      },
      {
        id: "t1-m3",
        title: "Gerar desejo aspiracional",
        tension: "Quero isso pra mim.",
        role: "Mostrar o que está em jogo",
        tactics: [
          {
            id: "t1-m3-t1",
            title: "Imagem mental",
            examples: [
              "[pessoa] [alcançando algo] que antes parecia distante",
              "[cliente] [vivendo situação ideal] após [escolha simples]",
              "[futuro desejável] construído a partir de [decisão atual]",
            ],
          },
          {
            id: "t1-m3-t2",
            title: "Cena aspiracional",
            examples: [
              "[momento emocional positivo] que só existe por causa de [ação anterior]",
              "[resultado concreto] acompanhado de [realização subjetiva]",
              "[benefício tangível] somado a [sensação intangível]",
            ],
          },
          {
            id: "t1-m3-t3",
            title: "Frase de projeção",
            examples: [
              "Imagina se [resultado ideal]... a partir de [ação simples]",
              "E se [mudança pequena] levasse a [conquista significativa]?",
              "Imagina [novo cenário] daqui a [período de tempo]",
            ],
          },
        ],
      },
      {
        id: "t1-m4",
        title: "Provocar ruptura de crença",
        tension: "O que te contaram está errado.",
        role: "Desconstruir certezas populares",
        tactics: [
          {
            id: "t1-m4-t1",
            title: "Frase negativa",
            examples: [
              "[afirmação comum] não é verdade.",
              "Não é [crença popular] — é [realidade ignorada].",
              "[pessoa] nunca precisou de [solução padrão].",
            ],
          },
          {
            id: "t1-m4-t2",
            title: "Pergunta provocativa",
            examples: [
              "Você tem certeza que [crença estabelecida] faz mesmo sentido?",
              "E se [ação frequente] for justamente o problema?",
              "Por que [comportamento comum] ainda é aceito?",
            ],
          },
          {
            id: "t1-m4-t3",
            title: "Contraponto direto",
            examples: [
              "Você pensa que [X]... mas a verdade é [Y].",
              "[opinião geral]... só resiste até [fato contraditório].",
              "Parece lógico fazer [ação]... até entender [consequência real].",
            ],
          },
        ],
      },
      {
        id: "t1-m5",
        title: "Causar impacto emocional direto",
        tension: "Isso me tocou.",
        role: "Gerar empatia imediata",
        tactics: [
          {
            id: "t1-m5-t1",
            title: "Micro-desabafo",
            examples: [
              "[pessoa] [reconhece algo] que fingia não ver",
              "[cliente] [revela sentimento] guardado por muito tempo",
              "[situação difícil] dita com simplicidade crua",
            ],
          },
          {
            id: "t1-m5-t2",
            title: "História real",
            examples: [
              "[personagem] [viveu algo marcante] que mudou a forma de ver tudo",
              "[relato breve] de [transformação emocional]",
              "[experiência concreta] com final inesperado",
            ],
          },
          {
            id: "t1-m5-t3",
            title: "Frase sensível",
            examples: [
              "[sentença curta] que atinge direto o ponto frágil",
              "[fala íntima] que ecoa no público",
              "[verdade simples] que ninguém tinha coragem de dizer",
            ],
          },
        ],
      },
      {
        id: "t1-m6",
        title: "Despertar senso de urgência",
        tension: "E se for tarde demais?",
        role: "Criar atenção imediata",
        tactics: [
          {
            id: "t1-m6-t1",
            title: "Pergunta com consequência",
            examples: [
              "E se [algo grave] já estiver acontecendo sem você perceber?",
              "Quanto tempo mais você vai esperar por [ação necessária]?",
              "E se [sintoma ignorado] for o primeiro sinal de [problema maior]?",
            ],
          },
          {
            id: "t1-m6-t2",
            title: "Frase de alerta velado",
            examples: [
              "[comportamento comum] parece inofensivo… até não ser mais.",
              "O problema não aparece de repente — ele avisa em silêncio.",
              "Nem toda urgência grita. Algumas só somem se ignoradas.",
            ],
          },
          {
            id: "t1-m6-t3",
            title: "Risco implícito",
            examples: [
              "[situação aparentemente normal] que esconde [consequência invisível]",
              "[pessoa] [age como sempre]... mas o custo está aumentando",
              "[rotina comum]... com prazo que ninguém vê chegando",
            ],
          },
        ],
      },
      {
        id: "t1-m7",
        title: "Instigar a imaginação (Mistério)",
        tension: "Tem algo aqui... mas não sei o quê.",
        role: "Criar fascínio cognitivo",
        tactics: [
          {
            id: "t1-m7-t1",
            title: "Metáfora simbólica",
            examples: [
              "[objeto comum] como metáfora para [questão profunda]",
              "[ação banal] representando [estado emocional]",
              "[imagem física] que expressa [conflito interno]",
            ],
          },
          {
            id: "t1-m7-t2",
            title: "Comparação inusitada",
            examples: [
              "[situação inesperada] comparada a [problema real]",
              "[comportamento cotidiano] descrito como [fenômeno estranho]",
              "[algo simples] que funciona como espelho de [algo complexo]",
            ],
          },
          {
            id: "t1-m7-t3",
            title: "Frase abstrata",
            examples: [
              "[declaração enigmática] com fundo desconfortável",
              "[afirmação poética] que esconde tensão real",
              "[frase aberta] que convida à interpretação",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t2",
    title: "Envolver",
    description:
      "Conteúdo que cria identificação, quebra \nresistência e constrói proximidade.",
    missions: [
      {
        id: "t2-m1",
        title: "Gerar Identificação Emocional",
        tension: "Isso parece comigo.",
        role: "Criar conexão real com o público",
        tactics: [
          {
            id: "t2-m1-t1",
            title: "Mini relato",
            examples: [
              "[pessoa] [vivenciou algo simples] que gerou [sentimento oculto]",
              "[cliente] [conta uma situação] que parecia pequena… mas marcou",
              "[rotina cotidiana] revelando [conflito interno]",
            ],
          },
          {
            id: "t2-m1-t2",
            title: "Dilema comum",
            examples: [
              "[pessoa] [enfrenta escolha] entre [ação desejada] e [obrigação silenciosa]",
              "[cliente] [fica em dúvida] sobre [decisão comum]",
              "[comportamento repetido] que esconde [incômodo não verbalizado]",
            ],
          },
          {
            id: "t2-m1-t3",
            title: "Confissão indireta",
            examples: [
              "[pessoa] [reconhece em pensamento] o que evita dizer em voz alta",
              "[cliente] [age como se nada]... mas sente tudo",
              "[situação simples] que traduz [conflito pessoal]",
            ],
          },
          {
            id: "t2-m1-t4",
            title: "Detalhe revelador",
            examples: [
              "[gesto pequeno] revela [cansaço acumulado]",
              "[frase solta] entrega [emoção não dita]",
              "[escolha sutil] mostra [peso invisível da rotina]",
            ],
          },
        ],
      },
      {
        id: "t2-m2",
        title: "Validar Dores Silenciosas",
        tension: "Não sou exagerado.",
        role: "Acolher e dar nome ao que é real",
        tactics: [
          {
            id: "t2-m2-t1",
            title: "Frase de alívio",
            examples: [
              "Não, [sentimento] não é exagero.",
              "Você não está louco por [perceber aquilo].",
              "[pessoa] não está sozinha ao sentir [emoção recorrente].",
            ],
          },
          {
            id: "t2-m2-t2",
            title: "Aval do especialista",
            examples: [
              "[especialista] confirma que [comportamento comum] é sinal legítimo de [problema real].",
              "[profissional confiável] explica por que [dúvida recorrente] faz sentido.",
              "A ciência já mostrou: [sintoma negligenciado] tem causa concreta.",
            ],
          },
          {
            id: "t2-m2-t3",
            title: "Sinal ignorado",
            examples: [
              "[sintoma] parecia bobo... mas tinha motivo real.",
              "[pessoa] achava que era coisa da cabeça... até entender o que era.",
              "[comportamento sutil] sempre esteve ali, só faltava alguém notar.",
            ],
          },
          {
            id: "t2-m2-t4",
            title: "Normalização da dúvida",
            examples: [
              "Sim, é normal se perguntar se [situação estranha] é exagero.",
              "Você não é o único que sente [emoção difícil de nomear].",
              "[dúvida recorrente] passa pela cabeça de muita gente.",
            ],
          },
        ],
      },
      {
        id: "t2-m3",
        title: "Humanizar a Jornada",
        tension: "Dá pra chegar lá.",
        role: "Mostrar que o processo é possível — e real",
        tactics: [
          {
            id: "t2-m3-t1",
            title: "Mini timeline",
            examples: [
              "[fase inicial] → [fase de incerteza] → [virada]",
              "[pessoa] começou com [dificuldade] e chegou em [mudança concreta]",
              "[caminho real] com [altos e baixos visíveis]",
            ],
          },
          {
            id: "t2-m3-t2",
            title: "Cenas reais",
            examples: [
              "[momento simples] que representa [conquista emocional]",
              "[fragmento de rotina] que carrega [simbolismo forte]",
              "[situação banal] com [sentido revelador]",
            ],
          },
          {
            id: "t2-m3-t3",
            title: "Fase 1 → Fase 2",
            examples: [
              "[pessoa] dizia que [negação inicial]... hoje diz que [confirmação atual]",
              "[cliente] sentia [barreira]... agora reconhece [resultado]",
              "[rotina] passou de [caos] para [cuidado]",
            ],
          },
          {
            id: "t2-m3-t4",
            title: "Falha comum",
            examples: [
              "[erro recorrente] que muita gente comete ao tentar [resolver algo]",
              "[passo apressado] que atrasa o resultado",
              "[expectativa irreal] que gera frustração antes da virada",
            ],
          },
        ],
      },
      {
        id: "t2-m4",
        title: "Mostrar o Quebra-Cabeça Invisível",
        tension: "Agora tudo faz sentido.",
        role: "Revelar relações antes invisíveis",
        tactics: [
          {
            id: "t2-m4-t1",
            title: "Causa oculta",
            examples: [
              "[sintoma atual] na verdade vinha de [ação antiga]",
              "[problema percebido] começou onde ninguém olhou",
              "[efeito visível] tinha uma raiz inesperada",
            ],
          },
          {
            id: "t2-m4-t2",
            title: "Sintoma negligenciado",
            examples: [
              "[sinal pequeno] era ignorado... até se tornar impossível de esconder",
              "[comportamento estranho] se repetia... e ninguém questionava por quê",
              "[detalhe recorrente] era só o começo",
            ],
          },
          {
            id: "t2-m4-t3",
            title: "Correlação ignorada",
            examples: [
              "[situação cotidiana] estava diretamente ligada a [efeito não percebido]",
              "[duas ações comuns] que parecem independentes... mas andam juntas",
              "[hábito corriqueiro] alimentava o problema silenciosamente",
            ],
          },
          {
            id: "t2-m4-t4",
            title: "Gatilho cotidiano",
            examples: [
              "[evento comum] disparava [reação intensa]",
              "[situação rotineira] virava gatilho para [sintoma recorrente]",
              "[ambiente] reforçava o que a pessoa tentava mudar",
            ],
          },
        ],
      },
      {
        id: "t2-m5",
        title: "Explorar o Custo da Inércia",
        tension: "Não fazer nada tem preço.",
        role: "Mostrar as perdas de quem espera demais",
        tactics: [
          {
            id: "t2-m5-t1",
            title: "Efeito bola de neve",
            examples: [
              "[problema pequeno] virou [consequência grande] com o tempo",
              "[atraso inicial] gerou [complicação evitável]",
              "[sintoma ignorado] alimentou [efeito colateral contínuo]",
            ],
          },
          {
            id: "t2-m5-t2",
            title: "Micro consequência",
            examples: [
              "[ação simples não tomada] gerou [inconveniência diária]",
              "[decisão adiada] afetou [dinâmica silenciosa]",
              "[adiamento] virou [peso invisível]",
            ],
          },
          {
            id: "t2-m5-t3",
            title: "Omissão perigosa",
            examples: [
              "[escolha de não agir] trouxe [risco subestimado]",
              "[falha em decidir] aumentou o dano sem alarde",
              "[silêncio constante] impediu [melhoria possível]",
            ],
          },
          {
            id: "t2-m5-t4",
            title: "Fuga silenciosa",
            examples: [
              "[pessoa] dizia que era cansaço... mas era medo",
              "[cliente] evitava olhar para [realidade desconfortável]",
              "[rotina] ajudava a disfarçar o problema",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t3",
    title: "Educar",
    description: "A missão é tornar o invisível óbvio\ne o óbvio, estratégico.",
    missions: [
      {
        id: "t3-m1",
        title: "Criar Clareza e Direção",
        tension: "Agora entendi. Por que ninguém explicou assim antes?",
        role: "Educação objetiva",
        tactics: [
          {
            id: "t3-m1-t1",
            title: "Mito vs Verdade",
            examples: [
              "[pessoa] acreditava que [crença comum]... mas a verdade é [fato direto]",
              "muita gente pensa que [mito]... só que [verdade]",
              "[cliente] insistia em [comportamento baseado em mito]... até entender [nova visão]",
            ],
          },
          {
            id: "t3-m1-t2",
            title: "Decisão Certa x Errada",
            examples: [
              "ao invés de [decisão errada], o ideal seria [decisão certa]",
              "[pessoa] escolheu [opção ruim] e colheu [consequência]… agora prefere [caminho correto]",
              "entre [caminho A] e [caminho B], só um leva a [resultado estratégico]",
            ],
          },
          {
            id: "t3-m1-t3",
            title: "Antes e Depois mental",
            examples: [
              "antes, [pensamento antigo]… depois, [mudança de visão]",
              "[cliente] achava que [crença]… hoje vê que [enquadramento novo]",
              "[pessoa] saiu de [mentalidade limitada] para [nova percepção]",
            ],
          },
          {
            id: "t3-m1-t4",
            title: "Checklist de realidade",
            examples: [
              "se você está em [situação], talvez precise rever: [lista de pontos]",
              "confira se você já tem: [checklist prático]",
              "quem quer [resultado] precisa garantir: [itens essenciais]",
            ],
          },
        ],
      },
      {
        id: "t3-m2",
        title: "Derrubar Objeções Silenciosas",
        tension: "Eu sempre pensei isso, mas nunca tinha percebido o erro.",
        role: "Desbloqueio de venda",
        tactics: [
          {
            id: "t3-m2-t1",
            title: "Objeção comum",
            examples: [
              "[pessoa] acredita que [objeção comum]… mas [racionalização que desmonta o argumento]",
              "muita gente ainda repete que [mito popular]… só que isso não se sustenta",
              "dizem que [crença limitante]… mas o que ninguém explica é [resposta lógica]",
            ],
          },
          {
            id: "t3-m2-t2",
            title: "Pergunta camuflada",
            examples: [
              "[pergunta típica do público]… mas será que [reflexão que expõe a falha da lógica]?",
              "será mesmo que [crença do público]… ou só parece verdade porque [fator psicológico]?",
              "por que [comportamento comum] ainda é visto como normal… se [consequência negativa]?",
            ],
          },
          {
            id: "t3-m2-t3",
            title: "Micro comparação",
            examples: [
              "[ação equivocada] é como [situação do dia a dia]… parece certo, mas gera o efeito contrário",
              "imagina se [comparação banal]… pois é exatamente o que [público] faz quando [ação]",
              "[decisão errada] se parece com [exemplo cotidiano]… mas o resultado é bem pior",
            ],
          },
          {
            id: "t3-m2-t4",
            title: "Racional + Consequência",
            examples: [
              "se [ação baseada na objeção], então [consequência negativa]",
              "seguir acreditando que [mito comum] resolve… só adia o problema",
              "[cliente] insistia em [ação errada]… até perceber que isso custava [resultado perdido]",
            ],
          },
        ],
      },

      {
        id: "t3-m3",
        title: "Construir Referência Técnica",
        tension: "Essa pessoa realmente sabe o que está fazendo.",
        role: "Construção de autoridade",
        tactics: [
          {
            id: "t3-m3-t1",
            title: "Explicação com metáfora",
            examples: [
              "[condição] é como [comparação visual simples e concreta]",
              "Imagine que [órgão afetado] é uma [metáfora visual do problema]",
              "[comportamento percebido] pode ser como [analogia inesperada]",
            ],
          },
          {
            id: "t3-m3-t2",
            title: "Glossário vivo",
            examples: [
              "Você vê [termo comum usado pelo público]. Eu vejo [termo técnico estratégico]",
              "Muita gente chama de [expressão popular], mas tecnicamente é [termo real]",
              "[sintoma visível] é na verdade [explicação científica contextualizada]",
            ],
          },
          {
            id: "t3-m3-t3",
            title: "Mini-análise clínica",
            examples: [
              "[paciente fictício] chegou com [sintoma específico]... e o que encontrei foi [diagnóstico técnico]",
              "Pelo histórico, parecia [diagnóstico óbvio], mas o que descobri foi [conclusão menos intuitiva]",
              "Ao analisar [comportamento/sintoma], percebi um padrão: [conclusão didática]",
            ],
          },
          {
            id: "t3-m3-t4",
            title: "Diagnóstico reverso",
            examples: [
              "[conclusão] só foi possível depois de observar [sinais anteriores]",
              "A partir de [comportamento inicial], entendi que [ponto técnico mais profundo]",
              "Cheguei em [recomendação final] voltando em [causa raiz percebida]",
            ],
          },
        ],
      },
      {
        id: "t3-m4",
        title: "Reforçar Princípios Não Negociáveis",
        tension: "Não é sobre agradar. É sobre deixar claro como funciona.",
        role: "Posicionamento",
        tactics: [
          {
            id: "t3-m4-t1",
            title: "Manifesto direto",
            examples: [
              "Se for só pra [ação superficial], não sou a pessoa certa.",
              "Aqui a gente [princípio forte] — sempre.",
              "Se você quer [atitude oposta ao valor], procura outro perfil.",
            ],
          },
          {
            id: "t3-m4-t2",
            title: "Prática reprovada",
            examples: [
              "Tem [profissional/clínica] que faz [ação antiética]. Aqui não.",
              "Não uso [prática comum] pra disfarçar [problema grave].",
              "O mercado até tolera [absurdo], mas aqui a gente denuncia.",
            ],
          },
          {
            id: "t3-m4-t3",
            title: "Regras da casa",
            examples: [
              "O olho do seu filho não é [coisa trivial]. Aqui a gente trata com [base científica].",
              "Aqui só entra [perfil de cliente ideal].",
              "Antes de qualquer coisa, a gente [regra clara de conduta].",
            ],
          },
          {
            id: "t3-m4-t4",
            title: "Critério de decisão",
            examples: [
              "[Resultado rápido] parece bom, mas o que importa mesmo é [critério profissional].",
              "Na hora de escolher [profissional], veja se ele [ponto de integridade].",
              "Quer saber se dá pra confiar? Veja se ele faz [critério de postura].",
            ],
          },
        ],
      },
      {
        id: "t3-m5",
        title: "Ancorar valor com provas reais",
        tension: "Se funcionou pra ela, talvez funcione pra mim também.",
        role: "Validação e prova social",
        tactics: [
          {
            id: "t3-m5-t1",
            title: "Relato breve",
            examples: [
              "a mãe achava que [comportamento da criança], hoje se emociona ao ver [nova conquista]",
              "antes [pessoa] evitava [ação], agora faz questão de [novo comportamento]",
              "[paciente] dizia que [resistência], agora não vive sem [solução aplicada]",
            ],
          },
          {
            id: "t3-m5-t2",
            title: "Antes e depois real",
            examples: [
              "antes [situação antiga], agora [situação transformada]",
              "no começo, [dificuldade], hoje [facilidade conquistada]",
              "[cliente] passou de [estado anterior] para [novo resultado]",
            ],
          },
          {
            id: "t3-m5-t3",
            title: "Situação–resolução",
            examples: [
              "foi difícil aceitar que [problema], mas quando entendeu, tudo mudou",
              "no início, [desafio], depois de [intervenção], [resultado alcançado]",
              "a jornada começou com [dúvida ou resistência], e terminou com [transformação]",
            ],
          },
          {
            id: "t3-m5-t4",
            title: "Citação com contexto",
            examples: [
              "‘[frase real do cliente]’, foi o que ela me disse. E por isso eu sabia que [decisão clínica]",
              "‘[fala marcante]’ — é nesse tipo de comentário que a gente vê o impacto do processo",
              "quando ela disse ‘[citação]’, eu entendi que [contexto profissional aplicado]",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t4",
    title: "Converter",
    description:
      "Conteúdo que resolve objeções, fortalece decisão \ne faz o público atravessar.",
    missions: [
      {
        id: "t4-m1",
        title: "Gerar Urgência com Contexto",
        tension: "Se não agir agora, o custo pode ser invisível — mas real.",
        role: "Estímulo à ação imediata",
        tactics: [
          {
            id: "t4-m1-t1",
            title: "Janela de oportunidade",
            examples: [
              "Essa é a última [ação ou evento] do semestre. E sim, elas esgotam.",
              "Não é todo dia que [condição especial] aparece de novo.",
              "Essa janela de [oportunidade] fecha — e não reabre tão cedo.",
            ],
          },
          {
            id: "t4-m1-t2",
            title: "Perda silenciosa",
            examples: [
              "Cada semana sem [ação importante] pode significar [impacto futuro].",
              "[pessoa] achou que podia esperar… e perdeu [benefício concreto].",
              "O que parece pouco hoje, vira prejuízo amanhã.",
            ],
          },
          {
            id: "t4-m1-t3",
            title: "Situação irreversível",
            examples: [
              "O desenvolvimento [físico/cognitivo] fecha. Não reabre aos [idade].",
              "Se não agir agora, [consequência permanente] se instala.",
              "Tem coisas que não voltam. E o tempo é uma delas.",
            ],
          },
          {
            id: "t4-m1-t4",
            title: "Despertador emocional",
            examples: [
              "Marcar agora é prevenção. Marcar depois pode ser correção.",
              "O que tá barato hoje, pode sair caro amanhã.",
              "Esperar é uma escolha — mas a conta chega do mesmo jeito.",
            ],
          },
        ],
      },

      {
        id: "t4-m2",
        title: "Tornar a Oferta Óbvia",
        tension: "Faz mais sentido dizer sim do que continuar em dúvida.",
        role: "Clareza na decisão",
        tactics: [
          {
            id: "t4-m2-t1",
            title: "Oferta embutida",
            examples: [
              "Se você chegou até aqui, já sabe que precisa. Só falta [ação].",
              "[benefício] com [condição especial]. Não é sorteio. É oportunidade.",
              "Você não precisa decidir agora. Só precisa [ação mínima]. O resto, a gente cuida.",
            ],
          },
          {
            id: "t4-m2-t2",
            title: "Mini pitch direto",
            examples: [
              "[serviço] é pra quem [condição]. Resolve [problema específico].",
              "Rápido, simples e direto: [solução] pra [problema] com [benefício].",
              "[ação] porque é o próximo passo natural — sem pressão.",
            ],
          },
          {
            id: "t4-m2-t3",
            title: "Comparação de decisão",
            examples: [
              "Tem medo de [diagnóstico]? Ignorar é mais perigoso.",
              "A única forma de saber é avaliar. Suposição não trata ninguém.",
              "Ficar parado parece seguro… mas o risco real é [consequência ignorada].",
            ],
          },
          {
            id: "t4-m2-t4",
            title: "Objeção + proposta",
            examples: [
              "Não precisa pagar agora. Só precisa [ação inicial].",
              "Se ainda tem dúvida, [proposta concreta] resolve.",
              "Achou caro? Vê o que tá incluso e compara com [custo de não fazer].",
            ],
          },
        ],
      },

      {
        id: "t4-m3",
        title: "Oferecer Caminhos Claros",
        tension: "Quero agir, mas não sei como. Agora ficou fácil.",
        role: "Redução de fricção",
        tactics: [
          {
            id: "t4-m3-t1",
            title: "Guia do próximo passo",
            examples: [
              "Se você se identificou com [situação], o passo 1 é [ação].",
              "Se esse é seu caso, envie [palavra-chave] aqui no direct.",
              "Identificou algum [sintoma]? Então já pode [ação de triagem].",
            ],
          },
          {
            id: "t4-m3-t2",
            title: "Mini tutorial de agendamento",
            examples: [
              "Clique no link, escolha o horário e pronto. Sem ligação. Sem espera.",
              "Agendar é simples: toque aqui, preencha e pronto.",
              "Passo a passo pra marcar: [ação 1], [ação 2], [resultado].",
            ],
          },
          {
            id: "t4-m3-t3",
            title: "CTA segmentado",
            examples: [
              "Tem dúvidas se atendemos em [cidade]? Veja aqui.",
              "Para mães de primeira viagem: clique aqui. Para gestantes, clique aqui.",
              "Escolha o botão abaixo que representa sua fase atual.",
            ],
          },
          {
            id: "t4-m3-t4",
            title: "Lista de dúvidas frequentes",
            examples: [
              "Tá com receio? Agenda a conversa, não o compromisso.",
              "Respondemos as 3 maiores dúvidas antes de agendar.",
              "Ainda não sabe se é o momento? A gente explica tudo aqui.",
            ],
          },
        ],
      },

      {
        id: "t4-m4",
        title: "Reativar o Quase-Cliente",
        tension: "Já pensei em agir antes. Esse empurrão me acordou.",
        role: "Resgate de leads mornos",

        tactics: [
          {
            id: "t4-m4-t1",
            title: "Lembrete empático",
            examples: [
              "Ainda pensando em [solução/oferta]?",
              "Talvez você só precisasse de um sinal. Esse é o meu.",
              "Já pensou em [ação]? Agora é o momento.",
            ],
          },
          {
            id: "t4-m4-t2",
            title: "Convite pessoal",
            examples: [
              "Você viu esse post semana passada. Hoje, ele pode virar ação.",
              "Tô te escrevendo porque lembrei da sua mensagem sobre [assunto].",
              "Me chama aqui. Bora resolver isso de uma vez?",
            ],
          },
          {
            id: "t4-m4-t3",
            title: "Reencaminhamento de histórico",
            examples: [
              "Semana passada você viu esse post. Hoje, ele pode virar ação.",
              "Vi que você comentou em [data]. Isso ainda faz sentido pra você?",
              "Tem mensagem sua no meu direct desde [mês]. Bora resolver isso?",
            ],
          },
          {
            id: "t4-m4-t4",
            title: "Recompensa pela decisão",
            examples: [
              "Você ficou na dúvida. Agora tem chance de resolver com bônus.",
              "Quem marcar até hoje garante [benefício].",
              "Tem uma condição especial pra quem age ainda hoje.",
            ],
          },
        ],
      },

      {
        id: "t4-m5",
        title: "Converter sem parecer que está vendendo",
        tension: "Senti valor. Agir foi consequência — não pressão",
        role: "Conversão suave e natural",
        tactics: [
          {
            id: "t4-m5-t1",
            title: "CTA invisível",
            examples: [
              "Foi depois dessa [ação anterior] que tudo mudou. Pode ser o seu momento também.",
              "Só o fato de você estar aqui já mostra que se importa. Agora, falta agir.",
              "A maioria espera sentir [dor]. Os mais espertos agem antes.",
            ],
          },
          {
            id: "t4-m5-t2",
            title: "Mini storytelling + oferta",
            examples: [
              "Ela marcou só por curiosidade. Saiu com um [resultado] que mudou tudo.",
              "[Pessoa] veio sem saber ao certo o que queria. Hoje agradece por ter vindo.",
              "Ele não achava que era o caso. Hoje diz que foi o melhor investimento.",
            ],
          },
          {
            id: "t4-m5-t3",
            title: "Benefício indireto",
            examples: [
              "Não precisa ser um problema gigante pra marcar. Basta se importar.",
              "Você não precisa esperar piorar pra agir. Pode cuidar agora.",
              "Entender é o primeiro passo. Resolver pode ser o próximo.",
            ],
          },
          {
            id: "t4-m5-t4",
            title: "Story com provocação",
            examples: [
              "Quantas vezes a gente adia o que sabe que precisa? Esse post é só um lembrete.",
              "Às vezes, o maior cuidado é não ignorar o incômodo.",
              "Refletir é bom. Mas agir no tempo certo é melhor ainda.",
            ],
          },
        ],
      },
    ],
  },
];
