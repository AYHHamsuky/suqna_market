import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../shared/widgets.dart';
import 'cart.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final ctrl = ref.read(cartProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Your cart'), actions: [
        if (cart.items.isNotEmpty)
          TextButton(onPressed: ctrl.clear, child: const Text('Clear')),
      ]),
      body: cart.items.isEmpty
          ? EmptyState(
              icon: Icons.shopping_cart_outlined,
              title: 'Your cart is empty',
              subtitle: 'Browse vendors and add items to get started.',
              action: ElevatedButton(onPressed: () => context.go('/search'), child: const Text('Find vendors')),
            )
          : Column(children: [
              if (cart.vendorName != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  color: Brand.surface,
                  child: Row(children: [
                    const Icon(Icons.storefront_outlined, size: 18, color: Brand.muted),
                    const SizedBox(width: 8),
                    Text(cart.vendorName!, style: const TextStyle(fontWeight: FontWeight.w600)),
                  ]),
                ),
              const Divider(height: 1),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: cart.items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    final it = cart.items[i];
                    return Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: Brand.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: Brand.line)),
                      child: Row(children: [
                        ClipRRect(borderRadius: BorderRadius.circular(10), child: SuqImage(it.image, width: 60, height: 60)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(it.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text('${naira(it.unitPrice)}${it.unit != null ? ' / ${it.unit}' : ''}', style: const TextStyle(color: Brand.emberDark, fontWeight: FontWeight.w600, fontSize: 13)),
                            const SizedBox(height: 6),
                            Row(children: [
                              _stepBtn(Icons.remove, () => ctrl.setQuantity(it.listingId, it.quantity - 1)),
                              Padding(padding: const EdgeInsets.symmetric(horizontal: 10), child: Text('${it.quantity % 1 == 0 ? it.quantity.toInt() : it.quantity}', style: const TextStyle(fontWeight: FontWeight.w600))),
                              _stepBtn(Icons.add, () => ctrl.setQuantity(it.listingId, it.quantity + 1)),
                              const Spacer(),
                              IconButton(onPressed: () => ctrl.remove(it.listingId), icon: const Icon(Icons.delete_outline, size: 20, color: Brand.faint)),
                            ]),
                          ]),
                        ),
                      ]),
                    );
                  },
                ),
              ),
              _CheckoutBar(subtotal: cart.subtotal),
            ]),
    );
  }

  Widget _stepBtn(IconData icon, VoidCallback onTap) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(border: Border.all(color: Brand.line), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, size: 16),
        ),
      );
}

class _CheckoutBar extends StatelessWidget {
  final num subtotal;
  const _CheckoutBar({required this.subtotal});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, 12 + MediaQuery.of(context).padding.bottom),
      decoration: const BoxDecoration(color: Brand.surface, border: Border(top: BorderSide(color: Brand.line))),
      child: Row(children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Subtotal', style: TextStyle(color: Brand.muted, fontSize: 12)),
          Text(naira(subtotal), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
        ]),
        const Spacer(),
        ElevatedButton(
          onPressed: () => context.push('/checkout'),
          child: const Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('Checkout')),
        ),
      ]),
    );
  }
}
