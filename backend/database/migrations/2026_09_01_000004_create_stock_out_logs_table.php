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
        Schema::create('stock_out_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_batch_id')->constrained('inventory_batches')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->decimal('quantity', 12, 2);
            $table->date('out_date');
            $table->string('destination', 255)->nullable();
            $table->string('recipient_name', 150)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('out_date');
            $table->index('inventory_batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_out_logs');
    }
};
