<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    /**
     * GET /api/admin/users
     * Daftar semua pengguna dengan filter role dan status.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::orderBy('created_at', 'desc');

        // Filter berdasarkan role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Pencarian nama/username/email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('username', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $users = $query->select(['id', 'name', 'username', 'email', 'role', 'division', 'status', 'created_at'])
            ->paginate(15);

        return response()->json($users);
    }

    /**
     * PUT /api/admin/users/{id}
     * Update data pengguna (nama, role, divisi, password).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => ['sometimes', 'string', 'max:150'],
            'role'     => ['sometimes', 'in:admin,user'],
            'division' => ['nullable', 'string', 'max:100'],
            'password' => ['sometimes', 'string', 'min:6'],
        ]);

        // Hash password jika diubah
        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui.',
            'user'    => $user->only(['id', 'name', 'username', 'email', 'role', 'division', 'status']),
        ]);
    }

    /**
     * PUT /api/admin/users/{id}/status
     * Ubah status pengguna: approve (pending→active), activate, deactivate.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:active,inactive,pending'],
        ], [
            'status.required' => 'Status wajib diisi.',
            'status.in'       => 'Status harus salah satu dari: active, inactive, pending.',
        ]);

        // Cegah admin menonaktifkan dirinya sendiri
        if ($user->id === $request->user()->id && $validated['status'] === 'inactive') {
            return response()->json([
                'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.',
            ], 422);
        }

        $user->update(['status' => $validated['status']]);

        $statusLabel = match ($validated['status']) {
            'active'   => 'diaktifkan',
            'inactive' => 'dinonaktifkan',
            'pending'  => 'dikembalikan ke pending',
        };

        return response()->json([
            'message' => "Akun {$user->name} berhasil {$statusLabel}.",
            'user'    => $user->only(['id', 'name', 'username', 'email', 'role', 'division', 'status']),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Hapus pengguna (tidak dapat menghapus diri sendiri).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => "Pengguna {$user->name} berhasil dihapus.",
        ]);
    }
}
