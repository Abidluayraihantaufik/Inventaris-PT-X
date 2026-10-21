<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_batch_id')->constrained('inventory_batches')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->decimal('system_quantity', 12, 2);   // Stok menurut sistem
            $table->decimal('physical_quantity', 12, 2); // Stok fisik hasil hitung
            $table->decimal('difference', 12, 2);        // Selisih (physical - system)
            $table->date('opname_date');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'verified'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('opname_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_opnames');
    }
};
