"use client";

import { useMemo, useState } from "react";
import { WISHLIST_CATEGORY_OPTIONS } from "@/lib/constants/wishlist";

export function WishlistCategoryField({
  defaultCategory = "",
}: {
  defaultCategory?: string;
}) {
  const knownCategorySet = useMemo(() => new Set(WISHLIST_CATEGORY_OPTIONS), []);
  const isKnownDefault = defaultCategory
    ? knownCategorySet.has(defaultCategory as (typeof WISHLIST_CATEGORY_OPTIONS)[number])
    : false;
  const [selectedCategory, setSelectedCategory] = useState(
    isKnownDefault
      ? defaultCategory
      : defaultCategory
        ? "other"
        : "",
  );
  const [customCategory, setCustomCategory] = useState(
    defaultCategory && !isKnownDefault
      ? defaultCategory
      : "",
  );

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-mocha/65 dark:text-white/50">
        Danh mục quà
      </span>
      <select
        name="category_preset"
        value={selectedCategory}
        onChange={(event) => setSelectedCategory(event.target.value)}
      >
        <option value="">Chọn danh mục</option>
        {WISHLIST_CATEGORY_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="other">Khác (tự nhập)</option>
      </select>

      {selectedCategory === "other" ? (
        <input
          name="category_custom"
          placeholder="Nhập danh mục riêng"
          value={customCategory}
          onChange={(event) => setCustomCategory(event.target.value)}
          required
        />
      ) : (
        <input type="hidden" name="category_custom" value="" />
      )}
    </div>
  );
}
