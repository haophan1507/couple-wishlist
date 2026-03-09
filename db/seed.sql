insert into couple_profile (
  person_one_name,
  person_two_name,
  love_start_date,
  person_one_birthday,
  person_two_birthday,
  person_one_favorite,
  person_two_favorite,
  person_one_hobby,
  person_two_hobby,
  story,
  cover_image_path,
  cover_image_alt
)
values (
  'Alex',
  'Jamie',
  '2021-02-20',
  '1998-08-15',
  '1999-11-04',
  'Ca phe sua da, may anh film',
  'Hoa tulip, spa, do trang suc nho',
  'Chup anh, di dao cuoi tuan',
  'Doc sach, cham soc cay, di picnic',
  'We started with coffee dates and now collect memories, little traditions, and ideas for meaningful gifts.',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80',
  'Anh bia cap doi'
)
on conflict do nothing;

insert into wishlist_items
  (owner_type, title, description, image_path, image_alt, product_url, price_min, price_max, category, priority, note, status)
values
  (
    'me',
    'Vintage Film Camera',
    'A compact 35mm camera for travel memories.',
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1200&q=80',
    'May anh film vintage',
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
    'Bo matcha ceramic',
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
    'Voucher spa cuoi tuan',
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
    'Day chuyen chu cai',
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

insert into gallery_items (image_path, image_alt, caption, memory_date)
values
  (
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
    'Anh chuyen di bien',
    'First beach trip',
    '2022-06-12'
  ),
  (
    'https://images.unsplash.com/photo-1506629905607-45ecff6f34f7?auto=format&fit=crop&w=1200&q=80',
    'Anh bua toi ky niem',
    'Our anniversary dinner',
    '2024-10-08'
  ),
  (
    'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1200&q=80',
    'Anh di dao ngay mua',
    'Rainy weekend coffee walk',
    '2025-09-22'
  )
on conflict do nothing;

insert into gift_history_items
  (recipient_owner_type, gift_name, giver_name, received_date, note, photo_path, photo_alt, status)
values
  (
    'honey',
    'Bó tulip màu kem',
    'Hào',
    '2025-10-08',
    'Một bó hoa cho buổi tối kỷ niệm, vẫn còn ép khô một cánh trong cuốn sổ tay.',
    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80',
    'Bo tulip mau kem',
    'thanked'
  ),
  (
    'me',
    'Máy ảnh film bỏ túi',
    'Trà',
    '2025-12-24',
    'Món quà Giáng Sinh để mang theo trong mọi chuyến đi của hai đứa.',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    'May anh film bo tui',
    'received'
  )
on conflict do nothing;

insert into place_memories
  (title, slug, description, status, visit_date, location_name, latitude, longitude, city, country, cover_image_path, cover_image_alt, sort_order)
values
  (
    'Đà Lạt đầu tiên',
    'da-lat-dau-tien',
    'Chuyến đi se lạnh đầu tiên, uống cà phê sáng và đi dạo quanh hồ.',
    'visited',
    '2022-12-18',
    'Đà Lạt, Lâm Đồng',
    11.940420,
    108.458313,
    'Đà Lạt',
    'Việt Nam',
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    'Đà Lạt mù sương',
    1
  ),
  (
    'Phú Quốc hoàng hôn',
    'phu-quoc-hoang-hon',
    'Buổi chiều ngắm biển và ăn tối sát bờ cát.',
    'visited',
    '2024-05-04',
    'Phú Quốc, Kiên Giang',
    10.289879,
    103.984020,
    'Phú Quốc',
    'Việt Nam',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Biển Phú Quốc lúc hoàng hôn',
    2
  ),
  (
    'Nhật Bản mùa thu',
    'nhat-ban-mua-thu',
    'Một hành trình tụi mình vẫn đang lên kế hoạch cho mùa lá đỏ.',
    'planned',
    null,
    'Kyoto, Nhật Bản',
    35.011564,
    135.768149,
    'Kyoto',
    'Nhật Bản',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    'Con đường lá đỏ ở Kyoto',
    3
  )
on conflict do nothing;

insert into place_memory_images
  (place_memory_id, image_path, image_alt, caption, sort_order)
select
  pm.id,
  image_data.image_path,
  image_data.image_alt,
  image_data.caption,
  image_data.sort_order
from (
  values
    ('da-lat-dau-tien', 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80', 'Quán cà phê ở Đà Lạt', 'Buổi sáng lạnh và ly cà phê nóng', 1),
    ('da-lat-dau-tien', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'Đồi thông', 'Con dốc nhỏ tụi mình chụp ảnh cùng nhau', 2),
    ('phu-quoc-hoang-hon', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80', 'Bãi biển Phú Quốc', 'Hoàng hôn vàng cam và gió biển', 1),
    ('nhat-ban-mua-thu', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80', 'Ngôi đền ở Kyoto', 'Một hình dung nhỏ cho chuyến đi tương lai', 1)
) as image_data (place_slug, image_path, image_alt, caption, sort_order)
join place_memories pm on pm.slug = image_data.place_slug
on conflict do nothing;
