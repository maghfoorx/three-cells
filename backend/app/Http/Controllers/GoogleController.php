<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver("google")->redirect();
    }

    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver("google")->user();

        $user = User::firstOrCreate(
            [
                "email" => $googleUser->getEmail(),
            ],
            [
                "name" => $googleUser->getName(),
                "image" => $googleUser->getAvatar(),
            ]
        );

        Auth::login($user);

        return redirect(env("FRONTEND_URL") . "/profile");
    }
}
