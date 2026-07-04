<?php

namespace Visualmulia\BaliNomadsPremium\Api\Serializer;

use Flarum\Api\Serializer\PostSerializer;
use Flarum\Post\Post;
use Illuminate\Support\Facades\DB;

class AddPostAccessControlAttributes
{
    public function __invoke(PostSerializer $serializer, Post $post, array $attributes): array
    {
        $actor = $serializer->getActor();
        $discussion = $post->discussion;

        if (!$discussion) {
            return $attributes;
        }

        $isVault = false;
        if (isset($discussion->tags)) {
            foreach ($discussion->tags as $tag) {
                if ($tag->slug === 'the-vault') {
                    $isVault = true;
                    break;
                }
            }
        }

        if ($isVault && $actor->isGuest()) {
            $attributes['content'] = '[Detailed content locked. Please register and verify your email/phone number to unlock this content and download documents.]';
            $attributes['contentHtml'] = '<div class="premium-locked-notice"><i class="fas fa-lock"></i> <span class="lock-title">Premium Document Locked</span><p class="lock-desc">Detailed legal documents, tax guides, and market reports are restricted. Please sign up or log in to access this content.</p><div class="lock-actions"><a class="Button Button--primary" href="/signup">Create Free Account</a><a class="Button" href="/login">Log In</a></div></div>';
            if (isset($attributes['relationships']['attachments'])) {
                unset($attributes['relationships']['attachments']);
            }
            return $attributes;
        }

        $requiresNda = false;
        if (isset($discussion->tags)) {
            foreach ($discussion->tags as $tag) {
                if (in_array($tag->slug, ['business-for-sale', 'business-need-fundings'])) {
                    $requiresNda = true;
                    break;
                }
            }
        }

        if ($requiresNda) {
            $hasAgreedNda = false;
            if (!$actor->isGuest()) {
                if ($actor->isAdmin() || $actor->id === $discussion->user_id || $actor->id === $post->user_id) {
                    $hasAgreedNda = true;
                } else {
                    $hasAgreedNda = DB::table('user_nda_consents')
                        ->where('user_id', $actor->id)
                        ->where('discussion_id', $discussion->id)
                        ->exists();
                }
            }

            if (!$hasAgreedNda) {
                $attributes['content'] = '[Sensitive content hidden. You must sign the Non-Disclosure Agreement (NDA) to view this content.]';
                $attributes['contentHtml'] = '<div class="nda-locked-notice"><i class="fas fa-file-contract"></i> <span class="lock-title">NDA Consent Required</span><p class="lock-desc">This discussion contains sensitive business financials and pitching details. You must agree to the Non-Disclosure Agreement (NDA) to view the details and attachments.</p><button class="Button Button--primary sign-nda-btn" data-discussion-id="' . $discussion->id . '">Sign NDA to Unlock</button></div>';
                if (isset($attributes['relationships']['attachments'])) {
                    unset($attributes['relationships']['attachments']);
                }
            }
        }

        return $attributes;
    }
}
