# Screenshot checklist (GitHub README)

Place PNG or WebP files in this folder using the names below so the root `README.md` references stay valid.

## How to capture

1. Run backend and frontend locally with **realistic seed data** (or demo users) so tables are not empty.  
2. Use a **consistent browser width** (e.g. 1440×900 or 1920×1080).  
3. Hide bookmarks bar if needed; use light or dark mode **consistently** across all shots.  
4. **Admin** screenshots require a user with the `admin.manage_users` capability.

## Current files (in repo)

| File | Suggested screen (match README) |
|------|--------------------------------|
| `Screenshot_4.png` | Warehouses (`/warehouses`) |
| `Screenshot_5.png` | Products (`/products`) |
| `Screenshot_6.png` | Stock levels (`/inventory`) |
| `Screenshot_7.png` | Orders (`/orders`) |
| `Screenshot_8.png` | Shipments (`/shipments`) |
| `Screenshot_9.png` | Admin (`/admin`) |
| `Screenshot_10.png` | Profile (`/account/profile`) |
| `Screenshot_11.png` | Extra (e.g. categories, landing) — rename caption in root `README.md` if you prefer |

## Optional naming (if you add more)

| File | Route | Notes |
|------|--------|--------|
| `01-landing.png` | `/` | Hero + navigation visible |
| `02-login.png` | `/login` | Clean form, no password visible |
| `03-dashboard.png` | `/app` | KPIs / shortcuts visible |

## Optional extras (if you want more depth)

| File | Route |
|------|--------|
| `11-categories.png` | `/categories` |
| `12-stock-movements.png` | `/stock-movements` |
| `13-customers.png` | `/customers` |
| `14-order-items.png` | `/order-items` |
| `15-storage-locations.png` | `/storage-locations` |

After adding images, uncomment or add image tags in the **Screenshots** section of the root `README.md`.
