<?php

namespace Visualmulia\BaliNomadsPremium\Api\Serializer;

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Illuminate\Support\Facades\DB;

class AddDiscussionNdaAttributes
{
    public function __invoke(DiscussionSerializer $serializer, Discussion $discussion, array $attributes): array
    {
        $actor = $serializer->getActor();

        $requiresNda = false;
        if (isset($discussion->tags)) {
            foreach ($discussion->tags as $tag) {
                if (in_array($tag->slug, ['business-for-sale', 'business-need-fundings'])) {
                    $requiresNda = true;
                    break;
                }
            }
        }

        $attributes['requiresNda'] = $requiresNda;

        if ($requiresNda) {
            if ($actor->isGuest()) {
                $attributes['hasAgreedNda'] = false;
            } else {
                $attributes['hasAgreedNda'] = DB::table('user_nda_consents')
                    ->where('user_id', $actor->id)
                    ->where('discussion_id', $discussion->id)
                    ->exists();
            }
        } else {
            $attributes['hasAgreedNda'] = true;
        }

        return $attributes;
    }
}
