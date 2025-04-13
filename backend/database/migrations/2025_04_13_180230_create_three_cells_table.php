<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("three_cells", function (Blueprint $table) {
            $table->id();

            $table->foreignId("user_id")->constrained()->onDelete("cascade");

            $table->date("date_for");
            $table->text("summary")->nullable();
            $table->decimal("focused_hours", 5, 2);
            $table->tinyInteger("score");

            $table->timestamps();
            $table->index(["user_id", "date_for"]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("three_cells");
    }
};
