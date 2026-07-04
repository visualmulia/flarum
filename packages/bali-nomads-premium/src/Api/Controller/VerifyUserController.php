<?php

namespace Visualmulia\BaliNomadsPremium\Api\Controller;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Flarum\Http\RequestUtil;
use Flarum\User\UserRepository;

class VerifyUserController implements RequestHandlerInterface
{
    protected $users;

    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    public function handle(Request $request): Response
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $body = $request->getParsedBody();
        $userId = isset($body['userId']) ? (int)$body['userId'] : null;
        $status = isset($body['status']) ? $body['status'] : '';

        if (!$userId || !in_array($status, ['verified', 'rejected'])) {
            return new JsonResponse(['error' => 'Invalid parameters'], 400);
        }

        $user = $this->users->findOrFail($userId);

        $user->kyc_status = $status;
        if ($status === 'verified') {
            $user->kyc_verified_at = new \DateTime();
        } else {
            $user->kyc_verified_at = null;
        }
        $user->save();

        return new JsonResponse([
            'success' => true,
            'userId' => $user->id,
            'kycStatus' => $user->kyc_status,
            'kycVerifiedAt' => $user->kyc_verified_at ? $user->kyc_verified_at->format(\DateTime::ATOM) : null
        ]);
    }
}
