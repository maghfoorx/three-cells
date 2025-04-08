<?php

use App\Http\Controllers\GoogleController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    return ["Laravel" => app()->version()];
});

Route::get("/test-auth", function () {
    return response()->json(["user" => Auth::user()]);
})->middleware("web");

Route::get("/auth/google", [GoogleController::class, "redirectToGoogle"]);
Route::get("/auth/callback", [GoogleController::class, "handleGoogleCallback"]);

require __DIR__ . "/auth.php";
