<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTaskCategory extends Model
{
    protected $table = "user_tasks_categories";

    protected $fillable = ["user_id", "name", "colour"];
}
