<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('user_nda_consents', function (Blueprint $table) {
    $table->increments('id');
    $table->integer('user_id')->unsigned();
    $table->integer('discussion_id')->unsigned();
    $table->timestamp('agreed_at');
    $table->string('ip_address', 45)->nullable();

    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('discussion_id')->references('id')->on('discussions')->onDelete('cascade');
    $table->unique(['user_id', 'discussion_id']);
});
