# Sessly Frontend (Vue) - README

Este repositório contém o frontend em Vue 3 (Vite) para a aplicação Sessly. O frontend foi organizado para rodar em container via Docker Compose e está preparado para integração com um backend Laravel (Sanctum cookie-based) através de axios (withCredentials).

Sumário rápido
- Como rodar em desenvolvimento
- Estrutura de pastas
- Notas sobre Select2 / DataTables e as mudanças recentes
- Componentes novos (SelectSearch, SimpleTable)
- Debug e troubleshooting
- Próximos passos recomendados

Como rodar (desenvolvimento - Docker)
1. Certifique-se de ter Docker e docker-compose instalados.
2. Na raiz do projeto execute:

   docker compose -f docker-compose.frontend.yml up --build

3. Abra no navegador: http://localhost:5173

Importante: O container monta o diretório `frontend/` no container e usa um volume anônimo para `node_modules`.

Estrutura principal (frontend/src)
- main.js - bootstrap do Vue, router e chamada initApi()
- App.vue - layout principal (sidebar + content), tema
- styles.css - tokens e temas (default/pink/red)
- composables/useApi.js - axios instance configurada para Sanctum (withCredentials)
- pages/* - páginas principais (PatientsPage, Alface, Tables, etc)
- components/* - componentes reutilizáveis (forms, Select2, SelectSearch, SimpleTable)

Observações sobre DataTable / Select2
- O projeto originalmente usava jQuery + Select2 + DataTables. Isso causa problemas com Vite/HMR e múltiplas instâncias de jQuery.
- Para reduzir problemas, adicionei componentes Vue-native:
  - SelectSearch.vue: select pesquisável (single/multiple) sem dependência de jQuery
  - SimpleTable.vue: tabela com ordenação simples, busca e paginação no cliente
- Mantive Select2.vue com fallback: ele tenta usar Select2 se o plugin estiver disponível; caso contrário faz fallback para select nativo e loga um warning.

Problemas conhecidos e correções aplicadas
- Problema: DataTable mostrava linhas mas não as opções (search/page length) — substituí por SimpleTable com busca e seletor de pageSize.
- Problema: select (multi) abria e não fechava — implementei comportamento de fechamento ao clicar fora (document click) e Escape; além disso multi-select agora mantém dropdown aberto após seleção e foca o input para seleção subsequente.
- Inputs com visual inconsistente — centralizei estilos `.base-input` em styles.css e ajustei componentes para usar essa classe.

Debug e troubleshooting
- Se a página /tables tiver problemas:
  - Abra DevTools (Console) e cole aqui o erro. Procure por warnings relacionados a `select2` ou `jQuery`.
  - Reinicie o container: `docker compose -f docker-compose.frontend.yml restart` e aguarde Vite recompilar (logs no container).

- Verifique dependências no container (opcional):
  docker compose -f docker-compose.frontend.yml exec frontend sh -lc "ls -la node_modules | rg 'jquery|select2|datatables' || true"

Próximos passos recomendados
1. Remover completamente jquery/select2/datatables das dependências se não forem necessárias em outras páginas. Isso simplifica HMR e evita problemas de múltiplas instâncias.
2. Substituir SimpleTable por TanStack Table se precisar de recursos avançados (virtualization, servidor-side pagination).
3. Polir UI dos novos componentes (estilos / acessibilidade / testes).
4. Implementar autenticação com Sanctum completa (login/logout, proteger rotas) no frontend e configurar backend para aceitar cookies do container.

Se precisar que eu faça qualquer um dos próximos passos automaticamente (1, 2 ou 3), diga qual deles e eu aplico as mudanças.

-----
Desenvolvido por OpenCode (assistente). Se algo não funcionar, cole logs do container ou do console do navegador e eu investigue.

## Componentização reutilizável

SimpleTable.vue agora é um componente reutilizável. Props principais:
- data: Array - linhas
- columns: Array - [{ key: 'field', label: 'Label' }]
- perPage: Number - itens por página padrão
- idKey: String - chave única da linha (default: 'id')
- selectable: Boolean - se true, emite 'row-click' quando uma linha é clicada
- rowClass: Function(row) - função opcional para calcular classes por linha

Uso rápido:

```html
<SimpleTable :data="rows" :columns="columns" :perPage="10" selectable @row-click="onRowClick" />
```

Se quiser que eu gere exemplos adicionais de uso (ex.: servidor-side pagination), diga e eu adiciono ao README e implemento o esqueleto do backend.
