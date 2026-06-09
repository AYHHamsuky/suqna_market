import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/api.dart';
import '../models/models.dart';

List<Map<String, dynamic>> _asList(dynamic data) {
  final raw = (data is Map && data['data'] != null) ? data['data'] : data;
  if (raw is List) return raw.map((e) => Map<String, dynamic>.from(e)).toList();
  return const [];
}

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final res = await ref.read(apiProvider).dio.get('/categories');
  return _asList(res.data).map(Category.fromJson).toList();
});

/// Search/filter args for the listings query.
class SearchArgs {
  final String q;
  final String? category;
  final String sort; // relevance | price | distance | rating
  final num? maxPrice;
  final double? lat;
  final double? lng;
  final double radiusKm;

  const SearchArgs({
    this.q = '',
    this.category,
    this.sort = 'relevance',
    this.maxPrice,
    this.lat,
    this.lng,
    this.radiusKm = 15,
  });

  Map<String, dynamic> toQuery() => {
        if (q.isNotEmpty) 'q': q,
        if (category != null) 'category': category,
        'sort': sort,
        if (maxPrice != null) 'price_max': maxPrice,
        if (lat != null) 'lat': lat,
        if (lng != null) 'lng': lng,
        if (lat != null) 'radius_km': radiusKm,
        'per_page': 30,
      };

  @override
  bool operator ==(Object other) =>
      other is SearchArgs &&
      other.q == q &&
      other.category == category &&
      other.sort == sort &&
      other.maxPrice == maxPrice &&
      other.lat == lat &&
      other.lng == lng &&
      other.radiusKm == radiusKm;

  @override
  int get hashCode => Object.hash(q, category, sort, maxPrice, lat, lng, radiusKm);
}

final listingsProvider =
    FutureProvider.family<Paged<Listing>, SearchArgs>((ref, args) async {
  final res = await ref.read(apiProvider).dio.get('/listings', queryParameters: args.toQuery());
  return Paged.fromJson(Map<String, dynamic>.from(res.data), Listing.fromJson);
});

class ListingDetail {
  final Listing listing;
  final List<Listing> more;
  ListingDetail(this.listing, this.more);
}

final listingProvider = FutureProvider.family<ListingDetail, int>((ref, id) async {
  final res = await ref.read(apiProvider).dio.get('/listings/$id');
  final listing = Listing.fromJson(Map<String, dynamic>.from(res.data['data']));
  final more = (res.data['more_from_vendor'] as List? ?? [])
      .map((e) => Listing.fromJson(Map<String, dynamic>.from(e)))
      .toList();
  return ListingDetail(listing, more);
});

class VendorPage {
  final VendorProfile vendor;
  final List<Listing> listings;
  final List<Review> reviews;
  VendorPage(this.vendor, this.listings, this.reviews);
}

final vendorProvider = FutureProvider.family<VendorPage, String>((ref, slug) async {
  final api = ref.read(apiProvider);
  final v = await api.dio.get('/vendors/$slug');
  final l = await api.dio.get('/vendors/$slug/listings');
  final r = await api.dio.get('/vendors/$slug/reviews');
  return VendorPage(
    VendorProfile.fromJson(Map<String, dynamic>.from(v.data['data'] ?? v.data)),
    _asList(l.data).map(Listing.fromJson).toList(),
    _asList(r.data).map(Review.fromJson).toList(),
  );
});

final ordersProvider = FutureProvider<List<Order>>((ref) async {
  final res = await ref.read(apiProvider).dio.get('/customer/orders');
  return _asList(res.data).map(Order.fromJson).toList();
});

final orderProvider = FutureProvider.family<Order, int>((ref, id) async {
  final res = await ref.read(apiProvider).dio.get('/customer/orders/$id');
  return Order.fromJson(Map<String, dynamic>.from(res.data['data']));
});

final wishlistProvider = FutureProvider<List<Listing>>((ref) async {
  final res = await ref.read(apiProvider).dio.get('/customer/wishlist');
  return _asList(res.data).map(Listing.fromJson).toList();
});

final conversationsProvider = FutureProvider<List<Conversation>>((ref) async {
  final res = await ref.read(apiProvider).dio.get('/conversations');
  return _asList(res.data).map(Conversation.fromJson).toList();
});
