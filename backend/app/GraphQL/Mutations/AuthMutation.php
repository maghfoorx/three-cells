<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\MagicLinkEmail;
use App\Models\AuthToken;
use App\Notifications\MagicLinkNotification;
use Carbon\Carbon;
use Illuminate\Session\SessionManager;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;

final readonly class AuthMutation
{
    public function requestEmailLogin($root, array $args)
    {
        $email = $args["email"];
        $user = User::firstOrCreate(["email" => $email, "name" => "Maghfoor"]);
        if (!$user) {
            throw new \Exception("User not found.");
        }

        $key = "magic_link:" . $email;
        $maxAttempts = 5;
        $decaySeconds = 60; // 1 minute
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            throw new \Exception("Too many requests, please try again later.");
        }
        RateLimiter::hit($key, $decaySeconds);

        $token = Str::random(60);
        $hashedToken = hash_hmac("sha256", $token, "randomstring2");

        $expiresAt = Carbon::now()->addHours(2);

        // AuthToken::create([
        //     "user_id" => $user->id,
        //     "token" => $hashedToken,
        //     "expires_at" => $expiresAt,
        //     "type" => "magic_link",
        // ]);

        $url = config("app.frontend_url") . "/verify?token=" . $token;

        // $user->notify(new MagicLinkNotification($url));

        return true;
    }

    public function verifyEmailLogin($root, array $args)
    {
        $providedToken = $args["token"];
        $hashedToken = hash_hmac("sha256", $providedToken, "randomstring2");

        // $authToken = AuthToken::where("token", $hashedToken)
        //     ->where("expires_at", ">", now())
        //     ->first();

        // if (!$authToken) {
        //     throw new \Exception(
        //         "Invalid or expired token." .
        //             $providedToken .
        //             " " .
        //             $hashedToken
        //     );
        // }

        // $user = User::findOrFail($authToken->user_id);

        // Auth::login($user);

        // session()->regenerateToken();

        // $authToken->delete();
        // return [
        //     "user" => $user,
        // ];
    }

    public function logout($root, array $args)
    {
        $user = Auth::user();

        if (!$user) {
            throw new \Exception("Not authenticated.");
        }

        Auth::guard("web")->logout();
        session()->invalidate();
        session()->regenerateToken();

        return [
            "success" => true,
            "user" => Auth::user(),
        ];
    }

    public function changeName($root, array $args)
    {
        $newName = $args["updatedName"];

        $user = Auth::user();

        $user->name = $newName;
        $user->save();

        return $user;
    }
}
