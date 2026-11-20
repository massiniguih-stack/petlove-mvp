import type { AnaliseEmpresas, Granularidade } from '@/lib/admin/analytics/tipos';
import { BlocoGrafico } from './BlocoGrafico';
import { CartaoNumero } from './CartaoNumero';
import { COR, reais, ROTULO_GRANULARIDADE, soma } from './formato';
import { Funil } from './Funil';
import { GraficoSeries, type Serie } from './GraficoSeries';
import { RankingBarras } from './RankingBarras';

const ORIGENS: Serie[] = [
  { chave: 'importadas', nome: 'Importadas pela equipe', cor: COR.gratis },
  { chave: 'cadastroProprio', nome: 'Cadastro próprio', cor: COR.proprio },
];

export function AbaEmpresas({ dados, granularidade }: { dados: AnaliseEmpresas; granularidade: Granularidade }) {
  const { numeros } = dados;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <CartaoNumero
          rotulo="Entraram no mapa"
          valor={numeros.entraram.valor}
          variacao={numeros.entraram.variacao}
          dica={`${numeros.importadas} importadas · ${numeros.cadastroProprio} cadastro próprio`}
        />
        <CartaoNumero rotulo="Convidadas" valor={numeros.convidadas.valor} variacao={numeros.convidadas.variacao} />
        <CartaoNumero rotulo="Ativaram o painel" valor={numeros.ativaram.valor} variacao={numeros.ativaram.variacao} />
        <CartaoNumero
          rotulo="Viraram pagas"
          valor={numeros.pagas.valor}
          variacao={numeros.pagas.variacao}
          dica={`Receita mensal ${reais(numeros.receitaMensal)}${
            numeros.cancelamentos > 0 ? ` · −${numeros.cancelamentos} no período` : ''
          }`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BlocoGrafico
          titulo="Entradas no mapa"
          subtitulo={`Importadas vs cadastro próprio, ${ROTULO_GRANULARIDADE[granularidade]}`}
          total={soma(dados.entradas, ['importadas', 'cadastroProprio'])}
        >
          <GraficoSeries tipo="barras" empilhado dados={dados.entradas} series={ORIGENS} />
        </BlocoGrafico>

        <BlocoGrafico
          titulo="Funil da turma"
          subtitulo="Só quem entrou no mapa no período, e até onde chegou"
          total={dados.funil[0]?.total ?? 0}
        >
          <Funil etapas={dados.funil} grupos={ORIGENS} />
        </BlocoGrafico>

        <BlocoGrafico titulo="Por tipo" subtitulo="Todas no mapa hoje" total={soma(dados.porTipo, ['total'])}>
          <RankingBarras
            itens={dados.porTipo.map((t) => ({ rotulo: t.rotulo, total: t.total, destaque: t.pagas }))}
            nomeTotal="No mapa"
            nomeDestaque="Pagas"
          />
        </BlocoGrafico>

        <BlocoGrafico
          titulo="Uso do mapa"
          subtitulo={`Visualizações e cliques no WhatsApp, ${ROTULO_GRANULARIDADE[granularidade]}`}
          total={soma(dados.usoMapa, ['visualizacoes', 'whatsapp'])}
        >
          <GraficoSeries
            tipo="linhas"
            dados={dados.usoMapa}
            series={[
              { chave: 'visualizacoes', nome: 'Visualizações', cor: COR.gratis },
              { chave: 'whatsapp', nome: 'Cliques no WhatsApp', cor: COR.pago },
            ]}
          />
        </BlocoGrafico>
      </div>
    </div>
  );
}
