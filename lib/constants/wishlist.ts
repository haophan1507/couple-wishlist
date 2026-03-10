export const WISHLIST_CATEGORY_OPTIONS = [
  "Thời trang",
  "Mỹ phẩm & chăm sóc da",
  "Nước hoa",
  "Trang sức",
  "Túi xách & phụ kiện",
  "Giày dép",
  "Công nghệ",
  "Thiết bị gia dụng",
  "Sách",
  "Khóa học",
  "Sức khỏe & thể thao",
  "Du lịch",
  "Hẹn hò & trải nghiệm",
  "Đồ trang trí phòng",
  "Hoa & cây",
  "Đồ ăn & thức uống",
  "Đồ handmade",
  "Âm nhạc & giải trí",
  "Đồ cho thú cưng",
  "Quà tinh thần",
] as const;

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "Thời trang":
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
  "Mỹ phẩm & chăm sóc da":
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
  "Nước hoa":
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
  "Trang sức":
    "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80",
  "Túi xách & phụ kiện":
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
  "Giày dép":
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
  "Công nghệ":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "Thiết bị gia dụng":
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
  "Sách":
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
  "Khóa học":
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
  "Sức khỏe & thể thao":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  "Du lịch":
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
  "Hẹn hò & trải nghiệm":
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
  "Đồ trang trí phòng":
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80",
  "Hoa & cây":
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
  "Đồ ăn & thức uống":
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
  "Đồ handmade":
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
  "Âm nhạc & giải trí":
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
  "Đồ cho thú cưng":
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
  "Quà tinh thần":
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
};

export function getWishlistFallbackImage(category: string | null | undefined) {
  if (!category) {
    return "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80";
  }
  return CATEGORY_IMAGE_MAP[category] ?? "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80";
}

