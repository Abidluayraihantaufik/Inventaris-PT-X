<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Daftar semua produk dengan filter kategori, pencarian nama, dan pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')
            ->withSum('inventoryBatches as total_stock', 'stock_quantity');

        // Filter berdasarkan kategori
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Pencarian berdasarkan nama produk
        if ($request->filled('search')) {
            $query->where('product_name', 'like', '%' . $request->search . '%');
        }

        // Hitung status stok rendah
        $query->orderBy('product_name');

        $products = $request->boolean('all')
            ? $query->get()
            : $query->paginate(15);

        return response()->json($products);
    }

    /**
     * POST /api/products  [Admin]
     * Tambah produk baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_name'  => ['required', 'string', 'max:200'],
            'category_id'   => ['required', 'integer', 'exists:categories,id'],
            'unit'          => ['required', 'string', 'max:50'],
            'minimum_stock' => ['nullable', 'numeric', 'min:0'],
            'description'   => ['nullable', 'string'],
        ], [
            'product_name.required' => 'Nama produk wajib diisi.',
            'category_id.required'  => 'Kategori wajib dipilih.',
            'category_id.exists'    => 'Kategori tidak ditemukan.',
            'unit.required'         => 'Satuan wajib diisi.',
        ]);

        $product = Product::create($validated);
        $product->load('category');

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'product' => $product,
        ], 201);
    }

    /**
     * GET /api/products/{id}
     * Detail produk beserta semua batch dan total stok.
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'inventoryBatches' => function ($q) {
            $q->orderBy('expiry_date')->where('stock_quantity', '>', 0);
        }])
        ->withSum('inventoryBatches as total_stock', 'stock_quantity')
        ->findOrFail($id);

        return response()->json($product);
    }

    /**
     * PUT /api/products/{id}  [Admin]
     * Update data produk.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'product_name'  => ['sometimes', 'string', 'max:200'],
            'category_id'   => ['sometimes', 'integer', 'exists:categories,id'],
            'unit'          => ['sometimes', 'string', 'max:50'],
            'minimum_stock' => ['nullable', 'numeric', 'min:0'],
            'description'   => ['nullable', 'string'],
        ], [
            'category_id.exists' => 'Kategori tidak ditemukan.',
        ]);

        $product->update($validated);
        $product->load('category');

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'product' => $product,
        ]);
    }

    /**
     * DELETE /api/products/{id}  [Admin]
     * Hapus produk jika tidak memiliki batch inventaris.
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::withCount('inventoryBatches')->findOrFail($id);

        if ($product->inventory_batches_count > 0) {
            return response()->json([
                'message' => 'Produk tidak dapat dihapus karena masih memiliki ' . $product->inventory_batches_count . ' batch inventaris.',
            ], 422);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
        ]);
    }
}
