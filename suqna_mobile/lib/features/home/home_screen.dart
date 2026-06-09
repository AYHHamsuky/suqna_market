import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../../shared/widgets.dart';
import '../auth/session.dart';
import '../cart/cart.dart';
import '../data.dart';
import '../search/search_screen.dart';

const _categoryIcons = {
  'street-food-drinks': '🍖',
  'fresh-produce-farm-goods': '🥬',
  'dairy-animal-products': '🥛',
  'clothing-fabric': '🧵',
  'repairs-trades': '🔧',
  'personal-services': '✂️',
  'household-supplies': '🏠',
  'education-skills': '📚',
  'general-retail': '🛍️',
};

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(sessionProvider).user;
    final cats = ref.watch(categoriesProvider);
    final popular = ref.watch(listingsProvider(const SearchArgs(sort: 'rating')));

    void openCategory(String slug) {
      ref.read(searchArgsProvider.notifier).state = SearchArgs(category: slug);
      context.go('/search');
    }

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const SuqnaWordmark(size: 26),
        actions: [const _CartButton(), const SizedBox(width: 4)],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          ref.invalidate(listingsProvider(const SearchArgs(sort: 'rating')));
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            Text('Hello, ${user?.name.split(' ').first ?? 'there'} 👋',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
            const Text('What are you looking for today?', style: TextStyle(color: Brand.muted)),
            const SizedBox(height: 14),
            // Search bar (tap to go to search tab)
            GestureDetector(
              onTap: () => context.go('/search'),
              child: AbsorbPointer(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search gullisuwa, tuwo, phone repair…',
                    prefixIcon: const Icon(Icons.search),
                    fillColor: Brand.surface,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 22),
            const _SectionHeader('Browse by category'),
            const SizedBox(height: 10),
            cats.when(
              loading: () => const SizedBox(height: 90, child: Center(child: CircularProgressIndicator())),
              error: (_, _) => const SizedBox.shrink(),
              data: (list) => GridView.count(
                crossAxisCount: 4,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 0.82,
                children: list
                    .map((c) => InkWell(
                          onTap: () => openCategory(c.slug),
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Brand.surface,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Brand.line),
                            ),
                            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                              Text(_categoryIcons[c.slug] ?? '🛍️', style: const TextStyle(fontSize: 26)),
                              const SizedBox(height: 6),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: Text(c.name,
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 10.5, color: Brand.muted, height: 1.1)),
                              ),
                            ]),
                          ),
                        ))
                    .toList(),
              ),
            ),
            const SizedBox(height: 22),
            Row(children: [
              const Expanded(child: _SectionHeader('Popular near you')),
              TextButton(onPressed: () => context.go('/search'), child: const Text('See all')),
            ]),
            const SizedBox(height: 6),
            popular.when(
              loading: () => const SizedBox(height: 220, child: Center(child: CircularProgressIndicator())),
              error: (e, _) => EmptyState(icon: Icons.cloud_off_rounded, title: 'Could not load listings', subtitle: 'Pull to refresh or check Settings.'),
              data: (paged) => GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.72,
                children: paged.data.take(6).map((l) => ListingCard(listing: l)).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader(this.text);
  @override
  Widget build(BuildContext context) =>
      Text(text, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700));
}

class _CartButton extends ConsumerWidget {
  const _CartButton();
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartProvider).count;
    return IconButton(
      onPressed: () => context.push('/cart'),
      icon: count > 0
          ? Badge(label: Text('$count'), backgroundColor: Brand.ember, child: const Icon(Icons.shopping_cart_outlined))
          : const Icon(Icons.shopping_cart_outlined),
    );
  }
}
