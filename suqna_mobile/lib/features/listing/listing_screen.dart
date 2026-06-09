import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/theme.dart';
import '../../models/models.dart';
import '../../shared/widgets.dart';
import '../cart/cart.dart';
import '../data.dart';

class ListingDetailScreen extends ConsumerStatefulWidget {
  final int id;
  const ListingDetailScreen({super.key, required this.id});
  @override
  ConsumerState<ListingDetailScreen> createState() => _ListingDetailScreenState();
}

class _ListingDetailScreenState extends ConsumerState<ListingDetailScreen> {
  num _qty = 1;
  int _image = 0;
  bool _wished = false;
  bool _wishBusy = false;

  Future<void> _toggleWish() async {
    setState(() => _wishBusy = true);
    final api = ref.read(apiProvider);
    try {
      if (_wished) {
        await api.dio.delete('/customer/wishlist/${widget.id}');
      } else {
        await api.dio.post('/customer/wishlist/${widget.id}');
      }
      setState(() => _wished = !_wished);
      ref.invalidate(wishlistProvider);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
    } finally {
      if (mounted) setState(() => _wishBusy = false);
    }
  }

  void _addToCart(Listing l) {
    final v = l.vendor;
    if (v == null) return;
    final res = ref.read(cartProvider.notifier).add(v, l, _qty);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(res == 'replaced' ? 'Started a new cart for this vendor' : 'Added to cart'),
      action: SnackBarAction(label: 'View cart', onPressed: () => context.push('/cart')),
    ));
  }

  Future<void> _chat(Listing l) async {
    final v = l.vendor;
    if (v == null) return;
    try {
      final res = await ref.read(apiProvider).dio.post('/conversations', data: {
        'vendor_id': v.id,
        'body': 'Hi, I\'m interested in "${l.name}".',
      });
      final id = res.data['data']['id'] as int;
      if (mounted) context.push('/chat/$id', extra: v.businessName);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(listingProvider(widget.id));
    return Scaffold(
      appBar: AppBar(
        title: const Text('Details'),
        actions: [
          IconButton(
            onPressed: _wishBusy ? null : _toggleWish,
            icon: Icon(_wished ? Icons.favorite : Icons.favorite_border, color: _wished ? Brand.ember : null),
          ),
        ],
      ),
      body: asyncView<ListingDetail>(
        detail,
        onRetry: () => ref.invalidate(listingProvider(widget.id)),
        data: (d) => _content(d.listing, d.more),
      ),
    );
  }

  Widget _content(Listing l, List<Listing> more) {
    final v = l.vendor;
    final canOrder = l.pricingMode != 'ask' && l.isAvailable;
    return ListView(children: [
      // Gallery
      if (l.images.isNotEmpty)
        SizedBox(
          height: 280,
          child: Stack(children: [
            PageView(
              onPageChanged: (i) => setState(() => _image = i),
              children: [for (final img in l.images) SuqImage(img, width: double.infinity)],
            ),
            if (l.images.length > 1)
              Positioned(
                bottom: 10,
                left: 0,
                right: 0,
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  for (var i = 0; i < l.images.length; i++)
                    Container(
                      width: 7,
                      height: 7,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(shape: BoxShape.circle, color: i == _image ? Brand.ember : Colors.white70),
                    ),
                ]),
              ),
          ]),
        )
      else
        const SizedBox(height: 200, child: SuqImage(null, width: double.infinity)),

      Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: Text(l.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22))),
            if (l.category != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Brand.bg, borderRadius: BorderRadius.circular(100), border: Border.all(color: Brand.line)),
                child: Text(l.category!.name, style: const TextStyle(fontSize: 11, color: Brand.muted)),
              ),
          ]),
          const SizedBox(height: 8),
          Text(priceLabel(l), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Brand.emberDark)),
          if (!l.isAvailable) const Padding(padding: EdgeInsets.only(top: 4), child: Text('Currently unavailable', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w500))),
          if (l.description != null && l.description!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(l.description!, style: const TextStyle(color: Brand.muted, height: 1.5)),
          ],
          if (l.tags.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(spacing: 6, runSpacing: 6, children: [
              for (final t in l.tags)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: Brand.bg, borderRadius: BorderRadius.circular(100), border: Border.all(color: Brand.line)),
                  child: Text('#$t', style: const TextStyle(fontSize: 11, color: Brand.faint)),
                ),
            ]),
          ],
          const SizedBox(height: 20),

          // Order controls
          if (canOrder)
            Row(children: [
              _QtyStepper(qty: _qty, unit: l.priceUnit, onChanged: (q) => setState(() => _qty = q)),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _addToCart(l),
                  icon: const Icon(Icons.add_shopping_cart, size: 18),
                  label: const Text('Add to cart'),
                ),
              ),
            ])
          else if (l.pricingMode == 'ask')
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFFFFF7E6), borderRadius: BorderRadius.circular(10)),
              child: const Text('This item is negotiable. Chat with the vendor to agree a price.', style: TextStyle(color: Color(0xFF92651A))),
            ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => _chat(l),
            icon: const Icon(Icons.chat_bubble_outline, size: 18),
            label: const Text('Chat with vendor'),
            style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
          ),

          // Vendor card
          if (v != null) ...[
            const SizedBox(height: 20),
            InkWell(
              onTap: () => v.slug != null ? context.push('/vendor/${v.slug}') : null,
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Brand.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: Brand.line)),
                child: Row(children: [
                  CircleAvatar(radius: 24, backgroundColor: Brand.ember.withValues(alpha: 0.15), child: Text(v.businessName.isNotEmpty ? v.businessName[0] : '?', style: const TextStyle(color: Brand.emberDark, fontWeight: FontWeight.w700, fontSize: 18))),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(v.businessName, style: const TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Row(children: [
                        if (v.ratingAvg > 0) StarRow(value: v.ratingAvg, count: v.ratingCount),
                        if (l.distanceKm != null) ...[const SizedBox(width: 8), Text(km(l.distanceKm) ?? '', style: const TextStyle(fontSize: 12, color: Brand.faint))],
                      ]),
                    ]),
                  ),
                  const Icon(Icons.chevron_right, color: Brand.faint),
                ]),
              ),
            ),
          ],

          // More from vendor
          if (more.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text('More from ${v?.businessName ?? 'this vendor'}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            SizedBox(
              height: 210,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: more.length,
                separatorBuilder: (_, _) => const SizedBox(width: 12),
                itemBuilder: (_, i) => SizedBox(width: 150, child: ListingCard(listing: more[i].vendor == null ? _withVendor(more[i], v) : more[i])),
              ),
            ),
          ],
        ]),
      ),
    ]);
  }

  Listing _withVendor(Listing l, VendorProfile? v) => Listing(
        id: l.id, name: l.name, description: l.description, pricingMode: l.pricingMode,
        price: l.price, priceMin: l.priceMin, priceMax: l.priceMax, priceUnit: l.priceUnit,
        isAvailable: l.isAvailable, isFeatured: l.isFeatured, tags: l.tags, images: l.images,
        distanceKm: l.distanceKm, category: l.category, vendor: v,
      );
}

class _QtyStepper extends StatelessWidget {
  final num qty;
  final String? unit;
  final ValueChanged<num> onChanged;
  const _QtyStepper({required this.qty, this.unit, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(100), border: Border.all(color: Brand.line)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        IconButton(onPressed: qty > 1 ? () => onChanged(qty - 1) : null, icon: const Icon(Icons.remove, size: 18)),
        Text('${qty % 1 == 0 ? qty.toInt() : qty}', style: const TextStyle(fontWeight: FontWeight.w600)),
        IconButton(onPressed: () => onChanged(qty + 1), icon: const Icon(Icons.add, size: 18)),
      ]),
    );
  }
}
