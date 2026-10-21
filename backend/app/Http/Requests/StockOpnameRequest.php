<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockOpnameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inventory_batch_id' => ['required', 'integer', 'exists:inventory_batches,id'],
            'physical_quantity'  => ['required', 'numeric', 'min:0'],
            'opname_date'        => ['required', 'date'],
            'notes'              => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'inventory_batch_id.required' => 'Batch wajib dipilih.',
            'inventory_batch_id.exists'   => 'Batch tidak ditemukan.',
            'physical_quantity.required'  => 'Stok fisik wajib diisi.',
            'physical_quantity.min'       => 'Stok fisik tidak boleh negatif.',
            'opname_date.required'        => 'Tanggal opname wajib diisi.',
        ];
    }
}
