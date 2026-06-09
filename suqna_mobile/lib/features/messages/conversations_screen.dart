import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../../shared/widgets.dart';
import '../data.dart';

class ConversationsScreen extends ConsumerWidget {
  const ConversationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final convos = ref.watch(conversationsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Messages')),
      body: asyncView<dynamic>(
        convos,
        onRetry: () => ref.invalidate(conversationsProvider),
        data: (list) {
          if (list.isEmpty) {
            return const EmptyState(
              icon: Icons.chat_bubble_outline,
              title: 'No conversations yet',
              subtitle: 'Start a chat from a vendor or listing page.',
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(conversationsProvider),
            child: ListView.separated(
              itemCount: list.length,
              separatorBuilder: (_, _) => const Divider(height: 1, indent: 72),
              itemBuilder: (_, i) {
                final c = list[i];
                final name = c.title();
                return ListTile(
                  leading: CircleAvatar(
                    radius: 24,
                    backgroundColor: Brand.ember.withValues(alpha: 0.15),
                    child: Text(name.isNotEmpty ? name[0].toUpperCase() : '?',
                        style: const TextStyle(color: Brand.emberDark, fontWeight: FontWeight.w700)),
                  ),
                  title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(c.lastBody ?? 'No messages yet', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Brand.muted)),
                  trailing: c.unreadCount > 0
                      ? Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(color: Brand.ember, shape: BoxShape.circle),
                          child: Text('${c.unreadCount}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                        )
                      : const Icon(Icons.chevron_right, color: Brand.faint),
                  onTap: () => context.push('/chat/${c.id}', extra: name),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
