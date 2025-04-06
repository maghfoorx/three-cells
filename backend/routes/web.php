<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    return ["Laravel" => app()->version()];
});

Route::get("/test-auth", function () {
    return response()->json(["user" => Auth::user()]);
})->middleware("auth:sanctum");

require __DIR__ . "/auth.php";
