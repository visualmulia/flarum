<?php

use Flarum\Extend;
use Visualmulia\BaliNomadsPremium\Api\Controller\CookSocialsController;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

    (new Extend\Routes('api'))
        ->post('/cook-socials', 'cook.socials', CookSocialsController::class),
];
