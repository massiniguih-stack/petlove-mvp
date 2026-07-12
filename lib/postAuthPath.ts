/**
 * Define o próximo passo depois do login/cadastro.
 * Com pet → painel. Sem pet → cadastrar o animal.
 */
export function getPostAuthPath(hasPet: boolean): string {
  return hasPet ? '/dashboard' : '/onboarding'
}
