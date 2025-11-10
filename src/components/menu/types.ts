export type Category = "coffee" | "tea" | "dessert";

export interface ProductListItem {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  category: Category;
}

export interface ProductDetails {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  category: Category;
  images?: string[];
  sizes?: RawSizes;
  additives?: AdditiveShape[];
}

export type SizeShape = {
  size?: string;
  label?: string;
  price?: string;
  discountPrice?: string;
  ["add-price"]?: string;
  addPrice?: string;
  add_price?: string;
  add?: string | number;
};

export type RawSizes = Partial<
  Record<
    "s" | "m" | "l" | "S" | "M" | "L" | "xl" | "XXL" | "XL" | "LARGE",
    SizeShape
  >
>;

export interface AdditiveShape {
  name?: string;
  title?: string;
  price?: string;
  discountPrice?: string;
  ["add-price"]?: string;
  addPrice?: string;
  add_price?: string;
  add?: string | number;
}
export interface ProductListResponse {
  data: ProductListItem[];
  message?: string;
  error?: string;
}

export interface ProductDetailsResponse {
  data: ProductDetails;
  message?: string;
  error?: string;
}
