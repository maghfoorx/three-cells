<?php declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\UserTask;
use Illuminate\Support\Facades\Auth;

final readonly class UserTasksQuery
{
    public function userTasks(
        null|string $root,
        array $args
    ): \Illuminate\Support\Collection {
        $user = Auth::user();

        if (!$user) {
            return collect();
        }

        return UserTask::where("user_id", $user->id)
            ->orderBy("created_at", "desc")
            ->get();
    }
}
