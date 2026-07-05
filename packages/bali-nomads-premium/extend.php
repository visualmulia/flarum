<?php

use Flarum\Api\Resource\DiscussionResource;
use Flarum\Api\Resource\PostResource;
use Flarum\Api\Resource\UserResource;
use Flarum\Api\Schema\Boolean;
use Flarum\Api\Schema\Str;
use Flarum\Extend;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Facades\DB;
use Visualmulia\BaliNomadsPremium\Api\Controller\CreateNdaConsentController;
use Visualmulia\BaliNomadsPremium\Api\Controller\SubmitKycController;
use Visualmulia\BaliNomadsPremium\Api\Controller\VerifyUserController;

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

    (new Extend\ApiResource(UserResource::class))
        ->fields(fn () => [
            Str::make('kycStatus')
                ->get(fn ($user) => $user->kyc_status),
            Str::make('kycTier')
                ->get(fn ($user) => $user->kyc_tier),
            Str::make('kycDocumentType')
                ->visible(fn ($user, $context) => RequestUtil::getActor($context->request)->isAdmin() || RequestUtil::getActor($context->request)->id === $user->id)
                ->get(fn ($user) => $user->kyc_document_type),
            Str::make('kycDocumentNumber')
                ->visible(fn ($user, $context) => RequestUtil::getActor($context->request)->isAdmin() || RequestUtil::getActor($context->request)->id === $user->id)
                ->get(fn ($user) => $user->kyc_document_number ? decrypt($user->kyc_document_number) : null),
            Str::make('kycDocumentUrl')
                ->visible(fn ($user, $context) => RequestUtil::getActor($context->request)->isAdmin() || RequestUtil::getActor($context->request)->id === $user->id)
                ->get(fn ($user) => $user->kyc_document_url),
        ]),

    (new Extend\ApiResource(DiscussionResource::class))
        ->fields(fn () => [
            Boolean::make('requiresNda')
                ->get(function ($discussion) {
                    if (isset($discussion->tags)) {
                        foreach ($discussion->tags as $tag) {
                            if (in_array($tag->slug, ['business-for-sale', 'business-need-fundings'])) {
                                return true;
                            }
                        }
                    }
                    return false;
                }),
            Boolean::make('hasAgreedNda')
                ->get(function ($discussion, $context) {
                    $actor = RequestUtil::getActor($context->request);
                    $requiresNda = false;
                    if (isset($discussion->tags)) {
                        foreach ($discussion->tags as $tag) {
                            if (in_array($tag->slug, ['business-for-sale', 'business-need-fundings'])) {
                                $requiresNda = true;
                                break;
                            }
                        }
                    }
                    if (!$requiresNda) {
                        return true;
                    }
                    if ($actor->isGuest()) {
                        return false;
                    }
                    if ($actor->isAdmin() || $actor->id === $discussion->user_id) {
                        return true;
                    }
                    return DB::table('user_nda_consents')
                        ->where('user_id', $actor->id)
                        ->where('discussion_id', $discussion->id)
                        ->exists();
                }),
        ]),

    (new Extend\ApiResource(PostResource::class))
        ->field('contentHtml', function ($field) {
            return $field->get(function ($post, $context) {
                $actor = RequestUtil::getActor($context->request);
                $discussion = $post->discussion;
                if (!$discussion) {
                    return $post->content_html;
                }

                // Vault check
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
                    return '<div class="premium-locked-notice"><i class="fas fa-lock"></i> <span class="lock-title">Premium Document Locked</span><p class="lock-desc">Detailed legal documents, tax guides, and market reports are restricted. Please sign up or log in to access this content.</p><div class="lock-actions"><a class="Button Button--primary" href="/signup">Create Free Account</a><a class="Button" href="/login">Log In</a></div></div>';
                }

                // NDA check
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
                        return '<div class="nda-locked-notice"><i class="fas fa-file-contract"></i> <span class="lock-title">NDA Consent Required</span><p class="lock-desc">This discussion contains sensitive business financials and pitching details. You must agree to the Non-Disclosure Agreement (NDA) to view the details and attachments.</p><button class="Button Button--primary sign-nda-btn" data-discussion-id="' . $discussion->id . '">Sign NDA to Unlock</button></div>';
                    }
                }

                return $post->content_html;
            });
        }),
];
