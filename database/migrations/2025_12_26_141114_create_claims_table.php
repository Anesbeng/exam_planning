<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('exam_id');
            $table->unsignedBigInteger('teacher_id');
            $table->string('teacher_name');
            $table->text('message');
            $table->string('exam_type'); // 'exam', 'cc', or 'rattrapage'
            $table->enum('status', ['pending', 'resolved'])->default('pending');
            $table->timestamps();
            
            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('teacher_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('claims');
    }
};