<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockOpname extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_batch_id',
        'user_id',
        'system_quantity',
        'physical_quantity',
        'difference',
        'opname_date',
        'notes',
        'status',
        'verified_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'system_quantity'   => 'decimal:2',
            'physical_quantity' => 'decimal:2',
            'difference'        => 'decimal:2',
            'opname_date'       => 'date',
            'verified_at'       => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    public function inventoryBatch()
    {
        return $this->belongsTo(InventoryBatch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
