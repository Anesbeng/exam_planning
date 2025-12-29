<?php
// database/migrations/xxxx_xx_xx_create_notifications_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('teacher_matricule');
            $table->unsignedBigInteger('exam_id');
            $table->enum('exam_type', ['exam', 'cc', 'rattrapage']);
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
            
            // Just add indexes, no foreign key
            $table->index('teacher_matricule');
            $table->index('is_read');
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};