"""
Locust yük testi — Web UI ile kullanıcı sayısını ve süreyi seçebilirsiniz.
Gerçekçi E-Ticaret Akışı: Kayıt Ol -> Giriş Yap -> Ürünleri Gör -> Sipariş Ver
"""

import random
from locust import HttpUser, between, task

class ECommerceUser(HttpUser):
    wait_time = between(1, 5)
    
    def on_start(self):
        # 1. Kayıt ve Giriş (Her sanal kullanıcı kendi hesabı ile başlar)
        self.user_id = None
        self.token = None
        self.email = f"user_{random.randint(100000, 999999)}@example.com"
        self.password = "securepassword123"

        # Kayıt ol
        res_reg = self.client.post("/api/v1/auth/register", json={
            "email": self.email,
            "password": self.password
        }, name="POST /api/v1/auth/register")
        
        if res_reg.status_code == 201:
            self.user_id = res_reg.json().get("userId")

        # Giriş yap
        res_login = self.client.post("/api/v1/auth/login", json={
            "email": self.email,
            "password": self.password
        }, name="POST /api/v1/auth/login")
        
        if res_login.status_code == 200:
            self.token = res_login.json().get("token")
        
        # Testlerde ürün bitme veya boş dönme ihtimaline karşı sepete ekleyecek dummy 1 adet ürün oluştur
        prod_res = self.client.post("/api/v1/products", json={
            "name": f"Test Ürünü {random.randint(100,999)}",
            "price": random.randint(10, 500),
            "stock": 100
        }, name="Intial Setup: POST /api/v1/products")

    @task(3)
    def view_products_and_order(self):
        # 2. Ürünleri listele
        res_products = self.client.get("/api/v1/products", name="GET /api/v1/products")
        products = []
        if res_products.status_code == 200:
            products = res_products.json()
        
        # 3. Sipariş ver (Eğer ürün varsa)
        if len(products) > 0 and self.user_id:
            # Sepete rastgele 1 ürün at
            selected_product = random.choice(products)
            prod_id = selected_product.get("_id")
            
            if prod_id:
                self.client.post("/api/v1/orders", json={
                    "userId": self.user_id,
                    "products": [prod_id],
                    "total": selected_product.get("price", 100)
                }, name="POST /api/v1/orders")

    @task(1)
    def view_health_status(self):
        """Bazen anasayfaya veya sağlık kontrolüne baksınlar (Karışık trafik)"""
        self.client.get("/gateway/admin/logs?token=dev-admin-token", name="GET Admin Logs")
