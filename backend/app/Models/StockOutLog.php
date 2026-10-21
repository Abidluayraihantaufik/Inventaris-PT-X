<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockOutLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_batch_id',
        'user_id',
        'quantity',
        'out_date',
        'destination',
        'recipient_name',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'out_date' => 'date',
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
}
