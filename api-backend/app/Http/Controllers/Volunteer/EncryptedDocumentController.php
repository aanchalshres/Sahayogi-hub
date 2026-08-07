<?php

namespace App\Http\Controllers\Volunteer;

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

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        $documents = EncryptedDocument::where('owner_role', 'volunteer')
            ->where('owner_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (EncryptedDocument $doc) => $this->summarize($doc));

        return response()->json(['data' => $documents]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access documents'
            ], 403);
        }

        $request->validate([
            'document' => 'required|file|max:10240',
        ]);

        $document = $this->documentService->store(
            $request->file('document'),
            $user->id,
            'volunteer',
        );

        return response()->json([
            'success' => true,
            'message' => 'Document encrypted and stored successfully.',
            'data' => $this->summarize($document),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access documents'
            ], 403);
        }

        $document = EncryptedDocument::where('owner_role', 'volunteer')
            ->where('owner_id', $user->id)
            ->findOrFail($id);

        return $this->documentService->download($document);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access documents'
            ], 403);
        }

        $document = EncryptedDocument::where('owner_role', 'volunteer')
            ->where('owner_id', $user->id)
            ->findOrFail($id);

        $this->documentService->destroy($document);

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully.',
        ]);
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