<?php declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\ThreeCell;
use Illuminate\Support\Facades\Auth;

final readonly class ThreeCellQuery
{
    public function resolve(null|string $root, array $args): ?ThreeCell
    {
        $user = Auth::user();

        return ThreeCell::where("user_id", $user->id)
            ->where("date_for", $args["date"])
            ->first();
    }

    public function allThreeCellEntries(
        null|string $root,
        array $args
    ): \Illuminate\Support\Collection {
        $user = Auth::user();

        return ThreeCell::where("user_id", $user->id)
            ->orderBy("date_for", "desc") // or 'created_at', depending on your sorting preference
            ->get();
    }
}
