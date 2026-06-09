import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/api.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models/models.dart';

/// Network image that resolves relative storage paths and degrades gracefully.
class SuqImage extends ConsumerWidget {
  final String? path;
  final double? width;
  final double? height;
  final BoxFit fit;
  const SuqImage(this.path, {super.key, this.width, this.height, this.fit = BoxFit.cover});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final url = ref.read(apiProvider).imageUrl(path);
    final placeholder = Container(
      width: width,
      height: height,
      color: Brand.bg,
      child: const Icon(Icons.image_outlined, color: Brand.line, size: 36),
    );
    if (url == null) return placeholder;
    return CachedNetworkImage(
      imageUrl: url,
      width: width,
      height: height,
      fit: fit,
      placeholder: (_, _) => Container(width: width, height: height, color: Brand.bg),
      errorWidget: (_, _, _) => placeholder,
    );
  }
}

class StarRow extends StatelessWidget {
  final double value;
  final int? count;
  final double size;
  const StarRow({super.key, required this.value, this.count, this.size = 14});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(Icons.star_rounded, size: size + 2, color: Brand.gold),
      const SizedBox(width: 2),
      Text(value.toStringAsFixed(1),
          style: TextStyle(fontSize: size, fontWeight: FontWeight.w600, color: Brand.ink)),
      if (count != null)
        Text('  ($count)', style: TextStyle(fontSize: size - 1, color: Brand.faint)),
    ]);
  }
}

class PriceBadge extends StatelessWidget {
  final Listing listing;
  const PriceBadge(this.listing, {super.key});
  @override
  Widget build(BuildContext context) => Text(priceLabel(listing),
      style: const TextStyle(fontWeight: FontWeight.w700, color: Brand.emberDark, fontSize: 15));
}

/// Compact listing card used in grids and lists.
class ListingCard extends StatelessWidget {
  final Listing listing;
  final String? badge;
  const ListingCard({super.key, required this.listing, this.badge});

  @override
  Widget build(BuildContext context) {
    final v = listing.vendor;
    return InkWell(
      onTap: () => context.push('/listing/${listing.id}'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Brand.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Brand.line),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Stack(children: [
            AspectRatio(
              aspectRatio: 4 / 3,
              child: SuqImage(listing.images.isNotEmpty ? listing.images.first : null,
                  width: double.infinity),
            ),
            if (badge != null)
              Positioned(
                left: 8,
                top: 8,
                child: _chip(badge!, Brand.emberDark.withValues(alpha: 0.92), Colors.white),
              ),
            if (listing.isFeatured)
              Positioned(
                right: 8,
                top: 8,
                child: _chip('Featured', Brand.ember, Colors.white),
              ),
          ]),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(listing.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              PriceBadge(listing),
              if (v != null) ...[
                const SizedBox(height: 6),
                Row(children: [
                  Expanded(
                    child: Text(v.businessName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: Brand.muted)),
                  ),
                  if (v.ratingAvg > 0) ...[
                    const Icon(Icons.star_rounded, size: 13, color: Brand.gold),
                    Text(v.ratingAvg.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 12, color: Brand.muted)),
                  ],
                ]),
                if (listing.distanceKm != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Row(children: [
                      const Icon(Icons.location_on_outlined, size: 12, color: Brand.faint),
                      Text(' ${km(listing.distanceKm)}',
                          style: const TextStyle(fontSize: 11, color: Brand.faint)),
                    ]),
                  ),
              ],
            ]),
          ),
        ]),
      ),
    );
  }

  static Widget _chip(String text, Color bg, Color fg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(100)),
        child: Text(text,
            style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.w600)),
      );
}

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;
  const EmptyState({super.key, required this.icon, required this.title, this.subtitle, this.action});

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 44, color: Brand.line),
            const SizedBox(height: 12),
            Text(title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.w600, color: Brand.muted)),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(subtitle!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 13, color: Brand.faint)),
            ],
            if (action != null) ...[const SizedBox(height: 16), action!],
          ]),
        ),
      );
}

/// Render an AsyncValue with consistent loading/error states.
Widget asyncView<T>(
  AsyncValue<T> value, {
  required Widget Function(T data) data,
  VoidCallback? onRetry,
}) {
  return value.when(
    loading: () => const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator())),
    error: (e, _) => Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.cloud_off_rounded, size: 40, color: Brand.faint),
          const SizedBox(height: 10),
          Text(apiError(e), textAlign: TextAlign.center, style: const TextStyle(color: Brand.muted)),
          if (onRetry != null) ...[
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ]),
      ),
    ),
    data: data,
  );
}
