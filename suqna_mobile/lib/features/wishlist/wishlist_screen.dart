import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/widgets.dart';
import '../data.dart';

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wish = ref.watch(wishlistProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Wishlist')),
      body: asyncView<dynamic>(
        wish,
        onRetry: () => ref.invalidate(wishlistProvider),
        data: (list) {
          if (list.isEmpty) {
            return EmptyState(
              icon: Icons.favorite_border,
              title: 'No saved items',
              subtitle: 'Tap the heart on any listing to save it here.',
              action: ElevatedButton(onPressed: () => context.go('/search'), child: const Text('Browse listings')),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(wishlistProvider),
            child: GridView.count(
              crossAxisCount: 2,
              padding: const EdgeInsets.all(12),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.72,
              children: [for (final l in list) ListingCard(listing: l)],
            ),
          );
        },
      ),
    );
  }
}
