<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\HandlesImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\VendorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    use HandlesImageUploads;

    /** List the authenticated user's conversations (works for customers and vendors). */
    public function index(Request $request)
    {
        $user = $request->user();
        $vendorId = $user->vendorProfile?->id;

        $conversations = Conversation::query()
            ->where(function ($q) use ($user, $vendorId) {
                $q->where('customer_id', $user->id);
                if ($vendorId) {
                    $q->orWhere('vendor_id', $vendorId);
                }
            })
            ->with([
                'customer:id,name,avatar',
                'vendor:id,business_name,slug,logo',
            ])
            ->withCount(['messages as unread_count' => fn ($q) => $q->where('is_read', false)->where('sender_id', '!=', $user->id)])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($c) {
                $c->last_message = $c->messages()->latest()->first(['id', 'body', 'sender_id', 'created_at']);
                return $c;
            });

        return response()->json(['data' => $conversations]);
    }

    /** Start (or reuse) a conversation with a vendor. Customer-initiated. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'vendor_id' => ['required', 'exists:vendor_profiles,id'],
            'order_id' => ['nullable', 'exists:orders,id'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        $conversation = Conversation::firstOrCreate(
            ['customer_id' => $user->id, 'vendor_id' => $data['vendor_id']],
            ['order_id' => $data['order_id'] ?? null]
        );

        if (! empty($data['body'])) {
            $this->createMessage($conversation, $user->id, $data['body']);
        }

        return response()->json(['data' => $conversation->load(['vendor:id,business_name,slug,logo', 'customer:id,name,avatar'])], 201);
    }

    public function messages(Request $request, int $id)
    {
        $conversation = $this->authorizeConversation($request, $id);

        // Mark incoming messages as read.
        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = $conversation->messages()->with('sender:id,name,avatar')->get();

        return response()->json([
            'conversation' => $conversation->load(['vendor:id,business_name,slug,logo', 'customer:id,name,avatar']),
            'messages' => $messages,
        ]);
    }

    public function sendMessage(Request $request, int $id)
    {
        $conversation = $this->authorizeConversation($request, $id);

        $data = $request->validate([
            'body' => ['nullable', 'string', 'max:2000', 'required_without:attachment'],
            'attachment' => ['nullable', 'image', 'max:5120'],
        ]);

        $attachment = $request->hasFile('attachment')
            ? $this->storeImage($request->file('attachment'), 'chat/'.$conversation->id)
            : null;

        $message = $this->createMessage($conversation, $request->user()->id, $data['body'] ?? null, $attachment);

        return response()->json(['data' => $message->load('sender:id,name,avatar')], 201);
    }

    protected function createMessage(Conversation $conversation, int $senderId, ?string $body, ?string $attachment = null): Message
    {
        return DB::transaction(function () use ($conversation, $senderId, $body, $attachment) {
            $message = $conversation->messages()->create([
                'sender_id' => $senderId,
                'body' => $body,
                'attachment' => $attachment,
            ]);
            $conversation->update(['last_message_at' => now()]);
            return $message;
        });
    }

    /** Ensure the current user participates in the conversation. */
    protected function authorizeConversation(Request $request, int $id): Conversation
    {
        $user = $request->user();
        $vendorId = $user->vendorProfile?->id;

        $conversation = Conversation::findOrFail($id);
        abort_unless(
            $conversation->customer_id === $user->id || ($vendorId && $conversation->vendor_id === $vendorId),
            403,
            'You are not part of this conversation.'
        );

        return $conversation;
    }
}
