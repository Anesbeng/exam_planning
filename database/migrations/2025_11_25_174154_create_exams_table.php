<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('exams', function (Blueprint $table) {
    $table->id();
    $table->string('type');  // exam, cc, rattrapage
    $table->string('module');
    $table->string('teacher');
    $table->string('room');
    $table->string('specialite');
    $table->string('niveau');
    $table->string('group');
    $table->string('semester');
    $table->date('date');
    $table->time('start_time');
    $table->time('end_time');
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
