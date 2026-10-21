<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
use App\Models\InventoryBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * GET /api/inventory
     * Daftar batch dengan filter produk, kategori, batch_no, lokasi, supplier, status kadaluarsa.
     */
    public function index(Request $request): JsonResponse
    {
        $query = InventoryBatch::with(['product.category'])
            ->orderBy('expiry_date', 'asc'); // FEFO default

        // Filter pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('batch_no', 'like', "%$search%")
                  ->orWhere('supplier_name', 'like', "%$search%")
                  ->orWhere('storage_location', 'like', "%$search%")
                  ->orWhereHas('product', fn ($q2) => $q2->where('product_name', 'like', "%$search%"));
            });
        }

        // Filter produk
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter kategori
        if ($request->filled('category_id')) {
            $query->whereHas('product', fn ($q) => $q->where('category_id', $request->category_id));
        }

        // Filter lokasi
        if ($request->filled('location')) {
            $query->where('storage_location', 'like', '%' . $request->location . '%');
        }

        // Filter supplier
        if ($request->filled('supplier')) {
            $query->where('supplier_name', 'like', '%' . $request->supplier . '%');
        }

        // Filter status kadaluarsa
        if ($request->filled('expiry_status')) {
            $today = now()->toDateString();
            match ($request->expiry_status) {
                'expired'  => $query->where('expiry_date', '<', $today),
                'critical' => $query->whereBetween('expiry_date', [$today, now()->addDays(30)->toDateString()]),
                'warning'  => $query->whereBetween('expiry_date', [now()->addDays(30)->toDateString(), now()->addDays(60)->toDateString()]),
                'safe'     => $query->where('expiry_date', '>', now()->addDays(60)->toDateString()),
                default    => null,
            };
        }

        // Hanya tampilkan yang masih ada stok (opsional)
        if ($request->boolean('available_only')) {
            $query->where('stock_quantity', '>', 0);
        }

        $batches = $query->paginate(15);

        // Tambahkan expiry_status ke setiap item
        $batches->getCollection()->transform(function ($batch) {
            $batch->expiry_status = $batch->expiry_status;
            return $batch;
        });

        return response()->json($batches);
    }

    /**
     * POST /api/inventory  [Admin]
     * Tambah batch baru (barang masuk).
     */
    public function store(StoreBatchRequest $request): JsonResponse
    {
        $batch = InventoryBatch::create($request->validated());
        $batch->load('product.category');

        return response()->json([
            'message' => 'Batch berhasil ditambahkan.',
            'batch'   => $batch,
        ], 201);
    }

    /**
     * GET /api/inventory/{id}
     * Detail batch tertentu.
     */
    public function show(int $id): JsonResponse
    {
        $batch = InventoryBatch::with(['product.category', 'stockOutLogs.user'])
            ->findOrFail($id);

        $batch->expiry_status = $batch->expiry_status;

        return response()->json($batch);
    }

    /**
     * PUT /api/inventory/{id}  [Admin]
     * Update data batch.
     */
    public function update(UpdateBatchRequest $request, int $id): JsonResponse
    {
        $batch = InventoryBatch::findOrFail($id);
        $batch->update($request->validated());
        $batch->load('product.category');

        return response()->json([
            'message' => 'Batch berhasil diperbarui.',
            'batch'   => $batch,
        ]);
    }

    /**
     * DELETE /api/inventory/{id}  [Admin]
     * Hapus batch jika tidak memiliki transaksi keluar.
     */
    public function destroy(int $id): JsonResponse
    {
        $batch = InventoryBatch::withCount('stockOutLogs')->findOrFail($id);

        if ($batch->stock_out_logs_count > 0) {
            return response()->json([
                'message' => 'Batch tidak dapat dihapus karena sudah memiliki ' . $batch->stock_out_logs_count . ' transaksi keluar.',
            ], 422);
        }

        $batch->delete();

        return response()->json([
            'message' => 'Batch berhasil dihapus.',
        ]);
    }
}
