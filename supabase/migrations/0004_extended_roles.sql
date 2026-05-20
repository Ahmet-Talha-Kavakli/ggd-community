-- =============================================================================
-- Ek roller: Co-Owner, Admin, Helper, Trusted
-- Hiyerarşi: owner > co_owner > admin > moderator > helper > trusted > member
-- =============================================================================

-- ENUM'a yeni değerler ekle (idempotent)
alter type user_role add value if not exists 'co_owner' before 'moderator';
alter type user_role add value if not exists 'admin' before 'moderator';
alter type user_role add value if not exists 'helper' after 'moderator';
alter type user_role add value if not exists 'trusted' after 'helper';

-- NOT: PostgreSQL ALTER TYPE ADD VALUE aynı transaction'da kullanılamaz.
-- Bu yüzden aşağıdaki fonksiyon güncellemesini AYRI bir Run ile çalıştır.

-- =============================================================================
-- ⚠️ Yukarıdaki ALTER TYPE komutlarını çalıştırdıktan sonra
-- aşağıdaki bloğu AYRI BİR query olarak çalıştır (yeni "New query" aç).
-- =============================================================================

/*
-- is_admin'i genişlet: 4 admin-tier rolü
create or replace function is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = uid and role in ('owner', 'co_owner', 'admin', 'moderator')
  );
$$;

-- Helper yetkisi: Sadece şikayet inceleyebilir (karar veremez) — UI tarafında kontrol edilir
create or replace function can_help(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = uid
      and role in ('owner', 'co_owner', 'admin', 'moderator', 'helper')
  );
$$;
*/

-- =============================================================================
-- Notlar:
-- - 'co_owner' enum değeri olduğu için snake_case (PostgreSQL standardı)
-- - UI'da "Co-Owner" olarak gösterilecek
-- - Mevcut owner/moderator/member kayıtları etkilenmez
-- - Helper, Trusted yeni rollerin yetkileri başlangıçta member'a yakın
-- =============================================================================
