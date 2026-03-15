# Testleri Çalıştırma Rehberi

Bu dokümanda projedeki testleri nasıl çalıştıracağınız adım adım anlatılmaktadır.

---

## 1. Ön koşul: Proje kök dizini

Tüm komutları **proje kök dizininde** çalıştırın. Yani `warehouse-management` klasörünün içinde olmalısınız (pom.xml ve mvnw.cmd dosyalarının bulunduğu yer).

```
warehouse-management/
├── pom.xml
├── mvnw.cmd      ← Windows için Maven wrapper
├── mvnw          ← Linux/Mac için
├── src/
│   ├── main/
│   └── test/
└── docs/
```

---

## 2. Komut satırından çalıştırma (Windows)

### 2.1 Maven Wrapper kullanımı (önerilen)

Projede `mvn` komutu yüklü olmasa bile **Maven Wrapper** (`mvnw.cmd`) ile testleri çalıştırabilirsiniz. İlk çalıştırmada gerekli Maven sürümü otomatik indirilir.

**Tüm testleri çalıştır:**
```cmd
.\mvnw.cmd test
```
- `src/test` altındaki **tüm** test sınıfları çalışır.
- Çıktının sonunda `BUILD SUCCESS` veya `BUILD FAILURE` görürsünüz.

**Sadece bir test sınıfını çalıştır:**
```cmd
.\mvnw.cmd test -Dtest=ShipmentControllerTest
```
- Yalnızca `ShipmentControllerTest` sınıfındaki tüm testler çalışır.

**Sadece bir iç sınıfı (nested class) çalıştır:**
```cmd
.\mvnw.cmd test -Dtest=ShipmentControllerTest$GetShipmentById
```
- Sadece `GetShipmentById` içindeki testler çalışır. İç sınıf adı `$` ile ayrılır.

**Sadece tek bir test metodunu çalıştır:**
```cmd
.\mvnw.cmd test -Dtest=ShipmentControllerTest#getShipmentById_whenFound_returnsOkAndBody
```
- `#` ile sınıf adından sonra metod adını yazarsınız.

### 2.2 Maven kurulu ise

Sisteminizde `mvn` komutu PATH’te tanımlıysa aynı komutları şöyle kullanabilirsiniz:

```cmd
mvn test
mvn test -Dtest=ShipmentControllerTest
mvn test -Dtest=ShipmentControllerTest$GetShipmentById
mvn test -Dtest=ShipmentControllerTest#getShipmentById_whenFound_returnsOkAndBody
```

### 2.3 Çıktıyı sadeleştirme

- **Sessiz mod:** `-q` ekleyerek logları azaltırsınız.  
  Örnek: `.\mvnw.cmd test -Dtest=ShipmentControllerTest -q`
- **Daha az log:** `-Dspring.profiles.active=test` veya log seviyesi için `application-test.properties` kullanılabilir (opsiyonel).

---

## 3. IDE’den çalıştırma (Cursor / VS Code)

### 3.1 Java Extension Pack

- **Extension:** "Extension Pack for Java" veya en azından "Test Runner for Java" yüklü olmalı.
- Projeyi açtıktan sonra Java projesi tanınmalı (alt tarafta "JAVA PROJECTS" veya benzeri görünebilir).

### 3.2 Testleri çalıştırma

1. **Tüm test sınıfını çalıştırma**
   - `ShipmentControllerTest.java` dosyasını açın.
   - Sınıf adının (`class ShipmentControllerTest`) yanında veya üstünde görünen **Run | Debug** ikonuna tıklayın.
   - Veya sınıf içinde boş bir yere sağ tıklayıp **"Run Java"** / **"Run Tests"** seçin.

2. **Tek bir test metodunu çalıştırma**
   - İlgili metodun üstündeki `@Test` satırının yanındaki **Run** ikonuna tıklayın.
   - Veya metod adına sağ tıklayıp **"Run 'getShipmentById_...'"** benzeri seçeneği kullanın.

3. **Nested class’ı çalıştırma**
   - `GetShipmentById` gibi `@Nested` sınıfının yanındaki Run ikonuna tıklayarak o sınıftaki tüm testleri çalıştırabilirsiniz.

### 3.3 Çıktıyı görmek

- Testler bittikten sonra **TESTING** (veya **Run and Debug**) panelinde hangi testlerin geçtiği / kaldığı listelenir.
- Kırmızı X = başarısız, yeşil tik = başarılı.
- Başarısız testte hata mesajı ve stack trace aynı panelde görünür.

---

## 4. Ne zaman “başarılı” sayılır?

- **BUILD SUCCESS:** Tüm çalıştırılan testler geçti.
- **BUILD FAILURE:** En az bir test başarısız veya derleme hatası var.

Komut satırında örnek başarı çıktısı:

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.example.warehousemanagement.controller.ShipmentControllerTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
```

---

## 5. Sık karşılaşılan durumlar

| Durum | Olası neden | Ne yapmalı? |
|--------|----------------|-------------|
| `mvn: command not found` | Maven PATH’te yok | `.\mvnw.cmd` kullanın; `mvn` yazmayın. |
| `JAVA_HOME is not set` | Java kurulu değil veya tanımlı değil | JDK 21 kurun ve JAVA_HOME’u ayarlayın. Proje Java 21 kullanıyor. |
| Test kırmızı, 404 / 401 | Güvenlik veya URL farklı | Controller testlerinde `.with(user("test").roles("USER"))` kullanıldığından emin olun. |
| Çok fazla log | Varsayılan Spring log seviyesi | `mvnw.cmd test -q` ile çalıştırın veya log ayarlarını `application-test.properties` ile kısın. |

---

## 6. Özet komutlar (kopyala-yapıştır)

Proje kökünde, PowerShell veya CMD’de:

```cmd
REM Tüm testler
.\mvnw.cmd test

REM Sadece ShipmentControllerTest
.\mvnw.cmd test -Dtest=ShipmentControllerTest

REM Sadece GET by id testleri (nested class)
.\mvnw.cmd test -Dtest=ShipmentControllerTest$GetShipmentById

REM Sessiz mod
.\mvnw.cmd test -Dtest=ShipmentControllerTest -q
```

Bu rehber, testleri hem komut satırından hem IDE’den nasıl çalıştıracağınızı kapsar. Yeni test sınıfları ekledikçe aynı mantıkla `-Dtest=YeniSinifAdi` kullanabilirsiniz.
