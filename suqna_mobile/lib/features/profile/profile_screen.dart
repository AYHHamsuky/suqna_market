import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../auth/session.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(sessionProvider).user;
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(children: [
        const SizedBox(height: 12),
        Center(
          child: Column(children: [
            CircleAvatar(
              radius: 38,
              backgroundColor: Brand.ember.withValues(alpha: 0.15),
              child: Text(
                (user?.name.isNotEmpty ?? false) ? user!.name[0].toUpperCase() : '?',
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: Brand.emberDark),
              ),
            ),
            const SizedBox(height: 10),
            Text(user?.name ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            Text(user?.email ?? user?.phone ?? '', style: const TextStyle(color: Brand.muted)),
          ]),
        ),
        const SizedBox(height: 16),
        _tile(context, Icons.receipt_long_outlined, 'My orders', () => context.go('/orders')),
        _tile(context, Icons.favorite_border, 'Wishlist', () => context.push('/wishlist')),
        _tile(context, Icons.chat_bubble_outline, 'Messages', () => context.go('/messages')),
        _tile(context, Icons.settings_outlined, 'Settings', () => context.push('/settings')),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.logout, color: Color(0xFFDC2626)),
          title: const Text('Sign out', style: TextStyle(color: Color(0xFFDC2626))),
          onTap: () async {
            final ok = await showDialog<bool>(
              context: context,
              builder: (_) => AlertDialog(
                title: const Text('Sign out?'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                  ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Sign out')),
                ],
              ),
            );
            if (ok == true) {
              await ref.read(sessionProvider.notifier).logout();
            }
          },
        ),
        const SizedBox(height: 20),
        const Center(child: Text('Suqna • v1.0.0', style: TextStyle(color: Brand.faint, fontSize: 12))),
      ]),
    );
  }

  Widget _tile(BuildContext context, IconData icon, String label, VoidCallback onTap) => ListTile(
        leading: Icon(icon, color: Brand.muted),
        title: Text(label),
        trailing: const Icon(Icons.chevron_right, color: Brand.faint),
        onTap: onTap,
      );
}
