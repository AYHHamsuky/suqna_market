import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/theme.dart';
import '../../shared/widgets.dart';
import '../data.dart';

/// Current search/filter state, shared so Home can deep-link into a category.
final searchArgsProvider = StateProvider<SearchArgs>((ref) => const SearchArgs());

// Kaduna city centre — fallback map centre when we have no GPS fix.
const _kaduna = LatLng(10.5167, 7.4333);

class MapVendor {
  final String slug;
  final String name;
  final double lat;
  final double lng;
  final double rating;
  final double? distanceKm;
  final String? topItem;
  MapVendor(this.slug, this.name, this.lat, this.lng, this.rating, this.distanceKm, this.topItem);
}

final _mapVendorsProvider = FutureProvider.family<List<MapVendor>, SearchArgs>((ref, args) async {
  final res = await ref.read(apiProvider).dio.get('/vendors/map', queryParameters: {
    'lat': args.lat ?? _kaduna.latitude,
    'lng': args.lng ?? _kaduna.longitude,
    'radius_km': args.radiusKm,
    if (args.q.isNotEmpty) 'q': args.q,
  });
  final raw = (res.data is Map && res.data['data'] != null) ? res.data['data'] : res.data;
  final list = <MapVendor>[];
  if (raw is List) {
    for (final v in raw) {
      final lat = num.tryParse('${v['latitude']}')?.toDouble();
      final lng = num.tryParse('${v['longitude']}')?.toDouble();
      if (lat == null || lng == null) continue;
      list.add(MapVendor(
        v['slug'] ?? '',
        v['business_name'] ?? '',
        lat,
        lng,
        num.tryParse('${v['rating_avg']}')?.toDouble() ?? 0,
        num.tryParse('${v['distance_km']}')?.toDouble(),
        v['top_listing'] is Map ? v['top_listing']['name'] : null,
      ));
    }
  }
  return list;
});

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});
  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  bool _mapView = false;
  bool _locating = false;

  @override
  void initState() {
    super.initState();
    _controller.text = ref.read(searchArgsProvider).q;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  SearchArgs get _args => ref.read(searchArgsProvider);
  void _update(SearchArgs a) => ref.read(searchArgsProvider.notifier).state = a;

  Future<void> _useLocation() async {
    setState(() => _locating = true);
    try {
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        throw 'Location permission denied';
      }
      final pos = await Geolocator.getCurrentPosition();
      _update(SearchArgs(
        q: _args.q, category: _args.category, sort: 'distance',
        maxPrice: _args.maxPrice, lat: pos.latitude, lng: pos.longitude, radiusKm: _args.radiusKm,
      ));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final args = ref.watch(searchArgsProvider);
    final cats = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 12,
        title: TextField(
          controller: _controller,
          textInputAction: TextInputAction.search,
          onSubmitted: (v) => _update(SearchArgs(
            q: v.trim(), category: args.category, sort: args.sort,
            maxPrice: args.maxPrice, lat: args.lat, lng: args.lng, radiusKm: args.radiusKm,
          )),
          decoration: InputDecoration(
            hintText: 'Search items, services…',
            prefixIcon: const Icon(Icons.search, size: 20),
            isDense: true,
            suffixIcon: _controller.text.isEmpty
                ? null
                : IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: () {
                      _controller.clear();
                      _update(SearchArgs(
                        category: args.category, sort: args.sort, maxPrice: args.maxPrice,
                        lat: args.lat, lng: args.lng, radiusKm: args.radiusKm));
                    },
                  ),
          ),
        ),
        actions: [
          IconButton(
            tooltip: _mapView ? 'List view' : 'Map view',
            icon: Icon(_mapView ? Icons.view_list_rounded : Icons.map_rounded),
            onPressed: () => setState(() => _mapView = !_mapView),
          ),
        ],
      ),
      body: Column(children: [
        // Filter row
        SizedBox(
          height: 50,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            children: [
              _FilterChip(
                label: _locating ? 'Locating…' : (args.lat != null ? 'Near me ✓' : 'Near me'),
                selected: args.lat != null,
                icon: Icons.my_location,
                onTap: _useLocation,
              ),
              const SizedBox(width: 8),
              // Sort
              PopupMenuButton<String>(
                initialValue: args.sort,
                onSelected: (v) => _update(SearchArgs(
                  q: args.q, category: args.category, sort: v, maxPrice: args.maxPrice,
                  lat: args.lat, lng: args.lng, radiusKm: args.radiusKm)),
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'relevance', child: Text('Relevance')),
                  PopupMenuItem(value: 'price', child: Text('Cheapest')),
                  PopupMenuItem(value: 'distance', child: Text('Nearest')),
                  PopupMenuItem(value: 'rating', child: Text('Top rated')),
                ],
                child: _chipBox(Icons.sort, 'Sort: ${args.sort}'),
              ),
              const SizedBox(width: 8),
              // Category quick filters
              ...cats.maybeWhen(
                data: (list) => list.map((c) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _FilterChip(
                        label: c.name,
                        selected: args.category == c.slug,
                        onTap: () => _update(SearchArgs(
                          q: args.q,
                          category: args.category == c.slug ? null : c.slug,
                          sort: args.sort, maxPrice: args.maxPrice,
                          lat: args.lat, lng: args.lng, radiusKm: args.radiusKm)),
                      ),
                    )),
                orElse: () => const [],
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(child: _mapView ? _MapResults(args: args) : _ListResults(args: args)),
      ]),
    );
  }

  Widget _chipBox(IconData icon, String label) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Brand.surface,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(color: Brand.line),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 15, color: Brand.muted),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontSize: 13, color: Brand.muted)),
        ]),
      );
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final IconData? icon;
  final VoidCallback onTap;
  const _FilterChip({required this.label, required this.selected, this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 9),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? Brand.ember.withValues(alpha: 0.12) : Brand.surface,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(color: selected ? Brand.ember : Brand.line),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (icon != null) ...[Icon(icon, size: 15, color: selected ? Brand.emberDark : Brand.muted), const SizedBox(width: 6)],
          Text(label, style: TextStyle(fontSize: 13, color: selected ? Brand.emberDark : Brand.muted, fontWeight: selected ? FontWeight.w600 : FontWeight.w400)),
        ]),
      ),
    );
  }
}

class _ListResults extends ConsumerWidget {
  final SearchArgs args;
  const _ListResults({required this.args});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(listingsProvider(args));
    return asyncView<dynamic>(
      result,
      onRetry: () => ref.invalidate(listingsProvider(args)),
      data: (paged) {
        if (paged.data.isEmpty) {
          return const EmptyState(icon: Icons.search_off_rounded, title: 'No results', subtitle: 'Try another word, or widen the filters.');
        }
        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(listingsProvider(args)),
          child: GridView.count(
            crossAxisCount: 2,
            padding: const EdgeInsets.all(12),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.7,
            children: [
              for (var i = 0; i < paged.data.length; i++)
                ListingCard(
                  listing: paged.data[i],
                  badge: _badgeFor(args.sort, i),
                ),
            ],
          ),
        );
      },
    );
  }

  String? _badgeFor(String sort, int i) {
    if (i != 0) return null;
    if (sort == 'price') return 'Cheapest';
    if (sort == 'distance') return 'Closest';
    if (sort == 'rating') return 'Top rated';
    return null;
  }
}

class _MapResults extends ConsumerWidget {
  final SearchArgs args;
  const _MapResults({required this.args});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vendors = ref.watch(_mapVendorsProvider(args));
    final center = args.lat != null ? LatLng(args.lat!, args.lng!) : _kaduna;
    return asyncView<List<MapVendor>>(
      vendors,
      onRetry: () => ref.invalidate(_mapVendorsProvider(args)),
      data: (list) => FlutterMap(
        options: MapOptions(initialCenter: center, initialZoom: 12.5),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'ng.suqna.suqna_mobile',
          ),
          MarkerLayer(markers: [
            if (args.lat != null)
              Marker(
                point: center,
                width: 22,
                height: 22,
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                ),
              ),
            for (final v in list)
              Marker(
                point: LatLng(v.lat, v.lng),
                width: 160,
                height: 64,
                child: GestureDetector(
                  onTap: () => _showVendor(context, v),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.location_on, color: Brand.ember, size: 32),
                  ]),
                ),
              ),
          ]),
        ],
      ),
    );
  }

  void _showVendor(BuildContext context, MapVendor v) {
    showModalBottomSheet(
      context: context,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(v.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Row(children: [
            if (v.rating > 0) StarRow(value: v.rating),
            if (v.distanceKm != null) ...[const SizedBox(width: 10), Text(km(v.distanceKm) ?? '', style: const TextStyle(color: Brand.muted))],
          ]),
          if (v.topItem != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text('Top item: ${v.topItem}', style: const TextStyle(color: Brand.muted))),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                context.push('/vendor/${v.slug}');
              },
              child: const Text('View shop'),
            ),
          ),
        ]),
      ),
    );
  }
}
