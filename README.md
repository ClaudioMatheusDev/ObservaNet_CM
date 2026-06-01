# ObservaNet_CM

Painel de Observabilidade e Logs Centralizados para aplicações ASP.NET Core. Permite monitorar logs, métricas, alertas de jobs, visualizar ocorrências críticas em tempo real e automatizar provisionamento do ambiente via práticas DevOps.

## Funcionalidades

- Recebimento centralizado de logs de múltiplas aplicações via Serilog/ElasticSearch
- Visualização e busca avançada em logs e métricas via dashboard web
- Identificação de chamadas lentas, exceções e alertas customizados
- Filtros por serviço, níveis de log, período, e muito mais
- Integração facilitada com apps .NET Core usando o agente ObservaNet.Agent
- Painel de saúde dos serviços e histórico de jobs
- Provisionamento e deploy automatizados via Docker e pipelines CI/CD

## Stack Principal

- **Backend:** ASP.NET Core, Serilog, ElasticSearch
- **Frontend:**  React
- **Logs & Dashboards:** Kibana/Grafana, ELK Stack
- **DevOps:** Docker, docker-compose, [GitHub Actions / Azure DevOps]
- **Infraestrutura:** [Terraform/Bicep/ARM para cloud (opcional)]

## Estrutura do Projeto

```
ObservaNet_CM/
├── docs/
├── src/
│   ├── ObservaNet.Api/
│   ├── ObservaNet.Dashboard/
│   ├── ObservaNet.Agent/
│   └── ObservaNet.Shared/
├── deploy/
│   ├── docker/
│   └── pipelines/
├── infrastructure/
├── tests/
├── .github/
├── README.md
├── LICENSE
└── CHANGELOG.md
```



## Contribuindo

Contribuições são bem-vindas! Veja o arquivo [CONTRIBUTING.md](docs/CONTRIBUTING.md) para detalhes do processo.

## Licença

[MIT](LICENSE)

---

> Desenvolvido por ClaudioMatheusDev 🚀
