<?php

namespace Visualmulia\BaliNomadsPremium\Api\Controller;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Flarum\Http\RequestUtil;

class CreateNdaConsentController implements RequestHandlerInterface
{
    public function handle(Request $request): Response
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        $body = $request->getParsedBody();
        $discussionId = isset($body['discussionId']) ? (int)$body['discussionId'] : null;

        if (!$discussionId) {
            return new JsonResponse(['error' => 'Missing discussionId'], 400);
        }

        $db = \Illuminate\Container\Container::getInstance()->make('db');
        $discussionExists = $db->table('discussions')->where('id', $discussionId)->exists();
        if (!$discussionExists) {
            return new JsonResponse(['error' => 'Discussion not found'], 404);
        }

        $db->table('user_nda_consents')->updateOrInsert(
            ['user_id' => $actor->id, 'discussion_id' => $discussionId],
            [
                'agreed_at' => new \DateTime(),
                'ip_address' => isset($request->getServerParams()['REMOTE_ADDR']) ? $request->getServerParams()['REMOTE_ADDR'] : null
            ]
        );

        return new JsonResponse(['success' => true, 'hasAgreedNda' => true]);
    }
}
