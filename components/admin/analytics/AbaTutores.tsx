import type { AnaliseTutores, Granularidade } from '@/lib/admin/analytics/tipos';
import { BlocoGrafico } from './BlocoGrafico';
import { CartaoNumero } from './CartaoNumero';
import { COR, reais, ROTULO_GRANULARIDADE, soma } from './formato';
import { Funil } from './Funil';
import { GraficoSeries } from './GraficoSeries';
import { RankingBarras } from './RankingBarras';

export function AbaTutores({ dados, granularidade }: { dados: AnaliseTutores; granularidade: Granularidade }) {
  const { numeros } = dados;
  const baseFinal = dados.crescimento[dados.crescimento.length - 1]?.cadastros ?? 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <CartaoNumero rotulo="Novos cadastros" valor={numeros.novos.valor} variacao={numeros.novos.variacao} />
        <CartaoNumero rotulo="Viraram pagos" valor={numeros.pagos.valor} variacao={numeros.pagos.variacao} />
        <CartaoNumero
          rotulo="Conversão da turma"
          valor={numeros.conversaoPct === null ? '—' : `${numeros.conversaoPct.toLocaleString('pt-BR')}%`}
          dica="Dos que entraram no período, quantos já pagam"
        />
        <CartaoNumero
          rotulo="Receita mensal"
          valor={reais(numeros.receitaMensal)}
          dica={
            numeros.cancelamentos > 0
              ? `−${numeros.cancelamentos} ${numeros.cancelamentos === 1 ? 'cancelamento' : 'cancelamentos'} no período`
              : 'Assinaturas ativas hoje'
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BlocoGrafico
          titulo="Entradas"
          subtitulo={`Cadastros e novos pagantes, ${ROTULO_GRANULARIDADE[granularidade]}`}
          total={soma(dados.entradas, ['cadastros', 'pagos'])}
        >
          <GraficoSeries
            tipo="barras"
            dados={dados.entradas}
            series={[
              { chave: 'cadastros', nome: 'Cadastros', cor: COR.gratis },
              { chave: 'pagos', nome: 'Viraram pagos', cor: COR.pago },
            ]}
          />
        </BlocoGrafico>

        <BlocoGrafico titulo="Crescimento" subtitulo="Base total ao fim de cada intervalo" total={baseFinal}>
          <GraficoSeries
            tipo="linhas"
            dados={dados.crescimento}
            series={[
              { chave: 'cadastros', nome: 'Cadastrados', cor: COR.gratis },
              { chave: 'pagos', nome: 'Pagantes', cor: COR.pago },
            ]}
          />
        </BlocoGrafico>

        <BlocoGrafico
          titulo="Funil da turma"
          subtitulo="Só quem se cadastrou no período, e até onde chegou"
          total={dados.funil[0]?.total ?? 0}
        >
          <Funil etapas={dados.funil} />
        </BlocoGrafico>

        <BlocoGrafico
          titulo="Origem"
          subtitulo="De onde veio quem se cadastrou no período"
          total={soma(dados.origem, ['cadastros'])}
        >
          <RankingBarras
            itens={dados.origem.map((o) => ({ rotulo: o.origem, total: o.cadastros, destaque: o.pagos }))}
            nomeTotal="Cadastros"
            nomeDestaque="Pagos"
          />
        </BlocoGrafico>
      </div>
    </div>
  );
}
