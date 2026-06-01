export const APP_NAME = "Góc Của Tụi Mình";

export const APP_DESCRIPTION =
  "Không gian riêng để lưu wishlist, ngày đặc biệt, địa điểm yêu thương, khoảnh khắc và những món quà đã đi cùng hai bạn.";

export const APP_SHORT_DESCRIPTION =
  "Một góc riêng để tụi mình lưu lại điều muốn nhớ, nơi đã qua, ngày cần nhắc và những bất ngờ dành cho nhau.";

export const APP_NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/gift-history", label: "Kỷ niệm quà" },
  { href: "/heart-mapping", label: "Bản đồ yêu thương" },
  { href: "/special-days", label: "Ngày đặc biệt" },
  { href: "/gallery", label: "Khoảnh khắc" },
] as const;

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/wishlist", label: "Wishlist" },
  { href: "/admin/gift-history", label: "Kỷ niệm quà" },
  { href: "/admin/places", label: "Bản đồ yêu thương" },
  { href: "/admin/special-days", label: "Ngày đặc biệt" },
  { href: "/admin/gallery", label: "Khoảnh khắc" },
] as const;
