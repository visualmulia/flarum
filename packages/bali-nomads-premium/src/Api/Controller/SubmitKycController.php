<?php

namespace Visualmulia\BaliNomadsPremium\Api\Controller;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Flarum\Http\RequestUtil;
use Flarum\Foundation\Paths;
use Illuminate\Support\Str;

class SubmitKycController implements RequestHandlerInterface
{
    protected $paths;

    public function __construct(Paths $paths)
    {
        $this->paths = $paths;
    }

    public function handle(Request $request): Response
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        $body = $request->getParsedBody();
        $files = $request->getUploadedFiles();

        $kycTier = isset($body['kycTier']) ? $body['kycTier'] : '';
        $docType = isset($body['kycDocumentType']) ? $body['kycDocumentType'] : '';
        $docNumber = isset($body['kycDocumentNumber']) ? $body['kycDocumentNumber'] : '';

        if (!in_array($kycTier, ['investor', 'consultant'])) {
            return new JsonResponse(['error' => 'Invalid KYC tier selection'], 400);
        }

        if (empty($docType) || empty($docNumber)) {
            return new JsonResponse(['error' => 'Document type and number are required'], 400);
        }

        if (!isset($files['document']) || $files['document']->getError() !== UPLOAD_ERR_OK) {
            return new JsonResponse(['error' => 'Document file upload is required'], 400);
        }

        $uploadedFile = $files['document'];
        $filename = $uploadedFile->getClientFilename();
        $ext = pathinfo($filename, PATHINFO_EXTENSION);

        if (!in_array(strtolower($ext), ['pdf', 'jpg', 'jpeg', 'png'])) {
            return new JsonResponse(['error' => 'Only PDF, JPG, JPEG, and PNG files are allowed'], 400);
        }

        $secureFilename = $actor->id . '_' . Str::random(20) . '.' . $ext;
        $uploadDir = $this->paths->storage . '/kyc-documents';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0700, true); // Keep it private
        }

        $uploadPath = $uploadDir . '/' . $secureFilename;
        $uploadedFile->moveTo($uploadPath);

        $actor->kyc_status = 'pending';
        $actor->kyc_tier = $kycTier;
        $actor->kyc_document_type = $docType;
        $actor->kyc_document_number = \Illuminate\Container\Container::getInstance()->make('encrypter')->encrypt($docNumber);
        $actor->kyc_document_url = '/api/kyc/document/' . $secureFilename;
        $actor->kyc_submitted_at = new \DateTime();
        $actor->save();

        return new JsonResponse([
            'success' => true,
            'kycStatus' => $actor->kyc_status,
            'kycTier' => $actor->kyc_tier
        ]);
    }
}
