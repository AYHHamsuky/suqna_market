import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/theme.dart';
import '../data.dart';
import 'cart.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String _delivery = 'pickup';
  final _address = TextEditingController();
  final _notes = TextEditingController();
  bool _busy = false;
  String _stage = '';

  @override
  void dispose() {
    _address.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    final cart = ref.read(cartProvider);
    if (cart.items.isEmpty) return;
    if (_delivery == 'delivery' && _address.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter a delivery address.')));
      return;
    }
    setState(() {
      _busy = true;
      _stage = 'Creating order…';
    });
    final api = ref.read(apiProvider);
    try {
      // 1. Create order
      final orderRes = await api.dio.post('/customer/orders', data: {
        'items': cart.items.map((i) => {'listing_id': i.listingId, 'quantity': i.quantity}).toList(),
        'delivery_type': _delivery,
        if (_delivery == 'delivery') 'delivery_address': _address.text.trim(),
        if (_notes.text.trim().isNotEmpty) 'notes': _notes.text.trim(),
      });
      final orderId = orderRes.data['data']['id'] as int;

      // 2. Initiate payment
      setState(() => _stage = 'Starting payment…');
      final initRes = await api.dio.post('/checkout/initiate', data: {'order_id': orderId});
      final data = Map<String, dynamic>.from(initRes.data['data']);
      final isMock = data['mock'] == true;
      final reference = data['reference'] as String;

      if (isMock) {
        // 3a. Mock: confirm + verify
        final ok = await _confirmSandbox(cart.subtotal);
        if (ok != true) {
          setState(() => _busy = false);
          return;
        }
        setState(() => _stage = 'Confirming payment…');
        await api.dio.post('/payments/verify', data: {'reference': reference});
      } else {
        // 3b. Real gateway: open the checkout URL
        final url = data['authorization_url'] as String;
        await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      }

      ref.read(cartProvider.notifier).clear();
      ref.invalidate(ordersProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order placed 🎉')));
        context.pushReplacement('/order/$orderId');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _busy = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiError(e))));
      }
    }
  }

  Future<bool?> _confirmSandbox(num amount) {
    return showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Sandbox payment'),
        content: Text('Pay ${naira(amount)} using the test gateway? No real money is charged.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: Text('Pay ${naira(amount)}')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: cart.items.isEmpty
          ? const Center(child: Text('Your cart is empty.'))
          : ListView(padding: const EdgeInsets.all(16), children: [
              const Text('Delivery method', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: _option('pickup', 'Pickup', Icons.storefront_outlined)),
                const SizedBox(width: 10),
                Expanded(child: _option('delivery', 'Delivery', Icons.delivery_dining_outlined)),
              ]),
              if (_delivery == 'delivery') ...[
                const SizedBox(height: 14),
                TextField(controller: _address, decoration: const InputDecoration(labelText: 'Delivery address')),
              ],
              const SizedBox(height: 14),
              TextField(controller: _notes, maxLines: 2, decoration: const InputDecoration(labelText: 'Notes for the vendor (optional)')),
              const SizedBox(height: 20),
              // Summary
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Brand.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: Brand.line)),
                child: Column(children: [
                  ...cart.items.map((it) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(children: [
                          Expanded(child: Text('${it.name} × ${it.quantity % 1 == 0 ? it.quantity.toInt() : it.quantity}')),
                          Text(naira(it.lineTotal), style: const TextStyle(fontWeight: FontWeight.w600)),
                        ]),
                      )),
                  const Divider(),
                  Row(children: [
                    const Text('Total', style: TextStyle(fontWeight: FontWeight.w700)),
                    const Spacer(),
                    Text(naira(cart.subtotal), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
                  ]),
                ]),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _busy ? null : _placeOrder,
                style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
                child: _busy
                    ? Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                        const SizedBox(width: 10),
                        Text(_stage),
                      ])
                    : Text('Pay ${naira(cart.subtotal)}'),
              ),
            ]),
    );
  }

  Widget _option(String value, String label, IconData icon) {
    final sel = _delivery == value;
    return GestureDetector(
      onTap: () => setState(() => _delivery = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: sel ? Brand.ember.withValues(alpha: 0.10) : Brand.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: sel ? Brand.ember : Brand.line, width: sel ? 1.5 : 1),
        ),
        child: Column(children: [
          Icon(icon, color: sel ? Brand.emberDark : Brand.muted),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: sel ? Brand.emberDark : Brand.muted)),
        ]),
      ),
    );
  }
}
