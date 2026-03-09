insert into couple_profile (person_one_name, person_two_name, story, cover_image_url)
values (
  'Alex',
  'Jamie',
  'We started with coffee dates and now collect memories, little traditions, and ideas for meaningful gifts.',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80'
)
on conflict do nothing;

insert into wishlist_items
  (owner_type, title, description, image_url, product_url, price_min, price_max, category, priority, note, status)
values
  (
    'me',
    'Vintage Film Camera',
    'A compact 35mm camera for travel memories.',
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1200&q=80',
    'https://example.com/film-camera',
    120,
    180,
    'Photography',
    'high',
    'Silver or black body preferred.',
    'available'
  ),
  (
    'me',
    'Ceramic Matcha Set',
    'Minimal Japanese style tea set.',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'https://example.com/matcha-set',
    45,
    70,
    'Home',
    'medium',
    null,
    'available'
  ),
  (
    'honey',
    'Weekend Spa Voucher',
    'Relaxing spa day for two.',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    'https://example.com/spa-voucher',
    80,
    150,
    'Experience',
    'high',
    'Flexible date voucher if possible.',
    'available'
  ),
  (
    'honey',
    'Gold Initial Necklace',
    'Simple and elegant initial necklace.',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80',
    'https://example.com/necklace',
    60,
    120,
    'Fashion',
    'medium',
    null,
    'available'
  )
on conflict do nothing;

insert into special_days (title, description, date, type)
values
  ('Alex Birthday', 'Cake and dinner night.', '1998-08-15', 'birthday'),
  ('Jamie Birthday', 'Picnic and sunset photos.', '1999-11-04', 'birthday'),
  ('First Date', 'Our first coffee date.', '2021-02-20', 'relationship'),
  ('Anniversary', 'Our yearly celebration.', '2021-10-08', 'anniversary'),
  ('Valentine''s Day', 'A sweet day for us.', '2022-02-14', 'holiday')
on conflict do nothing;

insert into gallery_items (image_url, caption, memory_date)
values
  (
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
    'First beach trip',
    '2022-06-12'
  ),
  (
    'https://images.unsplash.com/photo-1506629905607-45ecff6f34f7?auto=format&fit=crop&w=1200&q=80',
    'Our anniversary dinner',
    '2024-10-08'
  ),
  (
    'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1200&q=80',
    'Rainy weekend coffee walk',
    '2025-09-22'
  )
on conflict do nothing;
