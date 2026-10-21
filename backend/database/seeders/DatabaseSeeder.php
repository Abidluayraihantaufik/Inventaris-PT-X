<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ─── Akun Admin Default ──────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@maskitani.com'],
            [
                'name'     => 'Admin Maskitani',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
                'division' => 'Management',
                'status'   => 'active',
            ]
        );

        // ─── Akun User Gudang Default ────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'gudang@maskitani.com'],
            [
                'name'     => 'Petugas Gudang',
                'username' => 'gudang',
                'password' => Hash::make('gudang123'),
                'role'     => 'user',
                'division' => 'Gudang',
                'status'   => 'active',
            ]
        );

        // ─── Kategori Default (PRD section 4.4) ─────────────────────────
        $categories = [
            ['name' => 'Herbisida',   'description' => 'Produk pembasmi tanaman pengganggu (gulma)'],
            ['name' => 'Fungisida',   'description' => 'Produk pembasmi jamur dan penyakit tanaman'],
            ['name' => 'Insektisida', 'description' => 'Produk pembasmi serangga hama tanaman'],
            ['name' => 'Pupuk',       'description' => 'Produk nutrisi dan penyubur tanaman'],
            ['name' => 'Perekat',     'description' => 'Bahan perekat untuk aplikasi pestisida'],
            ['name' => 'Lainnya',     'description' => 'Produk agrokimia lainnya'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
