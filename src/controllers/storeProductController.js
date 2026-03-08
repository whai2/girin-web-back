import * as StoreProduct from '../models/storeProductModel.js';
import * as Product from '../models/productModel.js';

// 장소별 상품 목록 (상품 정보 포함)
export async function getStoreProducts(req, res) {
  const storeId = req.storeObjectId;
  const [products, storeProducts] = await Promise.all([
    Product.findAll(),
    StoreProduct.findByStore(storeId),
  ]);

  const spMap = new Map(storeProducts.map((sp) => [sp.productId.toString(), sp]));

  const merged = products.map((product) => {
    const sp = spMap.get(product._id.toString());
    return {
      ...product,
      soldOut: sp?.soldOut ?? false,
      soldOutSizes: sp?.soldOutSizes ?? [],
      ageGroup: sp?.ageGroup ?? ['adult'],
    };
  });

  res.json(merged);
}

// 장소별 상품 설정 수정
export async function updateStoreProduct(req, res) {
  const storeId = req.storeObjectId;
  const { productId } = req.params;
  const update = {};

  if (req.body.soldOut !== undefined) update.soldOut = req.body.soldOut === 'true' || req.body.soldOut === true;
  if (req.body.soldOutSizes !== undefined) {
    update.soldOutSizes = typeof req.body.soldOutSizes === 'string'
      ? JSON.parse(req.body.soldOutSizes)
      : req.body.soldOutSizes;
  }
  if (req.body.ageGroup !== undefined) {
    update.ageGroup = typeof req.body.ageGroup === 'string'
      ? JSON.parse(req.body.ageGroup)
      : req.body.ageGroup;
  }

  const result = await StoreProduct.upsert(storeId, productId, update);
  res.json(result);
}

// 장소별 품절 토글
export async function toggleSoldOut(req, res) {
  const storeId = req.storeObjectId;
  const { productId } = req.params;
  const existing = await StoreProduct.findOne(storeId, productId);
  const soldOut = !(existing?.soldOut ?? false);

  const result = await StoreProduct.upsert(storeId, productId, { soldOut });
  res.json(result);
}

// 장소별 사이즈 품절 토글
export async function toggleSize(req, res) {
  const storeId = req.storeObjectId;
  const { productId } = req.params;
  const { size } = req.body;

  const existing = await StoreProduct.findOne(storeId, productId);
  const sizes = existing?.soldOutSizes ?? [];
  const updatedSizes = sizes.includes(size)
    ? sizes.filter((s) => s !== size)
    : [...sizes, size];

  const result = await StoreProduct.upsert(storeId, productId, { soldOutSizes: updatedSizes });
  res.json(result);
}

// 장소별 연령 그룹 토글
export async function toggleAge(req, res) {
  const storeId = req.storeObjectId;
  const { productId } = req.params;
  const { age } = req.body;

  const existing = await StoreProduct.findOne(storeId, productId);
  const ageGroup = existing?.ageGroup ?? ['adult'];
  const updatedAgeGroup = ageGroup.includes(age)
    ? ageGroup.filter((a) => a !== age)
    : [...ageGroup, age];

  const result = await StoreProduct.upsert(storeId, productId, { ageGroup: updatedAgeGroup });
  res.json(result);
}
