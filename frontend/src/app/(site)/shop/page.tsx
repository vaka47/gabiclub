import ShopExperience from "@/components/shop/ShopExperience";
import { getProducts } from "@/lib/api";

export default async function ShopPage() {
  const products = await getProducts();

  return <ShopExperience products={products} />;
}
