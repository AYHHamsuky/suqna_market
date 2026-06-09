import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/sound.dart';
import '../../core/theme.dart';
import '../../models/models.dart';
import '../../shared/widgets.dart';
import '../auth/session.dart';
import 'unread.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final int conversationId;
  final String? title;
  const ChatScreen({super.key, required this.conversationId, this.title});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  Timer? _timer;
  List<Message> _messages = [];
  String? _title;
  bool _loading = true;
  bool _sending = false;
  bool _firstLoad = true;
  int _lastIncomingId = 0;

  int get _me => ref.read(sessionProvider).user?.id ?? -1;

  @override
  void initState() {
    super.initState();
    _title = widget.title;
    _load();
    _timer = Timer.periodic(const Duration(seconds: 4), (_) => _load(silent: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    try {
      final res = await ref.read(apiProvider).dio.get('/conversations/${widget.conversationId}/messages');
      final msgs = (res.data['messages'] as List? ?? [])
          .map((e) => Message.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      final convo = res.data['conversation'];
      final title = convo is Map
          ? (convo['vendor']?['business_name'] ?? convo['customer']?['name'])
          : null;

      // Detect a new incoming message (from the other party) → play the sound.
      int maxIncoming = 0;
      for (final m in msgs) {
        if (m.senderId != _me && m.id > maxIncoming) maxIncoming = m.id;
      }
      if (!_firstLoad && maxIncoming > _lastIncomingId) {
        ref.read(messageSoundProvider).play();
      }
      _lastIncomingId = maxIncoming;
      _firstLoad = false;

      if (!mounted) return;
      setState(() {
        _messages = msgs;
        _title = title ?? _title;
        _loading = false;
      });
      _scrollToEnd();
      // Reading marks messages read server-side — refresh the global badge.
      ref.read(unreadProvider.notifier).refresh();
    } catch (e) {
      if (!silent && mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
      }
    }
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.jumpTo(_scroll.position.maxScrollExtent);
      }
    });
  }

  Future<void> _send() async {
    final body = _input.text.trim();
    if (body.isEmpty || _sending) return;
    setState(() => _sending = true);
    _input.clear();
    try {
      await ref.read(apiProvider).dio.post('/conversations/${widget.conversationId}/messages', data: {'body': body});
      await _load(silent: true);
    } catch (e) {
      _input.text = body;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_title ?? 'Chat')),
      body: Column(children: [
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _messages.isEmpty
                  ? const EmptyState(icon: Icons.chat_bubble_outline, title: 'Say hello 👋', subtitle: 'Send the first message.')
                  : ListView.builder(
                      controller: _scroll,
                      padding: const EdgeInsets.all(12),
                      itemCount: _messages.length,
                      itemBuilder: (_, i) => _bubble(_messages[i]),
                    ),
        ),
        _composer(),
      ]),
    );
  }

  Widget _bubble(Message m) {
    final mine = m.senderId == _me;
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 3),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: mine ? Brand.ember : Brand.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(mine ? 16 : 4),
            bottomRight: Radius.circular(mine ? 4 : 16),
          ),
          border: mine ? null : Border.all(color: Brand.line),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (m.attachment != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: ClipRRect(borderRadius: BorderRadius.circular(10), child: SuqImage(m.attachment, width: 180)),
            ),
          if (m.body != null && m.body!.isNotEmpty)
            Text(m.body!, style: TextStyle(color: mine ? Colors.white : Brand.ink)),
          const SizedBox(height: 2),
          Text(dateTimeFmt(m.createdAt), style: TextStyle(fontSize: 10, color: mine ? Colors.white70 : Brand.faint)),
        ]),
      ),
    );
  }

  Widget _composer() {
    return Container(
      padding: EdgeInsets.fromLTRB(12, 8, 12, 8 + MediaQuery.of(context).padding.bottom),
      decoration: const BoxDecoration(color: Brand.surface, border: Border(top: BorderSide(color: Brand.line))),
      child: Row(children: [
        Expanded(
          child: TextField(
            controller: _input,
            minLines: 1,
            maxLines: 4,
            textInputAction: TextInputAction.send,
            onSubmitted: (_) => _send(),
            decoration: const InputDecoration(hintText: 'Type a message…', isDense: true),
          ),
        ),
        const SizedBox(width: 8),
        CircleAvatar(
          radius: 22,
          backgroundColor: Brand.ember,
          child: IconButton(
            icon: _sending
                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.send, color: Colors.white, size: 20),
            onPressed: _send,
          ),
        ),
      ]),
    );
  }
}
