import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/models.dart';
import '../auth/session.dart';

class CartItem {
  final int listingId;
  final String name;
  final num unitPrice;
  final String? unit;
  final String pricingMode;
  final String? image;
  num quantity;

  CartItem({
    required this.listingId,
    required this.name,
    required this.unitPrice,
    this.unit,
    this.pricingMode = 'fixed',
    this.image,
    this.quantity = 1,
  });

  num get lineTotal => unitPrice * quantity;

  Map<String, dynamic> toJson() => {
        'listing_id': listingId,
        'name': name,
        'unit_price': unitPrice,
        'unit': unit,
        'pricing_mode': pricingMode,
        'image': image,
        'quantity': quantity,
      };

  factory CartItem.fromJson(Map<String, dynamic> j) => CartItem(
        listingId: j['listing_id'],
        name: j['name'],
        unitPrice: j['unit_price'],
        unit: j['unit'],
        pricingMode: j['pricing_mode'] ?? 'fixed',
        image: j['image'],
        quantity: j['quantity'] ?? 1,
      );
}

class CartState {
  final int? vendorId;
  final String? vendorName;
  final String? vendorSlug;
  final List<CartItem> items;
  const CartState({this.vendorId, this.vendorName, this.vendorSlug, this.items = const []});

  num get subtotal => items.fold<num>(0, (s, i) => s + i.lineTotal);
  int get count => items.length;

  Map<String, dynamic> toJson() => {
        'vendor_id': vendorId,
        'vendor_name': vendorName,
        'vendor_slug': vendorSlug,
        'items': items.map((e) => e.toJson()).toList(),
      };

  factory CartState.fromJson(Map<String, dynamic> j) => CartState(
        vendorId: j['vendor_id'],
        vendorName: j['vendor_name'],
        vendorSlug: j['vendor_slug'],
        items: (j['items'] as List? ?? [])
            .map((e) => CartItem.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
      );
}

final cartProvider = NotifierProvider<CartController, CartState>(CartController.new);

class CartController extends Notifier<CartState> {
  static const _key = 'cart';

  @override
  CartState build() {
    final raw = ref.read(prefsProvider).getString(_key);
    if (raw != null) {
      try {
        return CartState.fromJson(Map<String, dynamic>.from(jsonDecode(raw)));
      } catch (_) {}
    }
    return const CartState();
  }

  void _save() => ref.read(prefsProvider).setString(_key, jsonEncode(state.toJson()));

  /// Returns 'replaced' if a different vendor's cart was cleared, else 'added'.
  String add(VendorProfile vendor, Listing listing, [num qty = 1]) {
    final price = (listing.pricingMode == 'range' ? listing.priceMin : listing.price) ??
        listing.priceMin ??
        0;
    final item = CartItem(
      listingId: listing.id,
      name: listing.name,
      unitPrice: price,
      unit: listing.priceUnit,
      pricingMode: listing.pricingMode,
      image: listing.images.isNotEmpty ? listing.images.first : null,
      quantity: qty,
    );

    if (state.vendorId != null && state.vendorId != vendor.id) {
      state = CartState(
          vendorId: vendor.id,
          vendorName: vendor.businessName,
          vendorSlug: vendor.slug,
          items: [item]);
      _save();
      return 'replaced';
    }

    final items = [...state.items];
    final idx = items.indexWhere((i) => i.listingId == listing.id);
    if (idx >= 0) {
      items[idx].quantity += qty;
    } else {
      items.add(item);
    }
    state = CartState(
        vendorId: vendor.id,
        vendorName: vendor.businessName,
        vendorSlug: vendor.slug,
        items: items);
    _save();
    return 'added';
  }

  /// Replace the whole cart from a past order (Reorder).
  void setFromOrder(Order order) {
    final v = order.vendor;
    if (v == null) return;
    final items = order.items
        .map((it) => CartItem(
              listingId: it.listingId ?? 0,
              name: it.listingName,
              unitPrice: it.unitPrice,
              unit: it.unit,
              quantity: it.quantity,
            ))
        .toList();
    state = CartState(
        vendorId: v.id, vendorName: v.businessName, vendorSlug: v.slug, items: items);
    _save();
  }

  void setQuantity(int listingId, num qty) {
    final items = [...state.items];
    final idx = items.indexWhere((i) => i.listingId == listingId);
    if (idx >= 0) {
      items[idx].quantity = qty < 0.001 ? 0.001 : qty;
      state = CartState(
          vendorId: state.vendorId,
          vendorName: state.vendorName,
          vendorSlug: state.vendorSlug,
          items: items);
      _save();
    }
  }

  void remove(int listingId) {
    final items = state.items.where((i) => i.listingId != listingId).toList();
    state = items.isEmpty
        ? const CartState()
        : CartState(
            vendorId: state.vendorId,
            vendorName: state.vendorName,
            vendorSlug: state.vendorSlug,
            items: items);
    _save();
  }

  void clear() {
    state = const CartState();
    _save();
  }
}
