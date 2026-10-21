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
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->string('batch_no', 100)->unique();
            $table->string('supplier_name', 200);
            $table->string('storage_location', 100);
            $table->decimal('stock_quantity', 12, 2)->default(0);
            $table->date('entry_date');
            $table->date('expiry_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index untuk mempercepat pencarian FEFO dan filter
            $table->index('expiry_date');
            $table->index('product_id');
            $table->index('storage_location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
    }
};
