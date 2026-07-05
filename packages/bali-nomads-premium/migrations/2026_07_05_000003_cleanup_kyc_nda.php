<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if ($schema->hasTable('user_nda_consents')) {
            $schema->dropIfExists('user_nda_consents');
        }

        $schema->table('users', function (Blueprint $table) use ($schema) {
            $columns = [
                'kyc_status',
                'kyc_tier',
                'kyc_document_type',
                'kyc_document_number',
                'kyc_document_url',
                'kyc_submitted_at',
                'kyc_verified_at',
            ];
            foreach ($columns as $column) {
                if ($schema->hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    },
    'down' => function (Builder $schema) {
        // No down migration required for pivot teardown.
    }
];
