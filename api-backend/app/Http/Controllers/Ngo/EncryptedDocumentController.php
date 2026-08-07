<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\EncryptedDocument;
use App\Services\EncryptedDocumentService;
use Illuminate\Http\Request;

class EncryptedDocumentController extends Controller
{
    public function __construct(private readonly EncryptedDocumentService $documentService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $documents = EncryptedDocument::where('owner_role', 'ngo')
            ->where('owner_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (EncryptedDocument $doc) => $this->summarize($doc));

        return response()->json(['data' => $documents]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'document' => 'required|file|max:10240',
        ]);

        $user = $request->user();

        $document = $this->documentService->store(
            $request->file('document'),
            $user->id,
            'ngo',
        );

        return response()->json([
            'message' => 'Document encrypted and stored',
            'data' => $this->summarize($document),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $document = EncryptedDocument::where('owner_role', 'ngo')
            ->where('owner_id', $user->id)
            ->findOrFail($id);

        return $this->documentService->download($document);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $document = EncryptedDocument::where('owner_role', 'ngo')
            ->where('owner_id', $user->id)
            ->findOrFail($id);

        $this->documentService->destroy($document);

        return response()->json(['message' => 'Document deleted']);
    }

    private function summarize(EncryptedDocument $doc): array
    {
        return [
            'id' => $doc->id,
            'original_filename' => $doc->original_filename,
            'mime_type' => $doc->mime_type,
            'file_size' => $doc->file_size,
            'encryption_algorithm' => $doc->encryption_algorithm,
            'created_at' => $doc->created_at,
        ];
    }
}