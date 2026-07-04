<?php

use Flarum\Database\Migration;

return Migration::addColumns('users', [
    'kyc_status' => ['string', 'length' => 50, 'default' => 'unverified'],
    'kyc_tier' => ['string', 'length' => 50, 'default' => 'none'],
    'kyc_document_type' => ['string', 'length' => 100, 'nullable' => true],
    'kyc_document_number' => ['string', 'length' => 255, 'nullable' => true],
    'kyc_document_url' => ['string', 'length' => 255, 'nullable' => true],
    'kyc_submitted_at' => ['timestamp', 'nullable' => true],
    'kyc_verified_at' => ['timestamp', 'nullable' => true],
]);
