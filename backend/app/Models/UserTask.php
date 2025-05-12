<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTask extends Model
{
    protected $table = "user_tasks";

    protected $fillable = [
        "user_id",
        "title",
        "description",
        "category_id",
        "is_completed",
        "completed_at",
    ];

    public function category()
    {
        return $this->belongsTo(UserTaskCategory::class);
    }

    protected $appends = ["category", "category_colour"];

    public function getCategoryAttribute()
    {
        return $this->category()->value("name");
    }

    public function getCategoryColourAttribute()
    {
        return $this->category()->value("colour");
    }
}
