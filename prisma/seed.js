import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Oversized Cloud Tee",
    description: "Ultra-soft cotton oversized t-shirt with minimalist design. Perfect for that effortlessly cool streetwear look.",
    price: 2499,
    code: "CLT001",
    category: "t-shirts",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"
  },
  {
    name: "Vintage Wash Hoodie",
    description: "Premium heavyweight hoodie with vintage wash finish. Essential for layering in style.",
    price: 4999,
    code: "VWH002",
    category: "hoodies",
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"
  },
  {
    name: "Wide Leg Cargo Pants",
    description: "Y2K inspired wide leg cargo pants with multiple pockets. Streetwear essential.",
    price: 3999,
    code: "WLC003",
    category: "pants",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800"
  },
  {
    name: "Minimal Logo Cap",
    description: "Unstructured dad cap with subtle embroidered logo. Clean aesthetic for everyday wear.",
    price: 1499,
    code: "MLC004",
    category: "accessories",
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800"
  },
  {
    name: "Cropped Bomber Jacket",
    description: "Cropped bomber jacket with satin finish. Perfect transitional piece for layering.",
    price: 6999,
    code: "CBJ005",
    category: "jackets",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"
  },
  {
    name: "Relaxed Fit Jeans",
    description: "90s inspired relaxed fit denim with light wash. Comfortable and stylish.",
    price: 4499,
    code: "RFJ006",
    category: "pants",
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800"
  },
  {
    name: "Graphic Print Tee",
    description: "Statement graphic tee with artistic print. Express your unique style.",
    price: 2999,
    code: "GPT007",
    category: "t-shirts",
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800"
  },
  {
    name: "Knit Beanie",
    description: "Soft ribbed knit beanie in neutral tones. Cozy essential for cooler days.",
    price: 999,
    code: "KNB008",
    category: "accessories",
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800"
  },
  {
    name: "Oversized Flannel Shirt",
    description: "Classic flannel shirt in oversized fit. Perfect for layering or wearing solo.",
    price: 3499,
    code: "OFS009",
    category: "shirts",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800"
  },
  {
    name: "Track Pants",
    description: "Retro-inspired track pants with side stripes. Comfort meets street style.",
    price: 2999,
    code: "TRP010",
    category: "pants",
    stock: 55,
    imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800"
  }
];

async function main() {
  console.log("Starting seed...");
  
  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`Created product: ${created.name} (${created.code})`);
  }
  
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
