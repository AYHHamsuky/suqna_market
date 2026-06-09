import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/theme.dart';
import '../features/messages/unread.dart';

class HomeShell extends ConsumerStatefulWidget {
  final StatefulNavigationShell shell;
  const HomeShell({super.key, required this.shell});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  @override
  void initState() {
    super.initState();
    // Begin polling for new messages app-wide (plays the notification sound).
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(unreadProvider.notifier).start();
    });
  }

  void _go(int index) => widget.shell.goBranch(index, initialLocation: index == widget.shell.currentIndex);

  @override
  Widget build(BuildContext context) {
    final unread = ref.watch(unreadProvider);
    return Scaffold(
      body: widget.shell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: widget.shell.currentIndex,
        onDestinationSelected: _go,
        backgroundColor: Brand.surface,
        indicatorColor: Brand.ember.withValues(alpha: 0.12),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_rounded), label: 'Home'),
          const NavigationDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search_rounded), label: 'Search'),
          NavigationDestination(
            icon: _badge(const Icon(Icons.chat_bubble_outline), unread),
            selectedIcon: _badge(const Icon(Icons.chat_bubble_rounded), unread),
            label: 'Messages',
          ),
          const NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long_rounded), label: 'Orders'),
          const NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _badge(Widget child, int count) {
    if (count <= 0) return child;
    return Badge(
      label: Text('$count'),
      backgroundColor: Brand.ember,
      child: child,
    );
  }
}
