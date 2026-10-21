<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\StockOutLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard/summary
     * Ringkasan statistik untuk dashboard Admin dan User.
     */
    public function summary(Request $request): JsonResponse
    {
        $today    = now()->toDateString();
        $thisMonth = now()->startOfMonth()->toDateString();

        // Jumlah batch berdasarkan status kadaluarsa
        $expired  = InventoryBatch::where('expiry_date', '<', $today)->count();
        $critical = InventoryBatch::whereBetween('expiry_date', [$today, now()->addDays(30)->toDateString()])->where('stock_quantity', '>', 0)->count();
        $warning  = InventoryBatch::whereBetween('expiry_date', [now()->addDays(30)->toDateString(), now()->addDays(60)->toDateString()])->where('stock_quantity', '>', 0)->count();

        // Total stok seluruh produk (nilai, bukan jumlah item)
        $totalStock = InventoryBatch::where('expiry_date', '>=', $today)->sum('stock_quantity');

        // Barang masuk bulan ini (jumlah batch)
        $inThisMonth = InventoryBatch::where('entry_date', '>=', $thisMonth)->count();

        // Barang keluar bulan ini
        $outThisMonth = StockOutLog::where('out_date', '>=', $thisMonth)->sum('quantity');

        // Produk dengan stok rendah (total stok < minimum_stock)
        $lowStockCount = Product::whereHas('inventoryBatches', function ($q) use ($today) {
            $q->where('expiry_date', '>=', $today);
        })
        ->get()
        ->filter(function ($product) use ($today) {
            $total = $product->inventoryBatches()
                ->where('expiry_date', '>=', $today)
                ->sum('stock_quantity');
            return $product->minimum_stock > 0 && $total < $product->minimum_stock;
        })
        ->count();

        return response()->json([
            'total_stock'      => (float) $totalStock,
            'in_this_month'    => $inThisMonth,
            'out_this_month'   => (float) $outThisMonth,
            'expiry_expired'   => $expired,
            'expiry_critical'  => $critical,
            'expiry_warning'   => $warning,
            'low_stock_count'  => $lowStockCount,
        ]);
    }

    /**
     * GET /api/dashboard/charts
     * Data untuk grafik: stok per kategori + tren transaksi 6 bulan terakhir.
     */
    public function charts(): JsonResponse
    {
        $today = now()->toDateString();

        // Stok per kategori (Pie/Donut Chart)
        $stockByCategory = DB::table('inventory_batches')
            ->join('products', 'inventory_batches.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('inventory_batches.expiry_date', '>=', $today)
            ->where('inventory_batches.stock_quantity', '>', 0)
            ->select('categories.name as category', DB::raw('SUM(inventory_batches.stock_quantity) as total'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->get();

        // Tren barang masuk (6 bulan terakhir) - Line/Bar Chart
        $inTrend = DB::table('inventory_batches')
            ->where('entry_date', '>=', now()->subMonths(6)->toDateString())
            ->select(
                DB::raw("DATE_FORMAT(entry_date, '%Y-%m') as month"),
                DB::raw('COUNT(*) as batch_count'),
                DB::raw('SUM(stock_quantity) as total_qty')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Tren barang keluar (6 bulan terakhir) - Line/Bar Chart
        $outTrend = DB::table('stock_out_logs')
            ->where('out_date', '>=', now()->subMonths(6)->toDateString())
            ->select(
                DB::raw("DATE_FORMAT(out_date, '%Y-%m') as month"),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(quantity) as total_qty')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'stock_by_category' => $stockByCategory,
            'in_trend'          => $inTrend,
            'out_trend'         => $outTrend,
        ]);
    }

    /**
     * GET /api/dashboard/alerts
     * Daftar batch yang membutuhkan perhatian (kritis, warning, expired, stok rendah).
     */
    public function alerts(): JsonResponse
    {
        $today = now()->toDateString();

        // Batch expired (masih ada stok)
        $expired = InventoryBatch::with('product.category')
            ->where('expiry_date', '<', $today)
            ->where('stock_quantity', '>', 0)
            ->orderBy('expiry_date')
            ->limit(10)
            ->get()
            ->map(fn ($b) => array_merge($b->toArray(), ['expiry_status' => 'expired']));

        // Batch kritis < 30 hari
        $critical = InventoryBatch::with('product.category')
            ->whereBetween('expiry_date', [$today, now()->addDays(30)->toDateString()])
            ->where('stock_quantity', '>', 0)
            ->orderBy('expiry_date')
            ->limit(10)
            ->get()
            ->map(fn ($b) => array_merge($b->toArray(), ['expiry_status' => 'critical']));

        // Batch warning 30-60 hari
        $warning = InventoryBatch::with('product.category')
            ->whereBetween('expiry_date', [now()->addDays(30)->toDateString(), now()->addDays(60)->toDateString()])
            ->where('stock_quantity', '>', 0)
            ->orderBy('expiry_date')
            ->limit(10)
            ->get()
            ->map(fn ($b) => array_merge($b->toArray(), ['expiry_status' => 'warning']));

        // Produk stok rendah
        $lowStock = Product::with('category')
            ->get()
            ->filter(function ($product) use ($today) {
                if ($product->minimum_stock <= 0) return false;
                $total = $product->inventoryBatches()
                    ->where('expiry_date', '>=', $today)
                    ->sum('stock_quantity');
                return $total < $product->minimum_stock;
            })
            ->map(function ($product) use ($today) {
                $total = $product->inventoryBatches()
                    ->where('expiry_date', '>=', $today)
                    ->sum('stock_quantity');
                return [
                    'product_id'    => $product->id,
                    'product_name'  => $product->product_name,
                    'category'      => $product->category->name,
                    'unit'          => $product->unit,
                    'current_stock' => $total,
                    'minimum_stock' => $product->minimum_stock,
                ];
            })
            ->values();

        return response()->json([
            'expired'   => $expired,
            'critical'  => $critical,
            'warning'   => $warning,
            'low_stock' => $lowStock,
        ]);
    }
}
