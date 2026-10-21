<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockOpnameRequest;
use App\Models\InventoryBatch;
use App\Models\StockOpname;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockOpnameController extends Controller
{
    /**
     * GET /api/stock-opname
     * Riwayat stock opname dengan filter lokasi, status, dan tanggal.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockOpname::with([
            'inventoryBatch.product.category',
            'user',
            'verifier',
        ])->orderBy('opname_date', 'desc');

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan tanggal
        if ($request->filled('from_date')) {
            $query->where('opname_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->where('opname_date', '<=', $request->to_date);
        }

        // Filter lokasi (via batch)
        if ($request->filled('location')) {
            $query->whereHas('inventoryBatch', fn ($q) =>
                $q->where('storage_location', 'like', '%' . $request->location . '%')
            );
        }

        $opnames = $query->paginate(15);

        return response()->json($opnames);
    }

    /**
     * POST /api/stock-opname
     * Input hasil penghitungan stok fisik.
     * Sistem menghitung selisih secara otomatis.
     */
    public function store(StockOpnameRequest $request): JsonResponse
    {
        $batch = InventoryBatch::findOrFail($request->inventory_batch_id);

        $systemQty   = (float) $batch->stock_quantity;
        $physicalQty = (float) $request->physical_quantity;
        $difference  = $physicalQty - $systemQty;

        $opname = StockOpname::create([
            'inventory_batch_id' => $batch->id,
            'user_id'            => $request->user()->id,
            'system_quantity'    => $systemQty,
            'physical_quantity'  => $physicalQty,
            'difference'         => $difference,
            'opname_date'        => $request->opname_date,
            'notes'              => $request->notes,
            'status'             => 'pending',
        ]);

        $opname->load(['inventoryBatch.product', 'user']);

        return response()->json([
            'message' => 'Stock opname berhasil dicatat.' . ($difference != 0 ? ' Terdapat selisih: ' . $difference : ''),
            'opname'  => $opname,
        ], 201);
    }

    /**
     * PUT /api/stock-opname/{id}/verify  [Admin]
     * Verifikasi dan rekonsiliasi stock opname.
     * Admin dapat memilih apakah stok sistem disesuaikan dengan fisik atau tidak.
     */
    public function verify(Request $request, int $id): JsonResponse
    {
        $opname = StockOpname::with('inventoryBatch')->findOrFail($id);

        if ($opname->status === 'verified') {
            return response()->json([
                'message' => 'Stock opname ini sudah diverifikasi sebelumnya.',
            ], 422);
        }

        $validated = $request->validate([
            'adjust_stock' => ['boolean'], // true = sesuaikan stok sistem
            'notes'        => ['nullable', 'string'],
        ]);

        // Rekonsiliasi: sesuaikan stok sistem dengan fisik jika diminta
        if ($request->boolean('adjust_stock')) {
            $opname->inventoryBatch->update([
                'stock_quantity' => $opname->physical_quantity,
            ]);
        }

        $opname->update([
            'status'      => 'verified',
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
            'notes'       => $validated['notes'] ?? $opname->notes,
        ]);

        $opname->load(['inventoryBatch.product', 'user', 'verifier']);

        return response()->json([
            'message' => 'Stock opname berhasil diverifikasi.' .
                ($request->boolean('adjust_stock') ? ' Stok sistem telah disesuaikan.' : ''),
            'opname'  => $opname,
        ]);
    }
}
