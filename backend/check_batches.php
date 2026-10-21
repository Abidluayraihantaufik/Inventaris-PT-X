<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->bootstrap();

$batches = DB::table('inventory_batches')->get();
echo "Total batch: " . count($batches) . "\n";
foreach($batches as $b) {
    echo "  product_id={$b->product_id} | batch={$b->batch_no} | stok={$b->stock_quantity} | exp={$b->expiry_date}\n";
}

$products = DB::table('products')->get();
echo "\nTotal produk: " . count($products) . "\n";
foreach($products as $p) {
    echo "  ID={$p->id} | {$p->product_name}\n";
}
