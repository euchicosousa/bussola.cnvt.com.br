import { OpenAI } from "openai";
import type { ActionFunctionArgs } from "react-router";
import { AI_INTENTS } from "~/lib/constants";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  let {
    title,
    description,
    prompt,
    intent,
    context,
    length,
    instagram_caption_tail,
  } = Object.fromEntries(formData.entries()) as Record<string, string>;

  if (!intent) {
    return { message: "Defina a sua intenção nesse comando." };
  }

  let system =
    "Você é um especialista em storytelling e copywriting para redes sociais.";

  // const openai = new OpenAI({
  //   apiKey: process.env["OPENAI_API_KEY"],
  // });

  const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
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
    const response = await client.responses.create({
      model: "gpt-5-chat-latest",
      instructions:
        "Você é um profissional de marketing e especializado em pesquisa para criação de conteúdo e campanhas de marketing.",
      input: `${prompt.toString()}. Retorne sem aspas e com tags html, sem markdown.`,
    });

    return { message: response.output_text };
    // const chatCompletion = await openai.chat.completions.create({
    //   messages: [
    //     {
    //       role: "user",
    //       content: `${prompt.toString()}. Retorne sem aspas e com tags html, sem markdown.`,
    //     },
    //   ],
    //   model: "gpt-4o-mini",
    // });

    // return { message: chatCompletion.choices[0].message.content };
  } else if (
    ["reels", "title", "carousel", "instagram_caption", "stories"].find(
      (i) => i === intent,
    )
  ) {
    switch (intent) {
      case "reels": {
        system =
          "Você é um especialista em storytelling e copywriting para redes sociais com ampla experiência em criar vídeos virais.";
        content = `Sua missão é transformar o seguinte conteúdo em um roteiro de reels para instagram.

    


Importante:
- Utilize linguagem acessível e humana, adaptada para Instagram.
- Não use títulos genéricos. Comece com um gancho real que pare o scroll.
- Limite cada bloco (slide, cena ou etapa) a no máximo 40 palavras.
- Finalize com um CTA alinhado à intenção do modelo.
- O formato de saída deve ser HTML puro, com a estrutura abaixo:

<h4>Cena 1</h4>
<p>Seu conteúdo aqui</p>

<h4>Cena 2</h4>
<p>Seu conteúdo aqui</p>

... e assim por diante até o encerramento com CTA
Não use aspas, bullet points, markdown ou comentários adicionais.
O resultado deve conter somente o texto solicitado.

Tema a ser desenvolvido: ${title} - ${description}
`;

        break;
      }
      case "carousel": {
        let tema = `${title} - ${description}`;

        content = `
Crie um carrossel de 5 a 10 slides seguindo esta estrutura de micro-funil educacional:

CONTEXTO BASE:
Tema: ${tema} 
Contexto da marca e público: ${context}

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

ESTRUTURA DO MICRO-FUNIL:

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
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram".
        
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
        system = `Você é um redator editorial especializado em criar legendas humanas, fluidas e coerentes para publicações no Instagram.`;

        content = `
        Tema a ser desenvolvido: ${title} - ${description}
        Siga as orientações de marca desse contexto: ${context}

        Adapte o tom de voz automaticamente com base no tema e nas orientações de marca — buscando equilíbrio entre naturalidade, empatia e clareza editorial.

        Objetivo:
        Gerar uma legenda curta, natural e coerente com o tema, no formato de 2 parágrafos curtos + rodapé institucional.

        ---

        ESTRUTURA FIXA:
        Bloco 1 — Contexto / Explicação (informativo)
        - Reconta o tema principal de forma clara e natural.
        - Pode explicar o que é, onde acontece ou o que representa.
        - Deve soar como fala humana, nunca como IA.
        - Evite repetir frases do conteúdo principal, mas mantenha coerência.

        Bloco 2 — Conexão / Reflexão / Encerramento
        - Traduza o tema em sentimento, reflexão ou convite leve à continuidade.
        - O tom e vocabulário devem se adaptar automaticamente ao nicho e contexto.
        - Feche com uma frase curta e memorável, sem clichê.

        Bloco 3 — Rodapé da marca (institucional)
        - Deve conter a linha fornecida em ${instagram_caption_tail}
        - Essa linha é fixa e sempre vem no final, sem emojis.

        ---

        ESTILO E REGRAS:
        - Linguagem acessível, natural e humana.
        - Adapte o tom automaticamente ao nicho informado (saúde, gastronomia, moda, negócios, cultura, educação etc.).
        - A legenda deve ter entre ${Math.round((Number(length) / 2) * 1.5)} e ${length} palavras NUNCA ULTRAPASSE ESSA QUANTIDADE DE PALAVRAS.
        - Cada parágrafo deve ter no máximo 40 palavras.
        - Inclua emojis apenas se o tema permitir leveza (ex: gastronomia, moda, lifestyle, bem-estar).
        - Encerramento deve soar natural, não publicitário.
        - Mantenha fluidez, clareza e transições suaves entre ideias.
        - Não use tags, aspas, bullet points, markdown, hashtags ou comentários adicionais.
        - O resultado deve conter apenas o texto final da legenda.

        ---

        REGRAS ANTI-VÍCIOS DE IA:
        PROIBIDO:
        - Frases curtas demais com ponto a cada 3–4 palavras.
        - Estrutura “Não é X. É Y.”
        - Perguntas artificiais (“O resultado?”, “O insight?”)
        - Repetição de ideias com palavras diferentes.
        - Tom sensacionalista, dramático ou publicitário.
        - Excesso de adjetivos genéricos.
        - Texto impessoal ou abstrato.
        - Rimas, trocadilhos ou slogans.

        OBRIGATÓRIO:
        - Fluidez natural na leitura.
        - Voz autêntica e consistente com o nicho.
        - Informações concretas e úteis.
        - Transições suaves entre frases.
        - Encerramento leve e coerente.
        - Rodapé institucional obrigatório com a linha fornecida em ${instagram_caption_tail}.
        `;

        break;
      }
      case "stories": {
        content = `Sua missão é transformar o seguinte conteúdo em um post para Instagram.


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

  const chatCompletion = await client.chat.completions.create({
    model: "gpt-5-chat-latest",
    messages: [
      { role: "system", content: system },
      { role: "user", content },
    ],
  });

  const endDate = new Date();
  console.log(endDate.getTime() - startDate.getTime(), "ms");

  return { message: chatCompletion.choices[0].message.content };
};
