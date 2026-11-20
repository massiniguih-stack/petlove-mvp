'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COR } from './formato';
import { Legenda } from './Legenda';

export interface Serie {
  chave: string;
  nome: string;
  cor: string;
}

const eixo = { fontSize: 11, fill: COR.eixo };
// Dica escura nos dois temas: lê bem no claro e no escuro.
const dica = {
  contentStyle: { backgroundColor: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, color: '#f8fafc' },
  labelStyle: { color: '#f8fafc', marginBottom: 4 },
  cursor: { fill: 'rgba(148, 163, 184, 0.12)' },
};

export function GraficoSeries({
  tipo,
  dados,
  series,
  empilhado = false,
}: {
  tipo: 'barras' | 'linhas';
  dados: ReadonlyArray<object>;
  series: Serie[];
  empilhado?: boolean;
}) {
  const data = dados as object[];
  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {tipo === 'barras' ? (
            <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COR.grade} />
              <XAxis dataKey="rotulo" tick={eixo} axisLine={false} tickLine={false} minTickGap={12} />
              <YAxis allowDecimals={false} tick={eixo} axisLine={false} tickLine={false} />
              <Tooltip {...dica} />
              {series.map((s, i) => (
                <Bar
                  key={s.chave}
                  dataKey={s.chave}
                  name={s.nome}
                  fill={s.cor}
                  stackId={empilhado ? 'total' : undefined}
                  radius={empilhado && i < series.length - 1 ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COR.grade} />
              <XAxis dataKey="rotulo" tick={eixo} axisLine={false} tickLine={false} minTickGap={12} />
              <YAxis allowDecimals={false} tick={eixo} axisLine={false} tickLine={false} />
              <Tooltip {...dica} cursor={{ stroke: COR.eixo, strokeDasharray: '3 3' }} />
              {series.map((s) => (
                <Line
                  key={s.chave}
                  type="monotone"
                  dataKey={s.chave}
                  name={s.nome}
                  stroke={s.cor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <Legenda itens={series} />
    </div>
  );
}
