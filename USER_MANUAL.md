# Manual do Usuário - Bússola

## 🧭 Bem-vindo à Bússola!

A Bússola é sua plataforma inteligente de gestão de projetos e ações. Este manual vai te guiar através de todas as funcionalidades para que você possa navegar seus projetos com precisão e eficiência.

## 📋 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Interface Principal](#interface-principal)
3. [Gerenciamento de Ações](#gerenciamento-de-ações)
4. [Dashboard e Visualizações](#dashboard-e-visualizações)
5. [Parceiros e Colaboração](#parceiros-e-colaboração)
6. [Administração](#administração)
7. [Funcionalidades Avançadas](#funcionalidades-avançadas)
8. [Dicas e Boas Práticas](#dicas-e-boas-práticas)
9. [Solução de Problemas](#solução-de-problemas)

## 🚀 Primeiros Passos

### Como Fazer Login

1. **Acesse** [bussola.cnvt.com.br](https://bussola.cnvt.com.br)
2. **Clique** em "Entrar"
3. **Digite** seu email e senha
4. **Clique** em "Acessar Dashboard"

### Primeira Configuração

Após o primeiro login:

1. **Complete seu perfil** em "Meu Perfil"
   - Adicione foto de perfil
   - Confirme informações pessoais
   - Configure preferências de notificação

2. **Escolha o tema** (claro ou escuro)
   - Clique no ícone do sol/lua no header
   - O sistema lembra sua preferência

## 🖥️ Interface Principal

### Header de Navegação

```
┌─────────────────────────────────────────────────────────────┐
│ 🧭 Bússola    Home  Parceiros  Tarde  Admin    👤 Perfil    │
└─────────────────────────────────────────────────────────────┘
```

- **Logo**: Volta sempre para o dashboard principal
- **Home**: Visão geral de todas as ações
- **Parceiros**: Lista de clientes/projetos
- **Tarde**: Ações em atraso (aparece quando há itens atrasados)
- **Admin**: Painel administrativo (apenas para admins)
- **Perfil**: Configurações pessoais e logout

### Sidebar de Navegação

A sidebar esquerda mostra:

- **📊 Dashboard**: Visão geral
- **➕ Nova Ação**: Criar nova tarefa
- **📅 Hoje**: Ações programadas para hoje
- **⏰ Atrasadas**: Itens vencidos
- **📋 Por Parceiro**: Organização por cliente

### Área Principal

A área central varia conforme a seção:
- **Cards de Ação**: Interface tipo Kanban
- **Calendário**: Vista temporal das tarefas
- **Listas**: Visualização detalhada
- **Formulários**: Criação e edição

## ✅ Gerenciamento de Ações

### O que é uma Ação?

Uma **Ação** é qualquer tarefa, entrega ou atividade que precisa ser realizada. Cada ação possui:

- **Título**: Nome da tarefa
- **Descrição**: Detalhamento completo
- **Estado**: Todo, Doing, Done, etc.
- **Prioridade**: Baixa, Média, Alta
- **Categoria**: Tipo de atividade
- **Responsáveis**: Quem vai executar
- **Prazo**: Data de entrega
- **Tempo**: Estimativa de duração
- **Arquivos**: Anexos e referências

### Criando uma Nova Ação

1. **Clique** no botão "➕ Nova Ação"
2. **Preencha** os campos obrigatórios:
   - Título (ex: "Criar post para Instagram")
   - Categoria (ex: "Marketing Digital")
   - Prioridade (Baixa, Média, Alta)
   - Responsáveis (selecione da lista)
   - Data de entrega
   - Parceiro(s) relacionado(s)

3. **Adicione** informações extras:
   - Descrição detalhada
   - Anexos (imagens, documentos)
   - Tags para organização
   - Tempo estimado

4. **Clique** em "Criar Ação"

### Estados das Ações

#### 📋 Todo (Para Fazer)
- Ações planejadas mas não iniciadas
- Cor padrão: Cinza
- Status inicial de todas as ações

#### 🚧 Doing (Fazendo)  
- Ações em andamento
- Cor padrão: Azul
- Mova para cá quando iniciar o trabalho

#### ✅ Done (Concluída)
- Ações finalizadas
- Cor padrão: Verde
- Não aparecem nos dashboards ativos

#### ⏸️ Hold (Pausada)
- Ações temporariamente paradas
- Cor padrão: Amarelo
- Aguardando aprovação ou recurso

#### ❌ Cancelled (Cancelada)
- Ações que não serão executadas
- Cor padrão: Vermelho
- Removidas do fluxo principal

### Editando Ações

#### Edição Rápida
- **Clique duplo** no título para editar
- **Arraste** entre colunas para mudar estado
- **Clique direito** para menu de contexto

#### Edição Completa
1. **Clique** na ação para abrir detalhes
2. **Clique** no ícone de "Editar" (lápis)
3. **Modifique** campos necessários
4. **Salve** as alterações

#### Ações em Lote
- **Selecione** múltiplas ações (Ctrl/Cmd + clique)
- **Use** a barra de ações em lote
- **Aplique** mudanças a todas selecionadas

### Organizando Ações

#### Por Estado (Kanban)
A visualização padrão organiza por estado:
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   TODO   │  │  DOING   │  │   DONE   │  │   HOLD   │
├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤
│ Ação A   │  │ Ação D   │  │ Ação G   │  │ Ação J   │
│ Ação B   │  │ Ação E   │  │ Ação H   │  │          │
│ Ação C   │  │ Ação F   │  │ Ação I   │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

#### Filtros Disponíveis
- **Por Responsável**: Veja apenas suas ações
- **Por Prioridade**: Foque no que é urgente
- **Por Data**: Organize por prazos
- **Por Categoria**: Agrupe por tipo de trabalho
- **Por Parceiro**: Filtre por cliente

#### Busca Global
- **Digite** na barra de busca no header
- **Procure** por título, descrição ou tags
- **Use** filtros combinados para refinar

## 📊 Dashboard e Visualizações

### Dashboard Principal

O dashboard oferece uma visão 360° dos seus projetos:

#### Métricas Principais
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   TOTAL     │  EM ATRASO  │   FAZENDO   │ CONCLUÍDAS  │
│     47      │      3      │      8      │     23      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

#### Gráficos e Relatórios
- **Progresso Semanal**: Barras mostrando conclusões
- **Distribuição por Estado**: Pizza com status
- **Timeline de Projetos**: Gantt simplificado
- **Performance por Pessoa**: Ranking de produtividade

#### Alertas Inteligentes
- 🔴 **Crítico**: Ações vencidas há mais de 3 dias
- 🟡 **Atenção**: Ações vencendo nas próximas 24h
- 🔵 **Info**: Ações sem responsável definido

### Vista do Calendário

Acesse através do ícone de calendário:

#### Visualizações Disponíveis
- **Mês**: Visão geral mensal
- **Semana**: Detalhamento semanal
- **Dia**: Foco no dia atual
- **Agenda**: Lista cronológica

#### Navegação
- **Setas**: Navegar entre períodos
- **Hoje**: Voltar para data atual
- **Clique** em datas para ver detalhes

### Relatórios

#### Relatório de Parceiro
1. **Selecione** um parceiro
2. **Clique** em "Gerar Relatório"
3. **Configure** o período
4. **Exporte** em PDF ou Excel

#### Conteúdo dos Relatórios
- Resumo executivo
- Ações concluídas no período
- Métricas de performance
- Gráficos de progresso
- Próximos passos

## 👥 Parceiros e Colaboração

### O que são Parceiros?

**Parceiros** são clientes, projetos ou áreas organizacionais. Cada parceiro tem:

- **Nome** e **logo**
- **Cor** identificadora
- **Usuários** com acesso
- **Ações** específicas
- **Relatórios** independentes

### Trabalhando com Parceiros

#### Seleção de Parceiro
- **Clique** no menu "Parceiros"
- **Escolha** da lista disponível
- **Dashboard** filtra automaticamente

#### Dashboard do Parceiro
Cada parceiro tem dashboard próprio com:
- Ações específicas do cliente
- Métricas isoladas
- Histórico de entregas
- Arquivos e documentos

### Colaboração em Equipe

#### Responsáveis por Ação
- **Atribua** pessoas específicas
- **Veja** avatar dos responsáveis
- **Receba** notificações de mudanças

#### Comentários e Comunicação
1. **Abra** uma ação
2. **Role** até os comentários
3. **Digite** sua mensagem
4. **Marque** pessoas com @nome
5. **Anexe** arquivos se necessário

#### Notificações
Você recebe avisos quando:
- É atribuído a uma nova ação
- Ação que você segue é alterada
- Comentário menciona você
- Prazo está próximo

## ⚙️ Administração

*Seção disponível apenas para usuários com perfil administrativo*

### Gestão de Usuários

#### Adicionar Novo Usuário
1. **Acesse** Admin > Usuários
2. **Clique** em "Novo Usuário"
3. **Preencha** dados pessoais:
   - Nome completo
   - Email (será usado para login)
   - Perfil (Admin, Membro, Visualizador)
   - Parceiros com acesso
4. **Envie** convite por email

#### Gerenciar Usuários Existentes
- **Edite** perfis e permissões
- **Desative** usuários temporariamente
- **Remova** acessos permanentemente
- **Redefina** senhas quando necessário

### Gestão de Parceiros

#### Criar Novo Parceiro
1. **Acesse** Admin > Parceiros
2. **Clique** em "Novo Parceiro"
3. **Configure**:
   - Nome do parceiro
   - Cor identificadora
   - Logo (opcional)
   - Usuários com acesso
   - Status (ativo/arquivado)

#### Configurações do Parceiro
- **Personalização** de categorias
- **Configuração** de estados específicos
- **Templates** de ações
- **Integrações** externas

### Configurações do Sistema

#### Categorias Globais
- **Crie** tipos de ação (Marketing, Desenvolvimento, etc.)
- **Defina** cores e ícones
- **Estabeleça** tempos padrão

#### Estados Personalizados
- **Personalize** workflow (Todo, Doing, Review, Done)
- **Configure** transições automáticas
- **Defina** regras de negócio

#### Celebrações
- **Configure** marcos importantes
- **Defina** critérios de conquista
- **Personalize** mensagens e recompensas

## 🌟 Funcionalidades Avançadas

### Inteligência Artificial

#### Geração de Conteúdo
1. **Crie** nova ação
2. **Digite** título básico
3. **Clique** no ícone de ✨ IA
4. **Escolha** tipo de conteúdo:
   - Descrição detalhada
   - Lista de subtarefas
   - Cronograma sugerido
5. **Refine** o resultado conforme necessário

#### Sugestões Inteligentes
A IA sugere automaticamente:
- Responsáveis baseados em histórico
- Tempos estimados similares
- Tags relevantes
- Próximos passos lógicos

### Editor Rico de Texto

O editor Tiptap oferece recursos avançados:

#### Formatação Básica
- **Negrito**: Ctrl/Cmd + B
- **Itálico**: Ctrl/Cmd + I  
- **Sublinhado**: Ctrl/Cmd + U
- **Riscado**: Ctrl/Cmd + Shift + S

#### Estrutura do Texto
- **Títulos**: # ## ###
- **Listas**: - ou 1.
- **Citações**: >
- **Código**: `código`
- **Linha divisória**: ---

#### Elementos Avançados
- **Links**: Selecione texto e Ctrl/Cmd + K
- **Imagens**: Arraste arquivo ou clique no ícone
- **Tabelas**: Menu inserir tabela
- **Cores**: Destaque importante

### Automações

#### Regras Automáticas
Configure no Admin > Automações:

- **Auto-atribuição**: Por tipo de ação
- **Mudanças de estado**: Baseadas em datas
- **Notificações**: Personalizadas por evento
- **Relatórios**: Geração automática

#### Integrações
- **Slack**: Notificações em canais
- **Email**: Relatórios periódicos
- **Calendário**: Sincronização de prazos
- **API**: Conectar outros sistemas

### Atalhos de Teclado

#### Navegação Geral
- `Ctrl/Cmd + K`: Busca global
- `N`: Nova ação
- `H`: Ir para Home
- `C`: Abrir calendário
- `P`: Alternar entre parceiros

#### Ações Específicas
- `E`: Editar ação selecionada
- `D`: Marcar como Done
- `Delete`: Arquivar ação
- `Space`: Expandir/colapsar detalhes

## 💡 Dicas e Boas Práticas

### Organização Eficiente

#### Nomenclatura de Ações
- **Use** verbos no infinitivo: "Criar", "Revisar", "Publicar"
- **Seja** específico: "Post Instagram - Produto X"
- **Inclua** contexto: "Reunião cliente - Definir escopo"

#### Priorização Inteligente
- **Alta**: Urgente + Importante
- **Média**: Importante mas não urgente
- **Baixa**: Nem urgente nem importante

#### Estimativa de Tempo
- **Seja** realista com estimativas
- **Considere** interrupções e imprevistos
- **Revise** estimativas com base no histórico

### Fluxo de Trabalho Recomendado

#### Início do Dia
1. **Revise** ações atrasadas
2. **Priorize** tarefas do dia
3. **Mova** ações para "Doing"
4. **Configure** foco no que importa

#### Durante o Trabalho
- **Atualize** status regularmente
- **Adicione** comentários de progresso
- **Comunique** bloqueios imediatamente
- **Anexe** evidências do trabalho

#### Final do Dia
1. **Revise** o que foi concluído
2. **Atualize** estimativas restantes
3. **Planeje** próximo dia útil
4. **Archive** ações finalizadas

### Colaboração Eficaz

#### Comunicação Clara
- **Seja** específico em comentários
- **Use** @menções para chamar atenção
- **Anexe** contexto visual quando possível
- **Confirme** recebimento de tarefas

#### Gestão de Expectativas
- **Comunique** mudanças de prazo antecipadamente
- **Explique** dependências e bloqueios
- **Mantenha** stakeholders informados
- **Celebre** conquistas da equipe

## 🔧 Solução de Problemas

### Problemas Comuns

#### "Não consigo fazer login"
1. **Verifique** email e senha
2. **Tente** redefinir senha
3. **Limpe** cache do navegador
4. **Contate** administrador se persistir

#### "Minhas ações não aparecem"
1. **Verifique** filtros ativos
2. **Confirme** parceiro selecionado
3. **Revise** permissões de acesso
4. **Atualize** a página

#### "Upload de arquivo falha"
1. **Confirme** tamanho do arquivo (max 10MB)
2. **Verifique** formato suportado
3. **Tente** conexão mais estável
4. **Use** compressão se necessário

#### "Sistema está lento"
1. **Feche** outras abas desnecessárias
2. **Limpe** cache do navegador
3. **Verifique** conexão de internet
4. **Tente** modo incógnito

### Recursos de Ajuda

#### Suporte Interno
- **Chat** interno (ícone de ajuda)
- **Base de conhecimento**
- **Videos tutoriais**
- **FAQ** atualizada

#### Contato Direto
- **Email**: suporte@cnvt.com.br
- **WhatsApp**: +55 11 99999-9999
- **Horário**: Seg-Sex, 9h-18h

### Atualizações e Melhorias

#### Novidades do Sistema
- **Acompanhe** notificações de update
- **Leia** changelog regularmente
- **Teste** novas funcionalidades
- **Envie** feedback e sugestões

#### Treinamentos
- **Participe** de webinars mensais
- **Acesse** materiais de treinamento
- **Pratique** com dados de teste
- **Compartilhe** conhecimento com a equipe

---

## 🎯 Próximos Passos

Agora que você conhece a Bússola:

1. **Configure** seu perfil completamente
2. **Crie** sua primeira ação
3. **Explore** diferentes visualizações
4. **Convide** sua equipe para colaborar
5. **Personalize** seu workflow

**Lembre-se**: A Bússola é sua ferramenta para navegar projetos com precisão. Quanto mais você usar, mais eficiente ficará!

---

*💬 Precisa de ajuda? Entre em contato conosco através dos canais de suporte ou consulte nossa base de conhecimento online.*