# campus-commerce-ms

Kampus e-ticaret senaryosu için mikroservis mimarisi: tek giriş noktası **Dispatcher (API Gateway)**, merkezi yetkilendirme ve trafik gözlemi; arka planda **auth**, **product** ve **order** servisleri. Her servisin ayrı **MongoDB** veri tabanı vardır; dış dünyaya yalnızca Dispatcher portu açıktır.

## Ekip ve teslim

| | |
| --- | --- |
| Proje adı | campus-commerce-ms |
| Ekip üyeleri | *(isimleri buraya ekleyin)* |
| Son güncelleme | Nisan 2026 |

## Mimari (Mermaid)

```mermaid
flowchart TB
  subgraph external [Disari]
    Client[istemci]
  end
  subgraph dmz [Tek dis_port]
    GW[dispatcher :3000]
  end
  subgraph internal [Docker_internal_net]
    Auth[auth_service :4001]
    Prod[product_service :4002]
    Ord[order_service :4003]
    Md[(mongo_dispatcher)]
    Ma[(mongo_auth)]
    Mp[(mongo_product)]
    Mo[(mongo_order)]
    Prom[prometheus :9090]
    Graf[grafana :3001]
  end
  Client --> GW
  GW --> Auth
  GW --> Prod
  GW --> Ord
  GW --> Md
  Auth --> Ma
  Prod --> Mp
  Ord --> Mo
  Prom --> GW
  Graf --> Prom
```

**Ağ izolasyonu:** `docker-compose` içinde yalnızca `dispatcher`, `prometheus` ve `grafana` için `ports` tanımlıdır. Mikroservisler `expose` ile iç ağda kalır; host üzerinden doğrudan erişim yoktur (PDF’de istenen network isolation).

