-- =============================================================================
-- DEMO SEED — sahte topluluk verisi (50 uye + 8 ban + 5 uyari + 3 sikayet)
--
-- AMAC: Site yeniyken "topluluk canli" hissi vermek. Yeni gelen kullanici
-- bos sayfa goremez — son katilanlar, kara liste, uyari sistemi dolu.
--
-- ETIK NOT: Bu data **sahte**. Hicbir nickname/email gercek bir kisiyle
-- iliskili degil. Generic Turkish gamer isimleri kullanildi. Production
-- before-launch'ta calistir, ileride istersen tamamen sil:
--   delete from profiles where email like '%@goosecage.demo';
--
-- Idempotent: tekrar tekrar calistirilabilir (on conflict do nothing).
-- =============================================================================

do $$
declare
  admin_id uuid;
begin
  -- Mevcut admin/owner id'sini bul (ban/warning issued_by icin gerekli)
  select id into admin_id
  from profiles
  where role in ('owner', 'co_owner', 'admin')
  order by joined_at asc
  limit 1;

  if admin_id is null then
    raise notice 'Admin profili bulunamadi. Once bir admin user olusturup tekrar dene.';
    return;
  end if;

  -- ─── 50 SAHTE UYE ─────────────────────────────────────────────────────────
  insert into profiles (id, email, nickname, ggd_user_id, role, verification_status, joined_at, last_active_at, bio)
  values
    -- Son 7 gun (yeni katilanlar, 10 uye)
    (gen_random_uuid(), 'seed-kingsroad@goosecage.demo',     'KingsRoad',     '100200301', 'member', 'approved', now() - interval '2 hour',  now() - interval '1 hour',  null),
    (gen_random_uuid(), 'seed-toksikkaz@goosecage.demo',     'ToksikKaz',     '100200302', 'member', 'approved', now() - interval '6 hour',  now() - interval '3 hour',  null),
    (gen_random_uuid(), 'seed-honkmaster@goosecage.demo',    'HonkMaster',    '100200303', 'member', 'approved', now() - interval '12 hour', now() - interval '5 hour',  'Pro Honk kullanıcısı'),
    (gen_random_uuid(), 'seed-kanadalikurt@goosecage.demo',  'KanadaliKurt',  '100200304', 'member', 'approved', now() - interval '1 day',   now() - interval '8 hour',  null),
    (gen_random_uuid(), 'seed-avcigalip@goosecage.demo',     'AvciGalip',     '100200305', 'member', 'approved', now() - interval '1 day' - interval '6 hour', now() - interval '20 hour', null),
    (gen_random_uuid(), 'seed-gurkanggg@goosecage.demo',     'GurkanGGG',     '100200306', 'member', 'pending',  now() - interval '2 day',   now() - interval '1 day',   null),
    (gen_random_uuid(), 'seed-tutuctunc@goosecage.demo',     'TutucuTunc',    '100200307', 'member', 'approved', now() - interval '3 day',   now() - interval '2 day',   'Akşamcı oyuncu'),
    (gen_random_uuid(), 'seed-bomberomer@goosecage.demo',    'BomberOmer',    '100200308', 'member', 'approved', now() - interval '4 day',   now() - interval '2 day',   null),
    (gen_random_uuid(), 'seed-promertoy@goosecage.demo',     'ProMertOY',     '100200309', 'member', 'approved', now() - interval '5 day',   now() - interval '3 day',   null),
    (gen_random_uuid(), 'seed-skullkaz@goosecage.demo',      'SkullKaz',      '100200310', 'member', 'approved', now() - interval '6 day',   now() - interval '4 day',   null),

    -- Son 30 gun (15 uye)
    (gen_random_uuid(), 'seed-batmankaz@goosecage.demo',     'BatmanKaz',     '100200311', 'member', 'approved', now() - interval '8 day',   now() - interval '6 day',   null),
    (gen_random_uuid(), 'seed-opsamet@goosecage.demo',       'OPSamet',       '100200312', 'member', 'approved', now() - interval '10 day',  now() - interval '7 day',   'Genelde Üye, bazen Kanadalı'),
    (gen_random_uuid(), 'seed-captainahmet@goosecage.demo',  'CaptainAhmet',  '100200313', 'member', 'approved', now() - interval '11 day',  now() - interval '8 day',   null),
    (gen_random_uuid(), 'seed-oyuncumuratx@goosecage.demo',  'OyuncuMuratX',  '100200314', 'member', 'pending',  now() - interval '13 day',  now() - interval '10 day',  null),
    (gen_random_uuid(), 'seed-kizgnkaz@goosecage.demo',      'KizgnKaz',      '100200315', 'member', 'approved', now() - interval '14 day',  now() - interval '12 day',  null),
    (gen_random_uuid(), 'seed-siyahkaz@goosecage.demo',      'SiyahKaz',      '100200316', 'member', 'approved', now() - interval '15 day',  now() - interval '12 day',  null),
    (gen_random_uuid(), 'seed-beyazordek@goosecage.demo',    'BeyazOrdek',    '100200317', 'member', 'approved', now() - interval '17 day',  now() - interval '14 day',  null),
    (gen_random_uuid(), 'seed-yukseltkaz@goosecage.demo',    'YukseltKaz',    '100200318', 'member', 'approved', now() - interval '18 day',  now() - interval '15 day',  'Yardım severim'),
    (gen_random_uuid(), 'seed-malcolmgoose@goosecage.demo',  'MalcolmGoose',  '100200319', 'member', 'approved', now() - interval '20 day',  now() - interval '17 day',  null),
    (gen_random_uuid(), 'seed-riseandshine@goosecage.demo',  'RiseAndShine',  '100200320', 'member', 'approved', now() - interval '21 day',  now() - interval '18 day',  null),
    (gen_random_uuid(), 'seed-saboteurr@goosecage.demo',     'SaboteurR',     '100200321', 'member', 'approved', now() - interval '23 day',  now() - interval '20 day',  null),
    (gen_random_uuid(), 'seed-silentkaz@goosecage.demo',     'SilentKaz',     '100200322', 'member', 'approved', now() - interval '24 day',  now() - interval '21 day',  null),
    (gen_random_uuid(), 'seed-nighthawk@goosecage.demo',     'NightHawk67',   '100200323', 'member', 'approved', now() - interval '26 day',  now() - interval '23 day',  null),
    (gen_random_uuid(), 'seed-pelikanreis@goosecage.demo',   'PelikanReis',   '100200324', 'member', 'approved', now() - interval '27 day',  now() - interval '24 day',  'Pelikan favori rolüm'),
    (gen_random_uuid(), 'seed-bombkaptan@goosecage.demo',    'BombKaptan',    '100200325', 'member', 'approved', now() - interval '29 day',  now() - interval '26 day',  null),

    -- Son 60 gun (25 uye)
    (gen_random_uuid(), 'seed-guvercinavci@goosecage.demo',  'GuvercinAvci',  '100200326', 'member', 'approved', now() - interval '32 day',  now() - interval '29 day',  null),
    (gen_random_uuid(), 'seed-zilcinoob@goosecage.demo',     'ZilciNoob',     '100200327', 'member', 'approved', now() - interval '33 day',  now() - interval '30 day',  null),
    (gen_random_uuid(), 'seed-programmingkaz@goosecage.demo','ProgrammingKaz','100200328', 'member', 'approved', now() - interval '35 day',  now() - interval '32 day',  'Coder + Honker'),
    (gen_random_uuid(), 'seed-gamerserdar@goosecage.demo',   'GamerSerdar',   '100200329', 'member', 'approved', now() - interval '36 day',  now() - interval '33 day',  null),
    (gen_random_uuid(), 'seed-twistedkaz@goosecage.demo',    'TwistedKaz',    '100200330', 'member', 'approved', now() - interval '38 day',  now() - interval '35 day',  null),
    (gen_random_uuid(), 'seed-sneakygoose@goosecage.demo',   'SneakyGoose',   '100200331', 'member', 'approved', now() - interval '39 day',  now() - interval '36 day',  null),
    (gen_random_uuid(), 'seed-misterx@goosecage.demo',       'MisterX',       '100200332', 'member', 'approved', now() - interval '41 day',  now() - interval '38 day',  null),
    (gen_random_uuid(), 'seed-dragongoose@goosecage.demo',   'DragonGoose',   '100200333', 'member', 'approved', now() - interval '42 day',  now() - interval '39 day',  null),
    (gen_random_uuid(), 'seed-flyingduck@goosecage.demo',    'FlyingDuck',    '100200334', 'member', 'approved', now() - interval '44 day',  now() - interval '41 day',  null),
    (gen_random_uuid(), 'seed-ankakusu@goosecage.demo',      'AnkaKusu',      '100200335', 'member', 'approved', now() - interval '45 day',  now() - interval '42 day',  null),
    (gen_random_uuid(), 'seed-korkusuzkaz@goosecage.demo',   'KorkusuzKaz',   '100200336', 'member', 'approved', now() - interval '47 day',  now() - interval '44 day',  null),
    (gen_random_uuid(), 'seed-kinghonk@goosecage.demo',      'KingHonk',      '100200337', 'member', 'approved', now() - interval '48 day',  now() - interval '45 day',  null),
    (gen_random_uuid(), 'seed-crazykaz@goosecage.demo',      'CrazyKaz',      '100200338', 'member', 'approved', now() - interval '50 day',  now() - interval '47 day',  null),
    (gen_random_uuid(), 'seed-wildgoose@goosecage.demo',     'WildGoose',     '100200339', 'member', 'approved', now() - interval '51 day',  now() - interval '48 day',  null),
    (gen_random_uuid(), 'seed-cleangoose@goosecage.demo',    'CleanGoose',    '100200340', 'member', 'approved', now() - interval '53 day',  now() - interval '50 day',  'Temiz oyun severim'),
    (gen_random_uuid(), 'seed-fastflight@goosecage.demo',    'FastFlight',    '100200341', 'member', 'approved', now() - interval '54 day',  now() - interval '51 day',  null),
    (gen_random_uuid(), 'seed-nightowl@goosecage.demo',      'NightOwl',      '100200342', 'member', 'approved', now() - interval '56 day',  now() - interval '53 day',  null),
    (gen_random_uuid(), 'seed-blackswan@goosecage.demo',     'BlackSwan',     '100200343', 'member', 'approved', now() - interval '57 day',  now() - interval '54 day',  null),
    (gen_random_uuid(), 'seed-turbogoose@goosecage.demo',    'TurboGoose',    '100200344', 'member', 'approved', now() - interval '59 day',  now() - interval '56 day',  null),
    (gen_random_uuid(), 'seed-stealthoyun@goosecage.demo',   'StealthOyun',   '100200345', 'member', 'approved', now() - interval '60 day',  now() - interval '57 day',  null),
    (gen_random_uuid(), 'seed-tacticalkaz@goosecage.demo',   'TacticalKaz',   '100200346', 'member', 'approved', now() - interval '62 day',  now() - interval '59 day',  null),
    (gen_random_uuid(), 'seed-progamertr@goosecage.demo',    'ProGamerTR',    '100200347', 'member', 'approved', now() - interval '64 day',  now() - interval '61 day',  null),
    (gen_random_uuid(), 'seed-gooselord@goosecage.demo',     'GooseLord',     '100200348', 'member', 'approved', now() - interval '66 day',  now() - interval '63 day',  null),
    (gen_random_uuid(), 'seed-masterstrat@goosecage.demo',   'MasterStrat',   '100200349', 'member', 'approved', now() - interval '68 day',  now() - interval '65 day',  null),
    (gen_random_uuid(), 'seed-ToxicBird@goosecage.demo',     'ToxicBird',     '100200350', 'member', 'approved', now() - interval '70 day',  now() - interval '67 day',  null)
  on conflict (email) do nothing;

  -- ─── 8 SAHTE BAN ─────────────────────────────────────────────────────────
  -- Target'lar tamamen uydurma toxic nick'ler (sahte uye listesinde yok)
  insert into bans (ggd_user_id, target_nickname, target_main_name, reason, reason_tags, duration, expires_at, banned_by, is_active, created_at)
  values
    ('200300401', 'HileciVitor',    'HileciVitor',    'Aimbot kullanırken yakalandı, 3 farklı lobi şikayet etti.', array['cheat'], 'permanent', null, admin_id, true, now() - interval '3 day'),
    ('200300402', 'KasitliKill',    'KasitliKill',    'Sürekli takım sabotajı, masum kesimleri uyarılara rağmen devam etti.', array['sabotage', 'rule_violation'], 'permanent', null, admin_id, true, now() - interval '8 day'),
    ('200300403', 'AltHesapCi',     'AltHesapCi',     'Daha önce banlı oyuncu, alt hesapla geri döndü.', array['multi_account'], 'permanent', null, admin_id, true, now() - interval '12 day'),
    ('200300404', 'SpamAttilla',    'SpamAttilla',    'Mikrofonda müzik açıp lobiyi rahatsız etti.', array['mic_spam', 'muzik_acma'], '30d', now() + interval '18 day', admin_id, true, now() - interval '15 day'),
    ('200300405', 'KurdurganKaz',   'KurdurganKaz',   'Hakaret içerikli mesajlar, küfür spam.', array['insult', 'spam_chat'], '30d', now() + interval '10 day', admin_id, true, now() - interval '20 day'),
    ('200300406', 'TeamingciTroll', 'TeamingciTroll', 'Aynı katil arkadaşıyla 5 lobide teaming yaptı.', array['teaming'], 'permanent', null, admin_id, true, now() - interval '25 day'),
    ('200300407', 'MasumKesicim',   'MasumKesicim',   'Masum kesici rolünde infosuz öldürme defalarca.', array['infosuz_kesme'], '7d', now() - interval '20 day', admin_id, false, now() - interval '32 day'),
    ('200300408', 'BomberAyas',     'BomberAyas',     'Boş infoya sürekli zile basıp lobiyi sabote etti.', array['bos_info_zil', 'rule_violation'], '7d', now() + interval '4 day', admin_id, true, now() - interval '3 day')
  on conflict do nothing;

  -- ─── 5 SAHTE UYARI ───────────────────────────────────────────────────────
  insert into warnings (ggd_user_id, target_nickname, target_main_name, reason, reason_tags, severity, issued_by, is_active, created_at)
  values
    ('200300501', 'YeniBaslayan42', 'YeniBaslayan42', 'Oylamada söz almadan konuşma.', array['soz_kesme'], 'low',    admin_id, true, now() - interval '1 day'),
    ('200300502', 'AsiKaz',         'AsiKaz',         'Ünlü olduğunu oylamada belli etti.', array['unlu_belli_etme'], 'medium', admin_id, true, now() - interval '4 day'),
    ('200300503', 'GezginCarpik',   'GezginCarpik',   'Üç kişiden fazla gezme.', array['fazla_gezme'], 'low',    admin_id, true, now() - interval '6 day'),
    ('200300504', 'IsraciOyuncu',   'IsraciOyuncu',   'Masumken sürekli birini takip etti.', array['takip_darlamak'], 'medium', admin_id, true, now() - interval '10 day'),
    ('200300505', 'TartismaciKaz',  'TartismaciKaz',  'Oylamada sürekli söz kesme, ısrarcı tartışma.', array['soz_kesme', 'oylama_duzeni'], 'high',   admin_id, true, now() - interval '14 day')
  on conflict do nothing;

  -- ─── 3 SAHTE SIKAYET ─────────────────────────────────────────────────────
  -- Bir sahte uyenin id'sini bul (KingsRoad seed'ledik) — reporter olarak kullan
  insert into reports (reporter_id, target_ggd_user_id, target_nickname, target_main_name, category, description, status, created_at)
  select p.id, '200300601', 'BomberLuks', 'BomberLuks', 'sabotage'::report_category,
         'Sürekli zile basıp lobiyi sabote etti. Birden çok kez yaptı, oyuna kasten engel oluyor.',
         'pending'::report_status, now() - interval '12 hour'
  from profiles p where p.email = 'seed-kingsroad@goosecage.demo' on conflict do nothing;

  insert into reports (reporter_id, target_ggd_user_id, target_nickname, target_main_name, category, description, status, created_at)
  select p.id, '200300602', 'HareketsizAFK', 'HareketsizAFK', 'other'::report_category,
         'Oyun başlıyor ama hareket etmiyor, AFK kalıyor. Lobiyi yarım bırakıyor.',
         'investigating'::report_status, now() - interval '2 day'
  from profiles p where p.email = 'seed-honkmaster@goosecage.demo' on conflict do nothing;

  insert into reports (reporter_id, target_ggd_user_id, target_nickname, target_main_name, category, description, status, created_at)
  select p.id, '200300603', 'KusurluKaz', 'KusurluKaz', 'insult'::report_category,
         'Lobide ailem ve kişiliğim hakkında çirkin laflar etti. Sözlü taciz.',
         'resolved'::report_status, now() - interval '5 day'
  from profiles p where p.email = 'seed-tutuctunc@goosecage.demo' on conflict do nothing;

  raise notice 'Demo seed tamamlandi: 50 uye + 8 ban + 5 uyari + 3 sikayet.';
end $$;
