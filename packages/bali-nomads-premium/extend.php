<?php

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Api\Serializer\PostSerializer;
use Flarum\Api\Serializer\UserSerializer;
use Flarum\Extend;
use Visualmulia\BaliNomadsPremium\Api\Controller\CreateNdaConsentController;
use Visualmulia\BaliNomadsPremium\Api\Controller\SubmitKycController;
use Visualmulia\BaliNomadsPremium\Api\Controller\VerifyUserController;
use Visualmulia\BaliNomadsPremium\Api\Serializer\AddDiscussionNdaAttributes;
use Visualmulia\BaliNomadsPremium\Api\Serializer\AddPostAccessControlAttributes;
use Visualmulia\BaliNomadsPremium\Api\Serializer\AddUserKycAttributes;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

    (new Extend\Routes('api'))
        ->post('/nda-consent', 'nda.consent.create', CreateNdaConsentController::class)
        ->post('/kyc/submit', 'kyc.submit', SubmitKycController::class)
        ->post('/kyc/verify', 'kyc.verify', VerifyUserController::class),

    (new Extend\ApiSerializer(UserSerializer::class))
        ->attributes(AddUserKycAttributes::class),

    (new Extend\ApiSerializer(DiscussionSerializer::class))
        ->attributes(AddDiscussionNdaAttributes::class),

    (new Extend\ApiSerializer(PostSerializer::class))
        ->attributes(AddPostAccessControlAttributes::class),

    new Extend\Locales(__DIR__.'/resources/locale'),
];
