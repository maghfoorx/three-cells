<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\UserTask;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Log;

final readonly class UserTasksMutation
{
    public function createUserTask(null|string $root, array $args): UserTask
    {
        $user = Auth::user();
        $input = $args["input"];

        return UserTask::create([
            "user_id" => $user->id,
            "title" => $input["title"],
            "description" => $input["description"],
            "category_id" => $input["category_id"],
        ]);
    }

    public function toggleUserTaskCompletion(
        null|string $root,
        array $args
    ): UserTask {
        $user = Auth::user();
        $task_id = $args["task_id"];

        $task = UserTask::where("id", $task_id)
            ->where("user_id", $user->id)
            ->firstOrFail();

        $task->is_completed = !$task->is_completed;
        $task->completed_at = $task->is_completed ? now() : null;
        $task->save();

        return $task;
    }

    public function deleteUserTask(null|string $root, array $args): UserTask
    {
        $user = Auth::user();
        $task_id = $args["task_id"];

        $task = UserTask::where("id", $task_id)
            ->where("user_id", $user->id)
            ->firstOrFail();

        $deletedTask = clone $task;
        $task->delete();

        return $deletedTask;
    }
}
