<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'batch_no',
        'supplier_name',
        'storage_location',
        'stock_quantity',
        'entry_date',
        'expiry_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'stock_quantity' => 'decimal:2',
            'entry_date'     => 'date',
            'expiry_date'    => 'date',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stockOutLogs()
    {
        return $this->hasMany(StockOutLog::class);
    }

    public function stockOpnames()
    {
        return $this->hasMany(StockOpname::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /**
     * Mengembalikan status kadaluarsa berdasarkan PRD section 4.6
     * Aman > 60 hari | Perhatian 30-60 hari | Kritis < 30 hari | Expired
     */
    public function getExpiryStatusAttribute(): string
    {
        $daysUntilExpiry = now()->diffInDays($this->expiry_date, false);

        if ($daysUntilExpiry < 0) {
            return 'expired';
        } elseif ($daysUntilExpiry < 30) {
            return 'critical';
        } elseif ($daysUntilExpiry <= 60) {
            return 'warning';
        } else {
            return 'safe';
        }
    }

    /**
     * Cek apakah batch sudah expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    /**
     * Scope: urutkan berdasarkan FEFO (kadaluarsa terdekat dulu)
     */
    public function scopeFefo($query)
    {
        return $query->orderBy('expiry_date', 'asc');
    }

    /**
     * Scope: hanya batch yang belum expired dan masih ada stok
     */
    public function scopeAvailable($query)
    {
        return $query
            ->where('expiry_date', '>=', now()->toDateString())
            ->where('stock_quantity', '>', 0);
    }
}
