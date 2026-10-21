<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'batches'              => ['required', 'array', 'min:1'],
            'batches.*.batch_id'   => ['required', 'integer', 'exists:inventory_batches,id'],
            'batches.*.quantity'   => ['required', 'numeric', 'min:0.01'],
            'out_date'             => ['required', 'date'],
            'purpose'              => ['required', 'string', 'max:255'],
            'recipient'            => ['required', 'string', 'max:150'],
            'notes'                => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'batches.required'            => 'Pilih setidaknya satu batch.',
            'batches.*.batch_id.exists'   => 'Batch tidak ditemukan.',
            'batches.*.quantity.min'      => 'Jumlah harus lebih dari 0.',
            'out_date.required'           => 'Tanggal keluar wajib diisi.',
            'recipient.required'          => 'Penerima wajib diisi.',
            'purpose.required'            => 'Tujuan wajib diisi.',
        ];
    }
}
