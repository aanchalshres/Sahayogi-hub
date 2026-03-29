<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VolunteerProfile;
use App\Models\NgoProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $commonRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:volunteer,ngo',
            'phone' => 'required|string|regex:/^[0-9+\-\s\(\)]+$/|max:20',
        ];

        // Validate common fields first
        $request->validate($commonRules);

        // Now that role is validated, set role-specific rules
        $roleRules = [];

        if ($request->role === 'volunteer') {
            $roleRules = [
                'location' => 'required|string|max:255',
            ];
        } elseif ($request->role === 'ngo') {
            $roleRules = [
                'organizationName' => 'required|string|max:255',
                'registrationNumber' => 'required|string|max:50',
                'panNumber' => 'required|string|max:20',
                'officeLocation' => 'required|string|max:255',
                'registrationFile' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'panFile' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'letterhead' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            ];
        }

        // Validate role-specific fields
        $request->validate($roleRules);

        try {
            return DB::transaction(function () use ($request) {
                // Create user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => $request->role,
                    'phone' => $request->phone,
                ]);

                // Create role-specific profile
                if ($request->role === 'volunteer') {
                    VolunteerProfile::create([
                        'user_id' => $user->id,
                        'primary_location' => $request->location,
                    ]);
                } elseif ($request->role === 'ngo') {
                    // Handle file uploads
                    $regFilePath = null;
                    $panFilePath = null;
                    $letterheadPath = null;

                    try {
                        if ($request->hasFile('registrationFile')) {
                            $regFilePath = $request->file('registrationFile')->store('ngo-documents/registration', 'public');
                        }
                        if ($request->hasFile('panFile')) {
                            $panFilePath = $request->file('panFile')->store('ngo-documents/pan', 'public');
                        }
                        if ($request->hasFile('letterhead')) {
                            $letterheadPath = $request->file('letterhead')->store('ngo-documents/letterhead', 'public');
                        }
                    } catch (\Exception $e) {
                        throw new \Exception('File upload failed: ' . $e->getMessage());
                    }

                    NgoProfile::create([
                        'user_id' => $user->id,
                        'organization_name' => $request->organizationName,
                        'registration_number' => $request->registrationNumber,
                        'pan_number' => $request->panNumber,
                        'office_location' => $request->officeLocation,
                        'registration_file_path' => $regFilePath,
                        'pan_file_path' => $panFilePath,
                        'letterhead_file_path' => $letterheadPath,
                        'is_verified' => false,
                    ]);
                }

                $token = $user->createToken('auth_token')->plainTextToken;

                // Reload user with relationships
                $user->load(['volunteerProfile', 'ngoProfile']);

                $userData = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                ];

                // Add role-specific profile data
                if ($user->role === 'volunteer' && $user->volunteerProfile) {
                    $userData['profile'] = $user->volunteerProfile;
                } elseif ($user->role === 'ngo' && $user->ngoProfile) {
                    $userData['profile'] = $user->ngoProfile;
                }

                return response()->json([
                    'message' => 'Registered successfully',
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'user' => $userData,
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        try {
            $user = User::with(['volunteerProfile', 'ngoProfile'])->find(Auth::id());
            $token = $user->createToken('auth_token')->plainTextToken;

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
            ];

            // Add role-specific profile data
            if ($user->role === 'volunteer' && $user->volunteerProfile) {
                $userData['profile'] = $user->volunteerProfile;
            } elseif ($user->role === 'ngo' && $user->ngoProfile) {
                $userData['profile'] = $user->ngoProfile;
            }

            return response()->json([
                'message' => 'Login successful',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $userData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function user(Request $request)
    {
        try {
            $user = $request->user()->load(['volunteerProfile', 'ngoProfile']);

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
            ];

            // Add role-specific profile data
            if ($user->role === 'volunteer' && $user->volunteerProfile) {
                $userData['profile'] = $user->volunteerProfile;
            } elseif ($user->role === 'ngo' && $user->ngoProfile) {
                $userData['profile'] = $user->ngoProfile;
            }

            return response()->json(['user' => $userData]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch user',
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out successfully']);
    }
}
