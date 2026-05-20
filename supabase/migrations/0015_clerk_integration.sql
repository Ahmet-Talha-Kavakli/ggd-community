-- =============================================================================
-- Clerk authentication entegrasyonu.
--
-- Supabase Auth yerine Clerk kullanıyoruz. profiles.id artık auth.users(id)'ye
-- bağlı değil; bunun yerine clerk_user_id ile Clerk'e bağlanıyor.
-- =============================================================================

-- 1) clerk_user_id kolonu ekle
alter table profiles
  add column if not exists clerk_user_id text unique;

create index if not exists profiles_clerk_user_id_idx
  on profiles (clerk_user_id);

-- 2) profiles.id'nin auth.users FK'sını kaldır (çünkü artık auth.users yok)
alter table profiles
  drop constraint if exists profiles_id_fkey;

-- 3) handle_new_user trigger'ını kaldır (Supabase Auth'a aitti)
drop trigger if exists on_auth_user_created on auth.users;

-- 4) RLS helper'ları — Clerk JWT 'sub' claim'ini profil ID'sine çevirir.
--    Bu sayede Clerk JWT Template'i profile UUID'sini sub olarak basacak.

-- is_admin fonksiyonu zaten profile.id alıyor, değişiklik gerekmez.
-- auth.uid() Clerk JWT'nin sub claim'inden UUID döndürür (template ayarlı ise).

-- 5) audit_log policy'sindeki bug fix (0014'te eklenmişti, idempotent)
drop policy if exists "audit_log self insert" on audit_log;
create policy "audit_log self insert" on audit_log
  for insert with check (
    actor_id = auth.uid()
    or is_admin(auth.uid())
  );
