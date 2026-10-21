<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockOutRequest;
use App\Models\InventoryBatch;
use App\Models\StockOutLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockOutController extends Controller
{
    /**
     * GET /api/stock-out/fefo/{productId}
     * Rekomendasi batch berdasarkan FEFO untuk produk tertentu.
     */
    public function fefoRecommendation(int $productId): JsonResponse
    {
        $batches = InventoryBatch::with('product')
            ->where('product_id', $productId)
            ->available()   // scope: tidak expired & stok > 0
            ->fefo()        // scope: urutkan expiry_date ASC
            ->get()
            ->values()      // pastikan index mulai dari 0
            ->map(function ($batch, $index) {
                return [
                    'id'               => $batch->id,
                    'batch_no'         => $batch->batch_no,
                    'supplier_name'    => $batch->supplier_name,
                    'storage_location' => $batch->storage_location,
                    'stock_quantity'   => $batch->stock_quantity,
                    'expiry_date'      => $batch->expiry_date->format('Y-m-d'),
                    'expiry_status'    => $batch->expiry_status,
                    'is_recommended'   => $index === 0, // batch terdekat otomatis direkomendasikan
                ];
            });

        return response()->json([
            'product_id' => $productId,
            'batches'    => $batches,
        ]);
    }

    /**
     * POST /api/stock-out
     * Proses transaksi barang keluar dengan validasi FEFO dan stok.
     */
    public function store(StockOutRequest $request): JsonResponse
    {
        $requestedBatches = $request->batches;
        $totalOut = 0;
        
        // Validasi ketersediaan stok semua batch sebelum memproses
        foreach ($requestedBatches as $b) {
            $batch = InventoryBatch::findOrFail($b['batch_id']);
            
            if ($batch->isExpired()) {
                return response()->json([
                    'message' => "Batch {$batch->batch_no} sudah expired dan tidak dapat digunakan.",
                ], 422);
            }

            if ($b['quantity'] > $batch->stock_quantity) {
                return response()->json([
                    'message' => "Stok batch {$batch->batch_no} tidak mencukupi. Tersedia: {$batch->stock_quantity}.",
                ], 422);
            }
        }

        // Jalankan transaksi secara atomik
        $logs = DB::transaction(function () use ($request, $requestedBatches, &$totalOut) {
            $createdLogs = [];

            foreach ($requestedBatches as $b) {
                $batch = InventoryBatch::findOrFail($b['batch_id']);
                
                // Kurangi stok batch
                $batch->decrement('stock_quantity', $b['quantity']);
                $totalOut += $b['quantity'];

                // Simpan log transaksi
                $createdLogs[] = StockOutLog::create([
                    'inventory_batch_id' => $batch->id,
                    'user_id'            => $request->user()->id,
                    'quantity'           => $b['quantity'],
                    'out_date'           => $request->out_date,
                    'destination'        => $request->purpose,
                    'recipient_name'     => $request->recipient,
                    'notes'              => $request->notes,
                ]);
            }

            return $createdLogs;
        });

        // Untuk response sukses, kita kirimkan data produk dan total yang keluar
        $firstBatchId = $requestedBatches[0]['batch_id'];
        $product = InventoryBatch::with('product')->find($firstBatchId)->product;

        return response()->json([
            'message'    => 'Barang keluar berhasil dicatat.',
            'total_out'  => $totalOut,
            'recipient'  => $request->recipient,
            'purpose'    => $request->purpose,
            'product'    => $product
        ], 201);
    }

    /**
     * GET /api/stock-out/logs
     * Riwayat semua transaksi barang keluar.
     */
    public function logs(Request $request): JsonResponse
    {
        $query = StockOutLog::with(['inventoryBatch.product.category', 'user'])
            ->orderBy('out_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan produk
        if ($request->filled('product_id')) {
            $query->whereHas('inventoryBatch', fn ($q) => $q->where('product_id', $request->product_id));
        }

        // Filter berdasarkan tanggal
        if ($request->filled('from_date')) {
            $query->where('out_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->where('out_date', '<=', $request->to_date);
        }

        // User biasa hanya melihat transaksi miliknya sendiri
        $user = $request->user();
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $logs = $query->paginate(15);

        return response()->json($logs);
    }

    /**
     * GET /api/stock-out/{id}/print
     * Data laporan PDF pengeluaran barang (dirender di frontend).
     */
    public function printData(int $id): JsonResponse
    {
        $log = StockOutLog::with([
            'inventoryBatch.product.category',
            'user',
        ])->findOrFail($id);

        return response()->json([
            'document_no'    => 'LPK-' . str_pad($log->id, 6, '0', STR_PAD_LEFT),
            'printed_at'     => now()->format('d/m/Y H:i'),
            'out_date'       => $log->out_date->format('d/m/Y'),
            'product_name'   => $log->inventoryBatch->product->product_name,
            'category'       => $log->inventoryBatch->product->category->name,
            'batch_no'       => $log->inventoryBatch->batch_no,
            'expiry_date'    => $log->inventoryBatch->expiry_date->format('d/m/Y'),
            'supplier_name'  => $log->inventoryBatch->supplier_name,
            'storage_location' => $log->inventoryBatch->storage_location,
            'quantity'       => $log->quantity,
            'unit'           => $log->inventoryBatch->product->unit,
            'destination'    => $log->destination,
            'recipient_name' => $log->recipient_name,
            'officer'        => $log->user->name,
            'officer_division' => $log->user->division,
            'notes'          => $log->notes,
        ]);
    }
}
