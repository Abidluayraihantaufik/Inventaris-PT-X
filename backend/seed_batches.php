<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->bootstrap();

// Tambah 3 batch untuk Roundup (product_id=1) dengan tanggal kadaluarsa berbeda
$batches = [
    [
        'product_id'       => 1,
        'batch_no'         => 'BTH-001',
        'supplier_name'    => 'PT Agro Makmur',
        'storage_location' => 'Rack A1',
        'stock_quantity'   => 40,
        'entry_date'       => '2026-01-10',
        'expiry_date'      => '2026-09-30',
        'notes'            => 'Batch pertama - FEFO prioritas 1',
        'created_at'       => now(),
        'updated_at'       => now(),
    ],
    [
        'product_id'       => 1,
        'batch_no'         => 'BTH-002',
        'supplier_name'    => 'PT Agro Makmur',
        'storage_location' => 'Rack A2',
        'stock_quantity'   => 80,
        'entry_date'       => '2026-03-05',
        'expiry_date'      => '2026-12-20',
        'notes'            => '',
        'created_at'       => now(),
        'updated_at'       => now(),
    ],
    [
        'product_id'       => 1,
        'batch_no'         => 'BTH-003',
        'supplier_name'    => 'PT Graha Kimia',
        'storage_location' => 'Rack B1',
        'stock_quantity'   => 100,
        'entry_date'       => '2026-05-20',
        'expiry_date'      => '2027-03-15',
        'notes'            => '',
        'created_at'       => now(),
        'updated_at'       => now(),
    ],
    [
        'product_id'       => 2,
        'batch_no'         => 'ANT-001',
        'supplier_name'    => 'PT Bayer Indonesia',
        'storage_location' => 'Rack C1',
        'stock_quantity'   => 25,
        'entry_date'       => '2026-06-01',
        'expiry_date'      => '2027-06-01',
        'notes'            => '',
        'created_at'       => now(),
        'updated_at'       => now(),
    ],
];

DB::table('inventory_batches')->insert($batches);

// Verifikasi
$result = DB::table('inventory_batches')->get();
echo "Total batch sekarang: " . count($result) . "\n";
foreach($result as $b) {
    echo "  batch={$b->batch_no} | product_id={$b->product_id} | stok={$b->stock_quantity} | exp={$b->expiry_date} | lokasi={$b->storage_location}\n";
}
echo "\nSukses! Data siap untuk demo FEFO.\n";
