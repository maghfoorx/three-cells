<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThreeCell extends Model
{
    protected $table = "three_cells";

    protected $fillable = [
        "user_id",
        "summary",
        "focused_hours",
        "score",
        "date_for",
    ];
}
