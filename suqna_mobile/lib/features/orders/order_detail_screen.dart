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

const _steps = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

Widget _statusChip(String status) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: statusColor(status).withValues(alpha: 0.14), borderRadius: BorderRadius.circular(100)),
      child: Text(status[0].toUpperCase() + status.substring(1),
          style: TextStyle(color: statusColor(status), fontSize: 11, fontWeight: FontWeight.w600)),
    );

class OrderDetailScreen extends ConsumerStatefulWidget {
  final int id;
  const OrderDetailScreen({super.key, required this.id});
  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  bool _busy = false;

  Future<void> _pay(Order o) async {
    setState(() => _busy = true);
    final api = ref.read(apiProvider);
    try {
      final init = await api.dio.post('/checkout/initiate', data: {'order_id': o.id});
      final data = Map<String, dynamic>.from(init.data['data']);
      if (data['mock'] == true) {
        await api.dio.post('/payments/verify', data: {'reference': data['reference']});
        ref.invalidate(orderProvider(widget.id));
        ref.invalidate(ordersProvider);
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment confirmed ✓')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _chat(Order o) async {
    if (o.vendor == null) return;
    try {
      final res = await ref.read(apiProvider).dio.post('/conversations', data: {'vendor_id': o.vendor!.id, 'order_id': o.id});
      final id = res.data['data']['id'] as int;
      if (mounted) context.push('/chat/$id', extra: o.vendor!.businessName);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
    }
  }

  void _reorder(Order o) {
    ref.read(cartProvider.notifier).setFromOrder(o);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Items added to your cart')));
    context.push('/cart');
  }

  Future<void> _review(Order o) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _ReviewSheet(orderId: o.id),
    );
    if (result == true) {
      ref.invalidate(orderProvider(widget.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = ref.watch(orderProvider(widget.id));
    return Scaffold(
      appBar: AppBar(title: const Text('Order')),
      body: asyncView<Order>(
        order,
        onRetry: () => ref.invalidate(orderProvider(widget.id)),
        data: (o) => _content(o),
      ),
    );
  }

  Widget _content(Order o) {
    final stepIndex = _steps.indexOf(o.status == 'dispatched' ? 'ready' : o.status);
    final cancelled = o.status == 'cancelled' || o.status == 'disputed';
    return ListView(padding: const EdgeInsets.all(16), children: [
      Row(children: [
        Expanded(child: Text(o.reference, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700))),
        _statusChip(o.status),
      ]),
      Text('${o.vendor?.businessName ?? ''} · ${dateTimeFmt(o.createdAt)}', style: const TextStyle(color: Brand.muted, fontSize: 13)),
      const SizedBox(height: 16),

      // Progress
      if (!cancelled)
        Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(color: Brand.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: Brand.line)),
          child: Row(children: [
            for (var i = 0; i < _steps.length; i++)
              Expanded(
                child: Column(children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: i <= stepIndex ? Brand.ember : Brand.bg,
                    child: Text('${i + 1}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: i <= stepIndex ? Colors.white : Brand.faint)),
                  ),
                  const SizedBox(height: 4),
                  Text(_steps[i], style: TextStyle(fontSize: 9, color: i <= stepIndex ? Brand.emberDark : Brand.faint)),
                ]),
              ),
          ]),
        ),
      const SizedBox(height: 16),

      // Items
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Brand.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: Brand.line)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Items', style: TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          ...o.items.map((it) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(children: [
                  Expanded(child: Text('${it.listingName} × ${it.quantity % 1 == 0 ? it.quantity.toInt() : it.quantity}${it.unit != null ? ' ${it.unit}' : ''}')),
                  Text(naira(it.subtotal), style: const TextStyle(fontWeight: FontWeight.w600)),
                ]),
              )),
          const Divider(),
          Row(children: [
            const Text('Total', style: TextStyle(fontWeight: FontWeight.w700)),
            const Spacer(),
            Text(naira(o.subtotal), style: const TextStyle(fontWeight: FontWeight.w700)),
          ]),
          if (o.deliveryType == 'delivery' && o.deliveryAddress != null) ...[
            const SizedBox(height: 8),
            Text('Deliver to: ${o.deliveryAddress}', style: const TextStyle(fontSize: 12, color: Brand.muted)),
          ],
        ]),
      ),
      const SizedBox(height: 16),

      // Actions
      if (o.status == 'pending')
        ElevatedButton.icon(
          onPressed: _busy ? null : () => _pay(o),
          icon: _busy ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.credit_card, size: 18),
          label: const Text('Pay now'),
          style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
        ),
      const SizedBox(height: 8),
      Row(children: [
        Expanded(child: OutlinedButton.icon(onPressed: () => _chat(o), icon: const Icon(Icons.chat_bubble_outline, size: 16), label: const Text('Message'))),
        if (o.status != 'pending') ...[
          const SizedBox(width: 8),
          Expanded(child: OutlinedButton.icon(onPressed: () => _reorder(o), icon: const Icon(Icons.refresh, size: 16), label: const Text('Reorder'))),
        ],
      ]),
      if (o.status == 'completed' && o.review == null) ...[
        const SizedBox(height: 8),
        ElevatedButton.icon(onPressed: () => _review(o), icon: const Icon(Icons.star_outline, size: 18), label: const Text('Leave a review'), style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(46))),
      ],
      if (o.review != null) ...[
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: Brand.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: Brand.line)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Your review', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            StarRow(value: o.review!.rating.toDouble()),
            if (o.review!.body != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text(o.review!.body!, style: const TextStyle(color: Brand.muted))),
          ]),
        ),
      ],
    ]);
  }
}

class _ReviewSheet extends ConsumerStatefulWidget {
  final int orderId;
  const _ReviewSheet({required this.orderId});
  @override
  ConsumerState<_ReviewSheet> createState() => _ReviewSheetState();
}

class _ReviewSheetState extends ConsumerState<_ReviewSheet> {
  int _rating = 5;
  final _body = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _body.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _busy = true);
    try {
      await ref.read(apiProvider).dio.post('/customer/reviews', data: {'order_id': widget.orderId, 'rating': _rating, 'body': _body.text.trim()});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Review submitted')));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _busy = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 20, right: 20, top: 20, bottom: 20 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Text('Rate your order', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          for (var i = 1; i <= 5; i++)
            IconButton(
              onPressed: () => setState(() => _rating = i),
              icon: Icon(i <= _rating ? Icons.star_rounded : Icons.star_border_rounded, color: Brand.gold, size: 36),
            ),
        ]),
        TextField(controller: _body, maxLines: 3, decoration: const InputDecoration(hintText: 'Share a few words (optional)')),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _busy ? null : _submit,
            child: _busy ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Submit review'),
          ),
        ),
      ]),
    );
  }
}
