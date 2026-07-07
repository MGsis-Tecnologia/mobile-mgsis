# mobile-mgsis

App mobile (Expo/React Native) que unifica ERP e CRM: consulta de clientes com
status financeiro, catálogo de produtos, novos pedidos e um funil de vendas
simplificado. O elo entre os dois módulos é a tela de detalhe do cliente, que
mostra a timeline unificada de atividades (CRM) e histórico (ERP).

## Stack

Expo + NativeWind (Tailwind) + React Navigation + TanStack Query + AsyncStorage.

## Rodando o projeto

```bash
npm install
npx expo start
```

Escaneie o QR com o app Expo Go (Android/iOS) ou rode `npx expo start --android` / `--ios` / `--web`.

## Modo simulado (mock)

**O backend real ainda não existe.** Por padrão (`EXPO_PUBLIC_USE_MOCK=true`),
todas as chamadas HTTP em `src/api/client.ts` são interceptadas por
`src/api/mock/mockAdapter.ts` (usando `axios-mock-adapter`), que responde com
dados fictícios definidos em `src/api/mock/data.ts` — clientes, produtos,
oportunidades, atividades e pedidos. O estado do mock vive em memória e
reseta a cada reinício do app.

Isso permite testar o fluxo completo (login → funil → fechar oportunidade
como ganha → pedido gerado → timeline do cliente atualizada) sem depender do
backend.

## Plugando no backend real

1. Copie `.env.example` para `.env` e ajuste:
   ```
   EXPO_PUBLIC_API_URL=https://sua-api-real.com.br
   EXPO_PUBLIC_USE_MOCK=false
   ```
2. Ajuste os paths em `src/api/*.ts` caso as rotas reais sejam diferentes das
   assumidas abaixo (contrato usado pelo mock, que serve de especificação):

   | Método | Rota | Descrição |
   |---|---|---|
   | POST | `/auth/login` | `{ email, senha }` → `{ token, usuario }` |
   | GET | `/clientes` | Lista de clientes |
   | GET | `/clientes/:id` | Detalhe do cliente |
   | GET | `/clientes/:id/pedidos` | Pedidos do cliente (ERP) |
   | POST | `/pedidos` | `{ clienteId, itens }` → cria pedido |
   | GET | `/produtos` | Catálogo de produtos |
   | GET | `/crm/oportunidades` | Lista de oportunidades (funil) |
   | POST | `/crm/oportunidades` | `{ clienteId, titulo, valorEstimado }` → novo lead |
   | PATCH | `/crm/oportunidades/:id/etapa` | `{ etapa }` → move oportunidade no funil |
   | POST | `/crm/oportunidades/:id/fechar-ganha` | Fecha como ganha **e gera o pedido no ERP**; retorna `{ oportunidadeId, pedidoId, pedidoNumero }` |
   | GET | `/crm/clientes/:id/timeline` | Atividades do CRM + histórico do ERP, unificados |

3. A autenticação usa Bearer token: o token retornado no login é salvo no
   AsyncStorage e enviado em `Authorization: Bearer <token>` em toda
   requisição (ver `src/api/client.ts`). Um `401` desloga o usuário
   automaticamente.

## O que falta amarrar

1. Confirmar os paths reais dos endpoints com o backend (WLanguage) e
   ajustar `src/api/*.ts` se necessário.
2. Criar as rotas `/crm/*` no backend, com destaque para a procedure de
   `fecharGanha`, que precisa gerar o pedido no ERP a partir da oportunidade.
3. Tela de seleção de produtos dentro do Novo Pedido está funcional mas
   simples (lista + campo de quantidade) — pode evoluir para busca/filtro se
   o catálogo crescer.
