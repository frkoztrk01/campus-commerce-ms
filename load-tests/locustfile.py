"""
Locust yük testi — Web UI ile kullanıcı sayısını ve süreyi seçebilirsiniz.

Docker ile (önerilen):
  docker compose up -d
  Tarayıcı: http://localhost:8089

Yerel (Python + stack localhost:3000):
  python3 -m venv .venv && source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
  pip install -r load-tests/requirements-locust.txt
  locust -f load-tests/locustfile.py --host http://localhost:3000
"""

from __future__ import annotations

import random

from locust import HttpUser, between, task


class GatewayUser(HttpUser):
    """Dispatcher üzerinden public kayıt uç noktasına yük üretir (token gerekmez)."""

    wait_time = between(0.05, 0.2)

    @task
    def register(self) -> None:
        uid = random.randint(1, 10_000_000)
        self.client.post(
            "/api/v1/auth/register",
            json={"email": f"locust-{uid}@example.com", "password": "locust-test"},
            name="POST /api/v1/auth/register",
        )
