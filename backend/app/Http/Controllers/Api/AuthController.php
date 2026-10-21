<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     * Login dengan email/username dan password.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $login = $request->input('login');

        // Cari user berdasarkan email atau username
        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email/username atau password salah.',
            ], 401);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Akun Anda sedang menunggu persetujuan admin.',
            ], 403);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi admin.',
            ], 403);
        }

        // Hapus token lama dan buat token baru
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role,
                'division' => $user->division,
                'status'   => $user->status,
            ],
        ]);
    }

    /**
     * POST /api/auth/register
     * Registrasi akun baru. Status default: pending.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'username' => $request->username,
            'email'    => $request->email,
            'password' => $request->password, // auto-hashed via cast
            'role'     => 'user',
            'division' => $request->division,
            'status'   => 'pending',
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil. Akun Anda menunggu persetujuan admin.',
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'username' => $user->username,
                'email'    => $user->email,
                'status'   => $user->status,
            ],
        ], 201);
    }

    /**
     * POST /api/auth/forgot-password
     * Kirim link reset password ke email.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ], [
            'email.exists' => 'Email tidak ditemukan dalam sistem.',
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Link reset password telah dikirim ke email Anda.',
            ]);
        }

        return response()->json([
            'message' => 'Gagal mengirim link reset password. Coba lagi nanti.',
        ], 500);
    }

    /**
     * POST /api/auth/logout
     * Hapus token saat ini (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * GET /api/auth/me
     * Kembalikan data profil pengguna yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id'       => $user->id,
            'name'     => $user->name,
            'username' => $user->username,
            'email'    => $user->email,
            'role'     => $user->role,
            'division' => $user->division,
            'status'   => $user->status,
        ]);
    }
}
