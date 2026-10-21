<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'category_id',
        'unit',
        'minimum_stock',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'minimum_stock' => 'decimal:2',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function inventoryBatches()
    {
        return $this->hasMany(InventoryBatch::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /**
     * Total stok semua batch aktif (tidak expired) untuk produk ini
     */
    public function totalStock(): float
    {
        return $this->inventoryBatches()
            ->where('expiry_date', '>=', now()->toDateString())
            ->sum('stock_quantity');
    }
}
