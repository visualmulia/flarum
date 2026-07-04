<?php

namespace Visualmulia\BaliNomadsPremium\Api\Serializer;

use Flarum\Api\Serializer\UserSerializer;
use Flarum\User\User;

class AddUserKycAttributes
{
    public function __invoke(UserSerializer $serializer, User $user, array $attributes): array
    {
        $actor = $serializer->getActor();

        $attributes['kycStatus'] = $user->kyc_status;
        $attributes['kycTier'] = $user->kyc_tier;

        if ($actor->isAdmin() || $actor->id === $user->id) {
            $attributes['kycDocumentType'] = $user->kyc_document_type;
            $attributes['kycDocumentNumber'] = $user->kyc_document_number;
            $attributes['kycDocumentUrl'] = $user->kyc_document_url;
            $attributes['kycSubmittedAt'] = $user->kyc_submitted_at ? (new \DateTime($user->kyc_submitted_at))->format(\DateTime::ATOM) : null;
            $attributes['kycVerifiedAt'] = $user->kyc_verified_at ? (new \DateTime($user->kyc_verified_at))->format(\DateTime::ATOM) : null;
        }

        return $attributes;
    }
}
