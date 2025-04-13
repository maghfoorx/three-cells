<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\ThreeCell;
use Illuminate\Support\Facades\Auth;

final readonly class ThreeCellMutation
{
    public function submit(null|string $root, array $args): ThreeCell
    {
        $user = Auth::user();
        $input = $args["input"];

        return ThreeCell::updateOrCreate(
            [
                "user_id" => $user->id,
                "date_for" => $input["date_for"],
            ],
            [
                "summary" => $input["summary"],
                "focused_hours" => $input["focused_hours"],
                "score" => $input["score"],
            ]
        );
    }
}
