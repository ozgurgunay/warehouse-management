# Shipment Controller Test Açıklamaları

Bu dokümanda `ShipmentControllerTest` içindeki her test grubunun **ne yaptığı** ve **neden yazıldığı** kısaca açıklanır.

---

## Genel yapı

- **@WebMvcTest(ShipmentController.class):** Sadece `ShipmentController` ve web katmanı yüklenir; veritabanı ve diğer servisler **mock** (sahte) olur. Böylece testler hızlı çalışır ve sadece REST API davranışı test edilir.
- **@MockBean ShipmentService:** Gerçek `ShipmentService` çalışmaz; davranışı test içinde `when(...).thenReturn(...)` ile tanımlanır.
- **MockMvc:** HTTP isteği gönderir, cevabın status kodu ve JSON içeriğini kontrol eder.
- **.with(user("test").roles("USER")):** İstek, giriş yapmış bir kullanıcı gibi gönderilir (güvenlik nedeniyle gerekli).
- **.with(csrf()):** POST, PUT, PATCH, DELETE gibi **state-changing** isteklerde CSRF token eklenir; yoksa Spring Security 403 döner.

---

## 1. GET /shipments/{id}

| Test | Açıklama |
|------|----------|
| **returns 200 and shipment when found** | Service, verilen id için bir `ShipmentDTO` döndürüyor. Controller’ın 200 OK dönmesi ve JSON’da id, orderId, status, shippingAddress alanlarının doğru olması beklenir. |
| **returns 404 when shipment not found** | Service `NotFoundException` fırlatıyor. Controller’ın bunu 404 Not Found’a çevirmesi beklenir. |

**Neden önemli?** Tekil kaynak getirme ve “bulunamadı” senaryosu tüm REST API’lerde temel davranıştır.

---

## 2. POST /shipments (CreateShipment)

| Test | Açıklama |
|------|----------|
| **returns 200 and created shipment when request is valid** | Gövdede `orderId`, `shippingAddress`, `shippingMethod` ile JSON gönderilir. Service’in döndürdüğü “oluşturulmuş” DTO’nun (id, status PENDING vb.) controller tarafından 200 OK ile döndürülmesi beklenir. |

**Teknik not:** İstek gövdesi `ObjectMapper` ile JSON’a çevrilir; POST olduğu için `.with(csrf())` kullanılır.

---

## 3. GET /shipments (GetAllShipments)

| Test | Açıklama |
|------|----------|
| **returns 200 and list when no filters** | Hiç parametre verilmeden `GET /shipments` çağrılır. Varsayılan `page=0`, `size=20` ile service çağrılır ve dönen liste 200 OK ile JSON array olarak dönmelidir. |
| **returns 200 and list when status and orderId provided** | `status=PENDING`, `orderId=10`, `page=0`, `size=10` parametreleriyle çağrılır. Service’in bu parametrelerle çağrıldığı ve 200 ile liste (bu örnekte boş) döndüğü doğrulanır. |

**Neden önemli?** Listeleme ve filtreleme/sayfalama parametrelerinin controller’dan service’e doğru iletilmesi test edilir.

---

## 4. PUT /shipments/{id} (UpdateShipment)

| Test | Açıklama |
|------|----------|
| **returns 200 and updated shipment when found** | Gövdede yeni adres ve maliyet ile PUT atılır. Service güncellenmiş DTO döndürür; controller 200 OK ve JSON’da güncel alanları döndürmelidir. |
| **returns 404 when shipment not found** | Var olmayan bir id ile PUT atılır. Service `NotFoundException` fırlatır; controller 404 dönmelidir. |

**Teknik not:** `any(ShipmentDTO.class)` ile “herhangi bir DTO” kabul edilir; test sadece controller’ın service’i doğru çağırıp cevabı iletmesine odaklanır.

---

## 5. DELETE /shipments/{id} (DeleteShipment)

| Test | Açıklama |
|------|----------|
| **returns 204 when shipment exists** | Var olan bir id için DELETE atılır. Controller gövde döndürmez; HTTP 204 No Content beklenir. |
| **returns 404 when shipment not found** | Var olmayan id için DELETE atılır. Service void olduğu için Mockito’da `doThrow(NotFoundException).when(service).deleteShipment(id)` kullanılır; controller 404 dönmelidir. |

**Teknik not:** Void metodlarda `when(...).thenThrow(...)` kullanılamaz; `doThrow(...).when(...).metod()` kullanılır.

---

## 6. PATCH /shipments/{id}/status (UpdateShipmentStatus)

| Test | Açıklama |
|------|----------|
| **returns 200 and updated shipment when found** | `status=IN_TRANSIT` query parametresiyle PATCH atılır. Service güncellenmiş DTO döndürür; controller 200 ve JSON’da yeni status’u döndürmelidir. |
| **returns 404 when shipment not found** | Var olmayan id ile PATCH atılır. Service `NotFoundException` fırlatır; controller 404 dönmelidir. |

**Neden .with(csrf())?** PATCH, state değiştiren bir istek olduğu için test ortamında CSRF token eklenmezse 403 alınır; bu yüzden testte `.with(csrf())` kullanılır.

---

## 7. GET /shipments/by-order/{orderId} (GetShipmentsByOrderId)

| Test | Açıklama |
|------|----------|
| **returns 200 and list of shipments for order** | Belirli bir sipariş id’si için `GET /shipments/by-order/10` çağrılır. Service o siparişe ait shipment listesini döner; controller 200 OK ve JSON array döndürmelidir. |

---

## 8. GET /shipments/by-barcode/{barcode} (GetShipmentByBarcode)

| Test | Açıklama |
|------|----------|
| **returns 200 and shipment when barcode found** | Barkod path’te verilir; service ilgili DTO’yu döner, controller 200 ve JSON döndürmelidir. |
| **returns 404 when barcode not found** | Bilinmeyen barkod için service `NotFoundException` fırlatır; controller 404 dönmelidir. |

---

## 9. GET /shipments/by-qrcode/{qrcode} (GetShipmentByQrCode)

| Test | Açıklama |
|------|----------|
| **returns 200 and shipment when qrcode found** | QR code path’te verilir; service DTO döner, controller 200 ve JSON döndürmelidir. |
| **returns 404 when qrcode not found** | Bilinmeyen QR code için service `NotFoundException` fırlatır; controller 404 dönmelidir. |

---

## Özet tablo

| Endpoint | Başarı senaryosu | Hata senaryosu |
|----------|-------------------|----------------|
| GET /shipments/{id} | 200 + body | 404 |
| POST /shipments | 200 + body | (validasyon testi istenirse eklenir) |
| GET /shipments | 200 + liste (filtresiz / filtreli) | — |
| PUT /shipments/{id} | 200 + body | 404 |
| DELETE /shipments/{id} | 204 | 404 |
| PATCH /shipments/{id}/status | 200 + body | 404 |
| GET /shipments/by-order/{orderId} | 200 + liste | — |
| GET /shipments/by-barcode/{barcode} | 200 + body | 404 |
| GET /shipments/by-qrcode/{qrcode} | 200 + body | 404 |

Bu testler, controller’ın service’i doğru parametrelerle çağırdığını ve HTTP status + gövde davranışını doğrular; service’in iç mantığı mock’landığı için ayrıca unit/integration testlerde test edilir.
