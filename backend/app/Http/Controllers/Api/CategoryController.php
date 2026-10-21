<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * Daftar semua kategori beserta jumlah produk.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    /**
     * POST /api/categories  [Admin]
     * Tambah kategori baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:categories,name'],
            'description' => ['nullable', 'string'],
        ], [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.unique'   => 'Nama kategori sudah ada.',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'message'  => 'Kategori berhasil ditambahkan.',
            'category' => $category,
        ], 201);
    }

    /**
     * PUT /api/categories/{id}  [Admin]
     * Update kategori.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100', 'unique:categories,name,' . $id],
            'description' => ['nullable', 'string'],
        ], [
            'name.unique' => 'Nama kategori sudah digunakan.',
        ]);

        $category->update($validated);

        return response()->json([
            'message'  => 'Kategori berhasil diperbarui.',
            'category' => $category,
        ]);
    }

    /**
     * DELETE /api/categories/{id}  [Admin]
     * Hapus kategori (hanya jika tidak memiliki produk).
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::withCount('products')->findOrFail($id);

        if ($category->products_count > 0) {
            return response()->json([
                'message' => 'Kategori tidak dapat dihapus karena masih memiliki ' . $category->products_count . ' produk.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
