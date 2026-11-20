export function Legenda({ itens }: { itens: Array<{ nome: string; cor: string }> }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
      {itens.map((item) => (
        <li key={item.nome} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.cor }} aria-hidden />
          {item.nome}
        </li>
      ))}
    </ul>
  );
}
