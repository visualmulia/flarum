<?php

namespace Visualmulia\BaliNomadsPremium\Api\Controller;

use Flarum\Http\RequestUtil;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Illuminate\Database\Capsule\Manager as DB;

class UserRoleController implements RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        if ($actor->isGuest()) {
            return new JsonResponse(['error' => 'Not authenticated.'], 401);
        }

        $userId = $actor->id;
        $method = $request->getMethod();

        // Target badge IDs for Developer (4), Marketer (5), Creator (6)
        $roleBadgeIds = [4, 5, 6];

        if ($method === 'GET') {
            // Find if user already has one of these badges in flarum_fof_badge_user
            $existing = DB::table('flarum_fof_badge_user')
                ->where('user_id', $userId)
                ->whereIn('badge_id', $roleBadgeIds)
                ->first();

            return new JsonResponse([
                'data' => [
                    'roleId' => $existing ? $existing->badge_id : null
                ]
            ]);
        }

        if ($method === 'POST') {
            $body = $request->getParsedBody();
            $roleId = isset($body['roleId']) ? (int)$body['roleId'] : 0;

            // Start a transaction
            DB::transaction(function () use ($userId, $roleId, $roleBadgeIds) {
                // 1. Delete any existing role badge for this user
                DB::table('flarum_fof_badge_user')
                    ->where('user_id', $userId)
                    ->whereIn('badge_id', $roleBadgeIds)
                    ->delete();

                // 2. Insert new badge if valid
                if (in_array($roleId, $roleBadgeIds)) {
                    DB::table('flarum_fof_badge_user')->insert([
                        'user_id' => $userId,
                        'badge_id' => $roleId,
                        'granted_by' => 'manual',
                        'granted_by_user_id' => $userId, // Self-selected
                        'reason' => 'Self-selected specialization role',
                        'is_seen' => 1,
                        'show_on_card' => 1,
                        'is_primary' => 1,
                        'earned_at' => date('Y-m-d H:i:s')
                    ]);
                }
            });

            return new JsonResponse(['success' => true]);
        }

        return new JsonResponse(['error' => 'Method not allowed.'], 405);
    }
}
