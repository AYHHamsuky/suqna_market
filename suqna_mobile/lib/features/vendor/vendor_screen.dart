import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/theme.dart';
import '../../models/models.dart';
import '../../shared/widgets.dart';
import '../data.dart';

class VendorScreen extends ConsumerWidget {
  final String slug;
  const VendorScreen({super.key, required this.slug});

  Future<void> _chat(BuildContext context, WidgetRef ref, VendorProfile v) async {
    try {
      final res = await ref.read(apiProvider).dio.post('/conversations', data: {'vendor_id': v.id});
      final id = res.data['data']['id'] as int;
      if (context.mounted) context.push('/chat/$id', extra: v.businessName);
    } catch (e) {
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final page = ref.watch(vendorProvider(slug));
    return Scaffold(
      appBar: AppBar(title: const Text('Shop')),
      body: asyncView<VendorPage>(
        page,
        onRetry: () => ref.invalidate(vendorProvider(slug)),
        data: (p) {
          final v = p.vendor;
          return ListView(children: [
            // Banner
            SizedBox(height: 140, child: SuqImage(v.banner, width: double.infinity)),
            Transform.translate(
              offset: const Offset(0, -28),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: Brand.ember.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: Brand.surface, width: 3),
                    ),
                    alignment: Alignment.center,
                    child: Text(v.businessName.isNotEmpty ? v.businessName[0] : '?',
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: Brand.emberDark)),
                  ),
                  const Spacer(),
                  OutlinedButton.icon(
                    onPressed: () => _chat(context, ref, v),
                    icon: const Icon(Icons.chat_bubble_outline, size: 16),
                    label: const Text('Message'),
                  ),
                ]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(v.businessName, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22)),
                const SizedBox(height: 4),
                Row(children: [
                  if (v.ratingAvg > 0) StarRow(value: v.ratingAvg, count: v.ratingCount),
                  if (v.city != null) ...[const SizedBox(width: 8), Text(v.city!, style: const TextStyle(color: Brand.faint, fontSize: 12))],
                ]),
                if (v.description != null && v.description!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(v.description!, style: const TextStyle(color: Brand.muted, height: 1.4)),
                ],
                if (v.address != null && v.address!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Row(children: [
                    const Icon(Icons.location_on_outlined, size: 15, color: Brand.faint),
                    const SizedBox(width: 4),
                    Expanded(child: Text(v.address!, style: const TextStyle(color: Brand.faint, fontSize: 12))),
                  ]),
                ],
              ]),
            ),
            const Divider(),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Text('Listings (${p.listings.length})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
            if (p.listings.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Text('No listings yet.', style: TextStyle(color: Brand.muted)))
            else
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.72,
                children: p.listings.map((l) => ListingCard(listing: _withVendor(l, v))).toList(),
              ),
            if (p.reviews.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Divider(),
              const Padding(padding: EdgeInsets.fromLTRB(16, 8, 16, 8), child: Text('Reviews', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700))),
              ...p.reviews.map((r) => Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        StarRow(value: r.rating.toDouble()),
                        const SizedBox(width: 8),
                        Text(r.customerName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const Spacer(),
                        Text(dateFmt(r.createdAt), style: const TextStyle(color: Brand.faint, fontSize: 11)),
                      ]),
                      if (r.body != null && r.body!.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 4), child: Text(r.body!, style: const TextStyle(color: Brand.muted))),
                      if (r.vendorReply != null && r.vendorReply!.isNotEmpty)
                        Container(
                          margin: const EdgeInsets.only(top: 6),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: Brand.bg, borderRadius: BorderRadius.circular(8)),
                          child: Text('Vendor: ${r.vendorReply}', style: const TextStyle(fontSize: 13, color: Brand.muted)),
                        ),
                    ]),
                  )),
            ],
            const SizedBox(height: 24),
          ]);
        },
      ),
    );
  }

  Listing _withVendor(Listing l, VendorProfile v) => Listing(
        id: l.id, name: l.name, description: l.description, pricingMode: l.pricingMode,
        price: l.price, priceMin: l.priceMin, priceMax: l.priceMax, priceUnit: l.priceUnit,
        isAvailable: l.isAvailable, isFeatured: l.isFeatured, tags: l.tags, images: l.images,
        distanceKm: l.distanceKm, category: l.category, vendor: v,
      );
}
