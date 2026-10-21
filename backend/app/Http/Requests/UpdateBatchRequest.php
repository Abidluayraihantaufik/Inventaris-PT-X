<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $batchId = $this->route('id');

        return [
            'product_id'       => ['sometimes', 'integer', 'exists:products,id'],
            'batch_no'         => ['sometimes', 'string', 'max:100', Rule::unique('inventory_batches', 'batch_no')->ignore($batchId)],
            'supplier_name'    => ['sometimes', 'string', 'max:200'],
            'storage_location' => ['sometimes', 'string', 'max:100'],
            'stock_quantity'   => ['sometimes', 'numeric', 'min:0'],
            'entry_date'       => ['sometimes', 'date'],
            'expiry_date'      => ['sometimes', 'date', 'after:entry_date'],
            'notes'            => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'batch_no.unique'      => 'Nomor batch sudah digunakan oleh batch lain.',
            'expiry_date.after'    => 'Tanggal kadaluarsa harus setelah tanggal masuk.',
            'stock_quantity.min'   => 'Jumlah stok tidak boleh negatif.',
        ];
    }
}
