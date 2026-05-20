# Supabase Kurulumu

Bu klasörde Supabase için gerekli SQL migration'ları var. Aşağıdaki adımları sırayla uygula.

## 1. SQL şemasını çalıştır

1. Supabase Dashboard → projeyi aç → sol menüden **SQL Editor**
2. **New query**'ye tıkla
3. `migrations/0001_initial_schema.sql` dosyasının içeriğini kopyala, yapıştır
4. Sağ üstte **Run** (▶)
5. "Success. No rows returned" mesajını görmen lazım

## 2. Storage bucket'larını oluştur

1. Sol menüden **Storage** → **New bucket**
2. Birinci bucket:
   - Name: `report-evidence`
   - Public: **kapalı** (Private)
   - File size limit: 50 MB
   - Allowed MIME types: `image/*, video/*`
3. İkinci bucket:
   - Name: `announcement-media`
   - Public: **açık** (Public)
   - File size limit: 10 MB
   - Allowed MIME types: `image/*`
4. Tekrar SQL Editor'a dön
5. `migrations/0002_storage_buckets.sql` içeriğini yapıştır, Run

## 3. Auth ayarları

1. Sol menüden **Authentication** → **Providers**
2. **Email** sağlayıcı zaten açık olmalı
3. **Google** sağlayıcısını aktif et:
   - Google Cloud Console'da OAuth client oluştur
   - Authorized redirect URI: `https://nmzuzdclstbzdeflnynq.supabase.co/auth/v1/callback`
   - Client ID ve Secret'i Supabase'e yapıştır
4. **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:3000` (dev için)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://senin-domain.com/auth/callback`

## 4. İlk admin'i oluştur

Kayıt akışı normalde herkesi `member` rolüyle oluşturur. İlk admin'i SQL ile yükselt:

```sql
-- Önce kayıt ol (web sitesinden carreinaofficial@gmail.com ile)
-- Sonra bu SQL'i çalıştır:
update profiles
set role = 'owner', verification_status = 'approved'
where email = 'carreinaofficial@gmail.com';
```

## 5. Doğrulama

SQL Editor'da şu sorguyu çalıştırarak tablolarının oluştuğunu doğrula:

```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Şu tabloları görmelisin:
- announcements
- audit_log
- bans
- channels
- messages
- profiles
- report_evidence
- reports
- room_code
- support_tickets
- warnings
