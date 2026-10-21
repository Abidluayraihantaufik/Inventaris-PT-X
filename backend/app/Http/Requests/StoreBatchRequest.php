<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id'       => ['required', 'integer', 'exists:products,id'],
            'batch_no'         => ['required', 'string', 'max:100', 'unique:inventory_batches,batch_no'],
            'supplier_name'    => ['required', 'string', 'max:200'],
            'storage_location' => ['required', 'string', 'max:100'],
            'stock_quantity'   => ['required', 'numeric', 'min:0.01'],
            'entry_date'       => ['required', 'date'],
            'expiry_date'      => ['required', 'date', 'after:entry_date'],
            'notes'            => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required'       => 'Produk wajib dipilih.',
            'product_id.exists'         => 'Produk tidak ditemukan.',
            'batch_no.required'         => 'Nomor batch wajib diisi.',
            'batch_no.unique'           => 'Nomor batch sudah digunakan.',
            'supplier_name.required'    => 'Nama supplier wajib diisi.',
            'storage_location.required' => 'Lokasi penyimpanan wajib diisi.',
            'stock_quantity.required'   => 'Jumlah stok wajib diisi.',
            'stock_quantity.min'        => 'Jumlah stok harus lebih dari 0.',
            'entry_date.required'       => 'Tanggal masuk wajib diisi.',
            'expiry_date.required'      => 'Tanggal kadaluarsa wajib diisi.',
            'expiry_date.after'         => 'Tanggal kadaluarsa harus setelah tanggal masuk.',
        ];
    }
}
