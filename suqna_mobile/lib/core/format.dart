import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'theme.dart';
import '../models/models.dart';

final _naira = NumberFormat.currency(locale: 'en_NG', symbol: '₦', decimalDigits: 0);

String naira(num? n) => _naira.format(n ?? 0);

String? km(num? n) {
  if (n == null) return null;
  return n < 10 ? '${n.toStringAsFixed(1)} km' : '${n.toStringAsFixed(0)} km';
}

String dateFmt(DateTime? d) => d == null ? '' : DateFormat('d MMM y').format(d.toLocal());
String dateTimeFmt(DateTime? d) => d == null ? '' : DateFormat('d MMM, HH:mm').format(d.toLocal());

/// Price label honouring the listing's pricing mode (mirrors the web).
String priceLabel(Listing l) {
  final u = (l.priceUnit != null && l.priceUnit!.isNotEmpty) ? ' / ${l.priceUnit}' : '';
  switch (l.pricingMode) {
    case 'fixed':
      return '${naira(l.price)}$u';
    case 'range':
      return '${naira(l.priceMin)} – ${naira(l.priceMax)}$u';
    case 'per_unit':
      return '${naira(l.price)}$u';
    case 'ask':
      return 'Ask vendor';
    default:
      return naira(l.price);
  }
}

/// Colour for an order status chip.
Color statusColor(String status) {
  switch (status) {
    case 'pending':
      return Brand.gold;
    case 'confirmed':
    case 'preparing':
      return const Color(0xFF2563EB);
    case 'ready':
    case 'dispatched':
      return const Color(0xFF7C3AED);
    case 'completed':
      return const Color(0xFF16A34A);
    case 'cancelled':
    case 'disputed':
      return const Color(0xFFDC2626);
    default:
      return Brand.muted;
  }
}
