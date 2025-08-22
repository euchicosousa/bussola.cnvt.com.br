import LenisScrollContainer from "~/components/common/layout/LenisScrollContainer";

export default function Process() {
  return (
    <LenisScrollContainer>
      <div className="items-stretch border-b">
        <div className="flex w-full flex-col items-stretch gap-4 border-b md:flex-row">
          <div className="flex items-center p-8 lg:p-16">
            <h1 className="text-7xl font-bold tracking-tighter xl:text-9xl">
              CNVT.6
            </h1>
          </div>
          <div className="flex w-full flex-col justify-center border-l p-8 text-lg font-medium md:text-right lg:p-16">
            O Processo Criativo <br /> que Transforma <br /> Conteúdo em
            Resultado
          </div>
        </div>
        <div className="text-foreground/50 p-8 lg:p-16">
          Na CNVT®, conteúdo não nasce por acaso. Ele é pensado, lapidado e
          testado para cumprir um único propósito: entregar resultado real. Foi
          assim que criamos o CNVT.6 — o nosso processo exclusivo de criação de
          conteúdo, com seis etapas afiadas, interdependentes e inegociáveis.
          Nada entra aqui só porque “tá na moda”. Nada sai sem passar pelo crivo
          da estratégia.
        </div>
      </div>
      <div className="">
        <div className="border-b p-8 text-2xl font-medium lg:p-16">
          Cada conteúdo que sai da CNVT® passa por seis etapas:
        </div>
        <div className="grid grid-cols-2 px-4 lg:grid-cols-3 lg:px-8 2xl:grid-cols-6">
          {[
            {
              titulo: "Estruturação",
              descricao:
                "Definimos onde cada peça entra. O tipo, o formato, o encaixe no plano. É o mapa. Sem isso, vira adivinhação.",
            },
            {
              titulo: "Definição",
              descricao:
                "Damos forma ao conteúdo. Título, tema, linha narrativa. Tiramos do genérico e colocamos no alvo.",
            },
            {
              titulo: "Pesquisa",
              descricao:
                "Cavamos fundo. Buscamos dados, insights, contexto. Nada de achismo. Aqui tem embasamento.",
            },
            {
              titulo: "Aprovação",
              descricao:
                "Compartilhamos com o cliente. Alinhamento é regra — não avançamos no escuro. Se não fizer sentido, voltamos. Melhor voltar agora do que publicar errado.",
            },
            {
              titulo: "Produção",
              descricao:
                "Texto, design, edição. A criação ganha corpo com clareza e consistência. Cada peça carrega a voz e a intenção da marca.",
            },
            {
              titulo: "Publicação + Análise",
              descricao:
                "Entrou no ar? Agora a gente acompanha. Medimos, comparamos, otimizamos. Conteúdo que não performa, não se repete. E o que performa, vira referência.",
            },
          ].map((etapa, i) => {
            return (
              <div key={i} className="border-b px-4 py-8 lg:px-8 lg:py-16">
                <h1 className="mb-4 text-7xl font-light">{i + 1}</h1>
                <h2 className="text-xl font-medium">{etapa.titulo}</h2>
                <p className="text-foreground/50 mt-2">{etapa.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>
    </LenisScrollContainer>
  );
}
