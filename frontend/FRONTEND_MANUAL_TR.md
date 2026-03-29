# Warehouse-Management Frontend Manüeli (Türkçe)

Bu doküman, `frontend` tarafında şu ana kadar oluşturulan tasarım ve iş kurallarını (business) “manuel” formatında özetler. Amaç; route kurgusu, rol bazlı yetkilendirme (RBAC), layout/sayfa mimarisi ve API entegrasyon noktalarını hızlıca anlamaktır.

> Not: Modül ekranları `ModuleWorkspacePage` ile scaffold ediliyor. `ComingSoonPage` ise geriye dönük uyumluluk için bu sayfaya alias (re-export) edilmiştir.

---

## 1) Genel Mimari

Frontend; React + TypeScript + Vite ile çalışır ve yönlendirme `react-router-dom` üzerinden yapılır.

Ana kavramlar:

- `AuthProvider` (`src/auth/AuthContext.tsx`): Login/logout ve kullanıcı bilgisini tutar.
- `RequireAuth` (`src/auth/RequireAuth.tsx`): Korunan tüm route’lar için oturum kontrolü yapar.
- `RequireCapability` (`src/auth/RequireCapability.tsx`): Belirli yetenek (capability) gerektiren route’ları kontrol eder.
- `apiRequest` (`src/services/apiClient.ts`): Backend ile REST çağrılarını tek yerden yönetir.

UI katmanında “tema” yaklaşımı var:

- `PublicLayout`: halka açık sayfalar (Landing vb.)
- `AuthLayout`: login/register kart arayüzü
- `AppLayout`: uygulama ekranları (sidebar + üst başlık + kullanıcı menüsü)

---

## 2) Proje Klasör Yapısı

`frontend/src` içindeki temel gruplar:

- `src/auth`
  - `AuthContext.tsx`: oturum ve kullanıcı çekme
  - `authStorage.ts`: Basic Auth credential’larını localStorage’a kaydetme
  - `capabilities.ts`: role -> capability eşlemesi ve capability tipleri
  - `RequireAuth.tsx`: oturum kontrolü
  - `RequireCapability.tsx`: capability kontrolü
  - (Ek) `RequireCapability` route korumalarında kullanılır.
- `src/services`
  - `apiClient.ts`: `apiRequest<T>()` fonksiyonu (REST çağrıları)
- `src/layouts`
  - `PublicLayout.tsx`, `AuthLayout.tsx`, `AppLayout.tsx`
- `src/components/navigation`
  - `PublicTopNav.tsx`: landing üst bar
  - `AppSidebar.tsx`: sol menü (gruplu modüller)
  - `TopNav.tsx`: (şu an AppLayout içinde görünmüyor; ama capability/role örneği var)
  - `UserProfileMenu.tsx`: üst sağ kullanıcı menüsü
- `src/pages`
  - Public: `LandingPage`
  - Auth: `LoginPage`, `RegisterPage`
  - Auth: `ConfirmEmailPage`
  - Uygulama: `DashboardPage`, `WarehousesListPage`, `WarehouseDetailPage`
  - Admin: `AdminHomePage`
  - Account: `MyProfilePage`, `SettingsPage`, `SupportPage`
  - Workspace/Scaffold: `ModuleWorkspacePage`
- `src/pages/Placeholder` (deprecated):
  - `ComingSoonPage` => `ModuleWorkspacePage` re-export
- `src/features`
  - `warehouses`: `api.ts`, `hooks/useWarehouses.ts`, `types.ts`
  - `admin`: `api.ts`, `hooks/useAdminUsers.ts`, `hooks/useAdminRoles.ts`, `types.ts`

## 2.1) Giriş Noktaları (App Bootstrap)

- `src/main.tsx`
  - `AuthProvider` ile uygulamayı sarar
  - `App` component’ini render eder
- `src/App.tsx`
  - `RouterProvider` ile `router` tanımını bağlar
- `src/app/router.tsx`
  - public/auth/protected route hiyerarşisini kurar
  - `RequireAuth` ve `RequireCapability` guard’larını ilgili seviyelerde uygular

---

## 3) Route Tasarımı ve Erişim Modeli (RBAC)

Route’lar `src/app/router.tsx` içinde tanımlı:

### 3.1) Public / Guest Alan

- `/`
  - `PublicLayout` içinde `LandingPage`
- `/login`
  - `AuthLayout` içinde `LoginPage`
- `/confirm-email`
  - `AuthLayout` içinde `ConfirmEmailPage`
- `/register`
  - `AuthLayout` içinde `RegisterPage`

### 3.2) Protected Uygulama Alanı

Korunan alanın tamamı `RequireAuth` ile sarılmış:

```tsx
// src/app/router.tsx
{
  element: <RequireAuth />,
  children: [
    {
      element: <AppLayout />,
      children: [
        { path: '/app', element: <DashboardPage /> },
        { path: '/warehouses', element: <WarehousesListPage /> },
        { path: '/warehouses/:warehouseId', element: <WarehouseDetailPage /> },
        { path: '/account', element: <Navigate to="/account/profile" replace /> },
        { path: '/account/profile', element: <MyProfilePage /> },
        { path: '/account/settings', element: <SettingsPage /> },
        { path: '/account/support', element: <SupportPage /> },
        // ...diğer modüller ModuleWorkspacePage scaffold ekranları
      ],
    },
  ],
}
```

### 3.3) Admin Yeteneği (Capability) ile Korumalı Route

`/admin` route’u capability gerektirir:

- `/admin`
  - `RequireCapability` ile `capability="admin.manage_users"`
  - Yeteneği olmayan kullanıcı `RequireCapability` içinde `/app`’a yönlendirilir.

### 3.4) Rollere/Yeteneklere Dayalı Ekran Akışı

Frontend’in yetkilendirme “çift katmanlı”:

1. `RequireAuth` = kullanıcı oturumu var mı?
2. `RequireCapability` = ilgili capability var mı?

Capability eşlemesi:

`src/auth/capabilities.ts`

```ts
export const roleCapabilities: Record<string, Capability[]> = {
  ROLE_ADMIN: [
    'admin.manage_users',
    'admin.manage_roles',
    'warehouses.read',
    'warehouses.write',
    'inventory.read',
    'inventory.write',
    'operations.read',
    'operations.write',
    'sales.read',
    'sales.write',
    'packages.read',
    'packages.write',
  ],
  ROLE_USER: [
    'warehouses.read',
    'inventory.read',
    'operations.read',
    'sales.read',
    'packages.read',
  ],
}
```

`AuthContext` içinde:

- `hasRole(roleName)` = `currentUser.roleDTOs` içinden role adı kontrolü
- `hasCapability(capability)` = kullanıcının role listesinde capability var mı?

---

## 4) Auth Akışı (Login / Oturum / Logout)

### 4.1) Credential Saklama (Temel Auth)

`src/auth/authStorage.ts`:

- localStorage key: `wm_auth_basic`
- içerik: `{ username, password }` (düz JSON)
- `toBasicAuthHeader()` ile `Basic base64(username:password)` header’a çevrilir

`AuthProvider`:

1. Başta `loadCredentials()` ile localStorage’dan credentials çekilir.
2. Credentials varsa `setAuthHeaderProvider()` kullanarak `apiRequest` çağrıları için Authorization header üretilir.
3. Sonrasında `/users/me` endpoint’inden `CurrentUser` çekilir.

`AuthContext` içinde kullanıcı bilgisi:

```ts
export type CurrentUser = {
  id: number
  username: string
  email: string
  enabled: boolean
  roleDTOs: { id: number; name: string; description?: string | null }[]
}
```

### 4.2) Login

`src/pages/Auth/LoginPage.tsx`:

- Kullanıcı `auth.login({ username, password }, { rememberMe })` çağırır.
- `rememberMe` true ise credentials localStorage’a kaydedilir, false ise kaydedilmez.
- Login başarılı olunca kullanıcı `/app` veya login’deki `state.from` adresine yönlendirilir.
- Kayıt sonrası yönlendirme varsa `/login` sayfasında `location.state.registrationSuccess` başarı mesajı gösterilir; hesap aktivasyonu, `/confirm-email?token=...` üzerinden `POST /users/confirm` çağrısıyla tamamlanır.

### 4.3) Logout

`UserProfileMenu` içinden `logout()` çağrılır:

- localStorage temizlenir
- kullanıcı state’i sıfırlanır
- kullanıcı `/login`’e yönlendirilir

---

## 5) REST API Katmanı

REST çağrıları `src/services/apiClient.ts` içinde merkezi.

### 5.1) Base URL

`apiRequest` base URL’i:

- `import.meta.env.VITE_API_BASE_URL` varsa onu kullanır
- yoksa varsayılan: `http://localhost:8080`

### 5.2) Authorization Kullanımı

`apiRequest` içinde:

- `setAuthHeaderProvider(provider)` ile ayarlanan provider, her request’te Authorization header’ını üretir.
- Credentials yoksa Authorization gönderilmez.

### 5.3) JSON Parse ve Hata Fırlatma

`parseJsonSafely` sadece `content-type` içinde `application/json` olan response’ları JSON parse eder.

API hata örneği:

```ts
export type ApiError = {
  status: number
  message: string
  details?: unknown
}
```

Response `ok değilse` yukarıdaki tipe uygun şekilde `throw` yapılır.

### 5.4) AbortController ile İptal

Özellikle list/detail ekranlarında:

- `useEffect` içinde `AbortController` oluşturuluyor
- component unmount olunca `controller.abort()` çağrılıyor
- böylece state race condition azaltılıyor

---

## 6) Layout ve UI Tasarım Dili

### 6.1) Ortak Stil Sınıfları (Quick Reference)

UI’da kullanılan bazı ana sınıflar:

- Layout/çerçeve:
  - `app-theme`, `app-layout`, `app-sidebar`, `app-main-header`, `app-main-body`
- Kart/tablolar:
  - `app-panel`, `card`, `app-table`, `app-rows-divider`
- Butonlar:
  - `app-button-primary`, `app-button-secondary`, `auth-primary-button`
- Metin/etiketler:
  - `app-badge`, `badge`, `app-muted`, `app-pill` ve varyantları (`app-pill--success`, `app-pill--warn`, `app-pill--down`, `app-pill--info`)
- Auth ekranları:
  - `auth-theme`, `auth-card`, `auth-form`, `auth-field`, `auth-input`

### 6.2) `PublicLayout`

`PublicLayout`:

- `PublicTopNav` (landing üst bar)
- Landing içeriği için `Outlet`

### 6.3) `AuthLayout`

`AuthLayout`:

- Sol: login/register form (`<Outlet />`)
- Sağ: ürün/ekip faydası anlatan görsel/marketing panel

Bu sayfa “auth ekranlarının” tek tip kart tasarımını belirliyor.

### 6.4) `AppLayout` (Uygulama Ana Kabuğu)

`AppLayout`:

- sol: `AppSidebar`
- üst başlık: sayfa title/subtitle hesaplaması + `UserProfileMenu`
- body: `Outlet`

Sayfa başlığı `location.pathname` üzerinden türetiliyor. Örnek:

- `/app` => Dashboard
- `/warehouses` => Warehouses
- `/warehouses/:warehouseId` => Warehouse detail
- `/admin` => Admin
- `/account` => `/account/profile` yönlendirmesi
- `/account/profile` => My Profile
- `/account/settings` => Settings
- `/account/support` => Support
- diğer modüller ComingSoon olduğu için başlıklar aynı çerçevede görünüyor

---

## 7) Navigasyon (Sidebar / Üst Menü)

### 7.1) `AppSidebar`

`AppSidebar` modülleri kategori kategori gösteriyor:

- Dashboard (`/app`)
- Inventory
  - `/warehouses`
  - `/storage-locations`
  - `/products`
  - `/categories`
- Operations
  - `/stock-movements`
  - `/inventory-allocations`
  - `/shipments`
  - `/delivery-receipts`
- Sales
  - `/customers`
  - `/orders`
  - `/order-items`
- Packages & Codes
  - `/packages`
  - `/package-items`
  - `/barcodes`
  - `/qrcodes`
- Admin
  - sadece `hasCapability('admin.manage_users')` true ise görünür
- Settings (`/account/settings`)
- Support (`/account/support`)

### 7.2) `UserProfileMenu`

Üst sağda kullanıcı menüsü:

- menü aç-kapa davranışı var
- role label:
  - admin ise “SUPERUSER ACCESS”
  - diğer durum “USER ACCESS”
- dropdown item’ları:
  - `My Profile` (`/account/profile`)
  - `Dashboard` (`/app`)
  - admin ise `Admin` (`/admin`)
  - `Settings` (`/account/settings`)
  - `Support` (`/account/support`)
  - `Logout`

---

## 8) Sayfa Özellikleri (Pages)

### 8.1) `LandingPage` (`/`)

Tamamen public marketing içeriği:

- hero (başlık, alt metin, CTA)
- “Core modules” bölümünde modüllerin kavramsal anlatımı

Endpoint çağrısı yapmaz.

### 8.2) `LoginPage` (`/login`)

İş kuralları:

- Username/Password form alanları
- “Remember password” checkbox’ı
- başarılı login sonrası:
  - önce login state’inden `from` okunuyor, yoksa `/app`
- `location.state.registrationSuccess` varsa başarı mesajı olarak ekranda gösterilir
- “HTTP Basic Auth” anlatımı ve admin default bilgisi UI’da geçiyor:
  - `admin / admin123`

### 8.3) `RegisterPage` (`/register`)

İş kuralları:

- `password === confirmPassword` doğrulaması
- First name ve Last name zorunlu (profil verisi yoksa submit engellenir)
- `acceptedPrivacyTerms` (Privacy Notice + Terms of Use) zorunlu
- `acceptedEmployeeData` (employee/personal data processing onayı) zorunlu
- E-posta format doğrulaması (basit regex)
- Opsiyonel “additional employee fields”:
  - `showProfile` true olunca ekstra alanlar açılır
  - submit sırasında backend için profil payload temizlenir/sanitize edilir
- API çağrısı:
  - `POST /users/register`
  - payload: `RegistrationPayload` (username, email, password, `profile`, `consents`)
- Başarılı kayıt sonrası:
  - `/login`’e yönlendirme
  - `/login` sayfasında `location.state.registrationSuccess` olarak başarı mesajı gösterilir

### 8.4) `ConfirmEmailPage` (`/confirm-email`)

Email doğrulama (kayıt sonrası aktivasyon adımı).

Route akışı:

- Kayıt işlemi backend tarafında email doğrulaması gerektiriyorsa kullanıcı bir token içeren doğrulama linki alır.
- Router `GET` /param ile token alır (sayfada query string: `token`).
- Kullanıcı doğrulama yapınca hesap aktif edilir.

UI akışı:

- Sayfa `token` parametresi yoksa “token eksik” mesajı gösterir ve `/login`’e döner.
- Varsa kullanıcı butonu ile doğrulama tetiklenir.
- Backend çağrısı: `POST /users/confirm` ve body: `{ token }`.

### 8.5) `DashboardPage` (`/app`)

Dashboard ekranı şu an “UI/UX demo” ağırlıklı:

- KPI kartları, canlı operasyonlar, tablolar statik placeholder
- Aksiyon butonları capability bazlı render ediliyor:
  - `operations.write` => “Create Stock Movement”, “Create Shipment” gibi butonlar
  - `sales.write` => “Create Order”
  - `inventory.write` => “Add Product”
  - `warehouses.write` => “Add Warehouse”

Bu sayfada backend entegrasyonu henüz yok (butonlar sadece render mantığı gösteriyor).

### 8.6) `WarehousesListPage` (`/warehouses`)

Backend entegrasyonu var:

- `useWarehouses()` hook’u:
  - `GET /warehouses`
  - loading/error/success durumlarına göre tablo render ediyor
- tablo satırında:
  - `Open` linki: `/warehouses/:id`

### 8.7) `WarehouseDetailPage` (`/warehouses/:warehouseId`)

İş kuralları:

- `warehouseId` parametresi:
  - `Number()` ile parse ediliyor
  - `Number.isFinite` ile validasyon yapılıyor
- valid id ise:
  - `getWarehouseById(id, signal)` çağrılıyor
  - endpoint: `GET /warehouses/{id}`
- invalid id ise hata mesajı basılıyor

### 8.8) `AdminHomePage` (`/admin`)

Route guard:

- `/admin` zaten `RequireCapability` ile korunuyor (`admin.manage_users`)

UI tarafı:

`AdminHomePage` artık “sadece liste gösteren” bir sayfa değil; kullanıcı ve rol yönetimini modal tabanlı aksiyonlara bağlayan bir yönetim ekranıdır.

Genel akış ve state:

- `useAdminUsers()` => `GET /users` ile kullanıcıları getirir
- `useAdminRoles()` => `GET /roles` ile rolleri getirir
- Ekrandaki tablo/kartların kaynağı doğrudan hook yerine şu “override” state’lerinden gelir:
  - `usersOverride` (şu an `refreshUsers()` / modal callback ile güncellenir)
  - `rolesOverride` (rol oluşturma/düzenleme sonrası güncellenir)
- `adminActionError` ile global bir hata mesaj alanı gösterilir

UI yapısı (iki kolon):

- Sol kolonda `ACTIVE SYSTEM USERS` paneli
  - `Create User` butonu `AdminCreateUserModal` açar
  - Kullanıcı tablosu:
    - `ASSIGN ROLES` (rol atama) ikonu => `AdminAssignRolesModal`
      - Seçimler başlangıçta kullanıcının mevcut rol id’lerinden set edilir
      - “Save roles” ile `updateUserRoles()` çağrılır (PUT `/users/{userId}?roleIds=csv`)
    - Enabled/Disabled (aktif durumu) ikonu => `AdminToggleUserEnabledModal`
      - “Activate/Disable” ile `updateUserEnabled()` çağrılır
- Sağ kolonda `SYSTEM ROLES CONFIGURATION` paneli
  - Her rol için kart:
    - Edit ikonu => `AdminEditRoleModal` (PUT `/roles/{roleId}`)
    - Manage users ikonu => `AdminManageRoleUsersModal`
      - Sadece enabled kullanıcılar listelenir
      - “Last role” koruması: bir kullanıcının tek role’u çıkarılırken boşta kalmasını engellemek için checkbox disable edilir
    - Alt kısımda `Add new role` => `AdminCreateRoleModal` (POST `/roles`)

Modal ortak davranışları:

- Her modal `role="dialog" aria-modal="true"` ile overlay olarak render edilir
- Her modal `Escape` tuşunda kapanır (ilgili bileşende `window` keydown listener’ı var)
- Her modal kendi `ApiError` state’i üzerinden hata basar; başarılı aksiyondan sonra parent’te ilgili callback tetiklenir

Stil dosyaları:

- `adminPage.css` => sayfa düzeni (admin header / iki kolon grid / panel sınıfları)
- `adminModals.css` => modal overlay ve form/checkbox bileşenleri

### 8.9) `Account` Alanı (`/account/...`)

`AccountLayout` ile ortak bir “sol menü + sağ içerik” yapısı kullanılır.

Route’lar:

- `/account` => `/account/profile` yönlendirmesi
- `/account/profile` => `MyProfilePage`
- `/account/settings` => `SettingsPage`
- `/account/support` => `SupportPage`

Ortak wrapper: `AccountLayout`

- Sol tarafta “Menu” kartı:
  - `My profile` linki
  - aktif sekme `account-menu-link--active` ile belirtilir
  - `Logout` butonu (AuthContext `logout()` çağırır)
- Sağ tarafta sayfanın asıl içeriği (`children`)

Sayfalar:

- `MyProfilePage`:
  - Kullanıcı bilgisini ve rol açıklamasını gösterir
  - Foto/personal/address alanları için local-only edit modları vardır
- `SettingsPage`:
  - Tercih checkbox’ları (backend kalıcılığı “daha sonra”)
- `SupportPage`:
  - Mesaj formu UI-only çalışır; yanıt mesajı local olarak gösterilir

### 8.10) `ModuleWorkspacePage` (Workspace scaffold ekranları)

Bu sayfalar modül domain’leri için “UI scaffold” görevi görür.

Router tarafında aşağıdaki modül path’leri `ModuleWorkspacePage` ile eşlenir:

- `/storage-locations`
- `/products`
- `/categories`
- `/inventory`
- `/stock-movements`
- `/inventory-allocations`
- `/shipments`
- `/delivery-receipts`
- `/customers`
- `/orders`
- `/order-items`
- `/packages`
- `/package-items`
- `/barcodes`
- `/qrcodes`

Önemli: `ComingSoonPage` bu ekrana geriye dönük alias olarak re-export edilir.

`ModuleWorkspacePage`:

- `location.pathname` üzerinden `getModuleDefinition(location.pathname)` çağırır.
- `moduleRegistry` içindeki metadatayı kullanarak:
  - alan (`area`), başlık (`title`), açıklama (`description`)
  - backend collection bilgisi (örn. `GET {mod.apiBase}`)
  - `plannedFeatures` listesini
  - ilgili modül linklerini (`relatedRoutes`) gösterir
- Eğer `pathname` registry’de yoksa `getModuleDefinition()` varsayılan bir `ModuleDefinition` döndürür (area=Workspace, description=“domain-specific tools and data grids” vb.)
- `moduleRegistry` ayrıca `allModulePaths` ve (ileride kullanılmak üzere) `dashboardModuleShortcuts` gibi yardımcı export’lar içerir.
- Başlık alanında “UI scaffold — REST ready” rozeti gösterilir.
- Üst aksiyon bölümünde:
  - `/app` linki ile dashboard’a dönüş
  - `/warehouses` linki
  - `admin.manage_users` yeteneği varsa “Administration” linki
- “Next implementation steps” bölümünde UI’nin ileride nasıl tamamlanacağı listelenir.

---

## 9) Feature Modülleri (API + Hook + Types)

### 9.1) Warehouses

- `src/features/warehouses/types.ts`
  - `Warehouse` DTO:
    - `id`, `name`, `location`, `capacity`, `contactNumber`
- `src/features/warehouses/api.ts`
  - `getWarehouses(signal?)` => `GET /warehouses`
  - `getWarehouseById(warehouseId, signal?)` => `GET /warehouses/{warehouseId}`
- `src/features/warehouses/hooks/useWarehouses.ts`
  - `useEffect + AbortController` ile `getWarehouses`
  - `refetch` mekanizması için `reloadKey` state’i kullanılıyor

### 9.2) Admin

- `src/features/admin/types.ts`
  - `Role` ve `User` DTO’ları (User içinde `roleDTOs`)
- `src/features/admin/api.ts`
  - `getUsers()` => `GET /users`
  - `getRoles()` => `GET /roles`
  - `createRole(dto, signal?)` => `POST /roles`
  - `updateRole(roleId, dto, signal?)` => `PUT /roles/{roleId}`
  - `updateUserRoles(userId, userDTO, roleIds, signal?)` =>
    `PUT /users/{userId}?roleIds=csv`
  - `updateUserEnabled(userId, userDTO, enabled, roleIds, signal?)` =>
    `PUT /users/{userId}?roleIds=csv` (enable değişir)
- hooks:
  - `useAdminUsers()`, `useAdminRoles()` ayrı ayrı loading/error state yönetir

Bu fonksiyonlar:

- `AdminAssignRolesModal` (kullanıcıya rol atama)
- `AdminToggleUserEnabledModal` (kullanıcı enable/disable)
- `AdminCreateRoleModal` / `AdminEditRoleModal` (rol CRUD)
- `AdminManageRoleUsersModal` (bir role ait kullanıcıların toplu yönetimi)
tarafından kullanılır.

---

### 9.3) Users (Kayıt + E-posta doğrulama + Profil)

- `src/features/users/api.ts`
  - `registerUser(body, signal?)` => `POST /users/register`
  - `confirmRegistration(token, signal?)` => `POST /users/confirm` (body: `{ token }`)
  - `getCurrentUserDetail(signal?)` => `GET /users/me`
  - `updateMyProfile(profile, signal?)` => `PUT /users/me/profile`
- `src/features/users/types.ts`
  - `RegistrationPayload` => kayıtta backend’in beklediği `profile` + `consents` şeması

---

## 10) Mevcut UI Durumu ve Roadmap Varsayımı

Bu manuelde görülen mevcut durum:

- En kritik CRUD akışları henüz tamamlanmamış olabilir; özellikle `DashboardPage` UI demo seviyesinde.
- Modül path’leri `ModuleWorkspacePage` ile scaffold ediliyor.
- `ComingSoonPage` geriye dönük alias olarak bu ekrana re-export edilmiştir.
- Yetkilendirme altyapısı (RequireAuth/RequireCapability + role->capability map) çalışır şekilde tasarlanmış.
- Backend tarafındaki endpoint’ler (`/users/me`, `/users/register`, `/users/confirm`, `/users/me/profile`, `/warehouses`, `/warehouses/{id}`, `/users`, `/roles`) frontend’te şimdiden kullanılıyor.

---

## 11) Güvenlik Notları (Kısa)

Frontend şu an HTTP Basic Auth bilgilerini localStorage’da tutuyor (`wm_auth_basic`).

Bunun pratik etkileri:

- Parola tarayıcı localStorage’da saklandığı için XSS/cihaz güvenliği risklerine karşı hassastır.
- `https://` kullanılması kritik.
- Daha olgun bir yaklaşım token/session tabanlı kimlik doğrulama olabilir (future iyileştirme konusu).

---

## Ek: Dokümandan Navigasyon Listesi

Uygulama içinde görünen route’ların özeti:

- `/app`: `DashboardPage`
- `/login`: `LoginPage`
- `/register`: `RegisterPage`
- `/confirm-email`: `ConfirmEmailPage` (query: `?token=...`)
- `/warehouses`: `WarehousesListPage`
- `/warehouses/:warehouseId`: `WarehouseDetailPage`
- `/admin`: `AdminHomePage` (capability: `admin.manage_users`)
- `/account`: `/account/profile` yönlendirmesi
- `/account/profile`: `MyProfilePage`
- `/account/settings`: `SettingsPage`
- `/account/support`: `SupportPage`
- `/storage-locations`, `/products`, `/categories`, `/inventory`, `/stock-movements`, `/inventory-allocations`, `/shipments`, `/delivery-receipts`, `/customers`, `/orders`, `/order-items`, `/packages`, `/package-items`, `/barcodes`, `/qrcodes`: hepsi `ModuleWorkspacePage`

