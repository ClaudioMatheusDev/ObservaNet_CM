# Arquitetura — ObservaNet

Este documento descreve a arquitetura proposta para o ObservaNet (painel centralizado de observabilidade e logs para aplicações ASP.NET).

## Objetivos
- Centralizar logs e métricas de múltiplas aplicações ASP.NET Core
- Visualizar logs em tempo real, chamadas lentas e ocorrências críticas
- Suportar alertas (Slack/Teams/email) e monitoramento de jobs
- Automatizar provisionamento e deploy (DevOps/IaC)

## Opções de stack (resumo e trade‑offs)
- ELK (Elasticsearch + Logstash + Kibana)
  - +Prós+: maturidade, poder de busca, ingestão flexível via Logstash
  - -Contras-: complexidade (Logstash), maior uso de recursos
- Elastic + Grafana + Prometheus
  - +Prós+: Grafana para visualização e alertas, Prometheus para métricas, integração com Elastic é possível
  - -Contras-: arquitetura híbrida, necessidade de integrar dados de logs e métricas

Recomendação inicial de estudo: começar com Elasticsearch + Kibana (local via Docker Compose) e adicionar Grafana/Prometheus para métricas/APM quando estiver a ingestão de logs validada.

## Padrões de ingestão
1. Agente (library) envia logs para a `ObservaNet.Api` (push) — centraliza autenticação, enriquecimento e roteamento para ES.
2. Alternativa: Agent usa Serilog sink direto para Elasticsearch — menos infraestrutura (sem API), porém menos controle e uniformidade.

Escolha recomendada para aprendizado: implementar ambos em fases — primeira fase: Agent -> API -> ES; segunda fase: demonstrar sink direto para comparação.

## Fluxo (alto nível)
- Aplicação ASP.NET Core instrumentada com `ObservaNet.Agent` (Serilog enricher, middleware de performance).
- Agent envia eventos (HTTP/Grpc) para `ObservaNet.Api` ou grava localmente quando offline.
- `ObservaNet.Api` valida/enriquece e indexa em Elasticsearch (bulk API).
- Kibana/Grafana consultam ES para dashboards; SignalR/WebSocket pode ser usado para views em real‑time se necessário.

## Modelagem de dados (logs)
- Index por dia: `observanet-logs-YYYY.MM.DD` (boa para retenção e gestão)
- Campos recomendados:
  - `@timestamp` (date)
  - `level` (keyword)
  - `service.name` (keyword)
  - `environment` (keyword)
  - `trace.id`, `span.id` (keyword)
  - `message` (text)
  - `exception.stacktrace` (text)
  - `http.method`, `http.path`, `http.status_code` (keyword/integer)
  - `duration_ms` (double)

Exemplo básico de mapping (conceito): definir `keyword` para campos usados em agregações, `text` para full‑text search.

## Contratos e `ObservaNet.Shared`
- DTOs mínimos:
  - `LogEventDto { Timestamp, Level, Service, Environment, Message, Exception, Metadata }`
  - `BulkLogRequest { Events: LogEventDto[] }`
- Colocar DTOs em `ObservaNet.Shared` para reuso entre Agent e Api.

## Autenticação & Segurança
- Opções:
  - API keys (simples para PoC)
  - JWT (se houver identidade central)
  - mTLS (alta segurança para produção)
- TLS obrigatório entre agentes e API/ES em qualquer ambiente real.

## Resiliência e buffering
- Agent deve suportar buffer local (arquivo ou in‑memory com persistência) para redes instáveis.
- API deve aceitar lotes e usar bulk indexing para ES.

## Métricas e APM
- Instrumentar com OpenTelemetry para traces e métricas.
- Expor `/metrics` para Prometheus; enviar traces ao Elastic APM ou Jaeger para análise de chamadas lentas.

## Alertas
- Regras de alerta em Grafana (ou Watcher/Alerting do Elastic):
  - taxa de erros por serviço (5xx) > X%
  - latência média > Y ms
  - job falho X vezes consecutivas
- Integrar canais (Slack/Teams/email/webhook) e criar runbooks simples.

## Escalabilidade e custos
- Escalar ES por shards/replicas — monitorar uso de disco e memória.
- Index lifecycle policy (ILM): retenção ativa (hot/warm) e eventual delete para economizar custos.

## Diagramas e artefatos esperados
- Diagrama de componentes (PNG/SVG) em `docs/observability/`.
- Mapeamento de índices e exemplos de queries utilizadas pelo dashboard.

## Critérios de aceitação desta etapa (Arquitetura)
1. Documento de arquitetura criado em `docs/observability/architecture.md` (este arquivo).
2. Diagrama de componentes adicionado (ou placeholder com instruções para criar).
3. Lista de DTOs a implementar em `ObservaNet.Shared` pronta.
4. Plano para ambiente de dev com Docker Compose definido como próxima tarefa.

## Próximas tarefas (para criar issues)
- Criar diagrama de componentes e anexar aqui.
- Esboçar DTOs em `ObservaNet.Shared`.
- Criar `deploy/docker/docker-compose.yml` para ES/Kibana/Grafana + serviços de apoio.

---