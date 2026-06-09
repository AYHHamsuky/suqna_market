import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../shared/widgets.dart';
import '../data.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('My orders')),
      body: asyncView<dynamic>(
        orders,
        onRetry: () => ref.invalidate(ordersProvider),
        data: (list) {
          if (list.isEmpty) {
            return EmptyState(
              icon: Icons.receipt_long_outlined,
              title: 'No orders yet',
              subtitle: 'When you order from a vendor, it shows up here.',
              action: ElevatedButton(onPressed: () => context.go('/search'), child: const Text('Start shopping')),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(ordersProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: list.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (_, i) {
                final o = list[i];
                return InkWell(
                  onTap: () => context.push('/order/${o.id}'),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: Brand.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: Brand.line)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Expanded(child: Text(o.vendor?.businessName ?? 'Order', style: const TextStyle(fontWeight: FontWeight.w700))),
                        _statusChip(o.status),
                      ]),
                      const SizedBox(height: 4),
                      Text(o.reference, style: const TextStyle(color: Brand.faint, fontSize: 12)),
                      const SizedBox(height: 8),
                      Row(children: [
                        Text('${o.items.length} item${o.items.length == 1 ? '' : 's'}', style: const TextStyle(color: Brand.muted, fontSize: 13)),
                        const Spacer(),
                        Text(naira(o.subtotal), style: const TextStyle(fontWeight: FontWeight.w700)),
                      ]),
                      const SizedBox(height: 4),
                      Text(dateTimeFmt(o.createdAt), style: const TextStyle(color: Brand.faint, fontSize: 11)),
                    ]),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

Widget _statusChip(String status) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: statusColor(status).withValues(alpha: 0.14), borderRadius: BorderRadius.circular(100)),
      child: Text(status[0].toUpperCase() + status.substring(1),
          style: TextStyle(color: statusColor(status), fontSize: 11, fontWeight: FontWeight.w600)),
    );
