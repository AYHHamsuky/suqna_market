import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/auth/session.dart';
import '../features/cart/cart_screen.dart';
import '../features/cart/checkout_screen.dart';
import '../features/home/home_screen.dart';
import '../features/landing/landing_screen.dart';
import '../features/listing/listing_screen.dart';
import '../features/messages/chat_screen.dart';
import '../features/messages/conversations_screen.dart';
import '../features/orders/order_detail_screen.dart';
import '../features/orders/orders_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/profile/settings_screen.dart';
import '../features/search/search_screen.dart';
import '../features/vendor/vendor_screen.dart';
import '../features/wishlist/wishlist_screen.dart';
import 'shell.dart';

final _rootKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier(0);
  ref.listen(sessionProvider, (_, _) => refresh.value++);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (context, state) {
      final authed = ref.read(sessionProvider).isAuthed;
      final loc = state.matchedLocation;
      const guestRoutes = {'/welcome', '/login', '/register'};
      final onGuest = guestRoutes.contains(loc);
      if (!authed && !onGuest) return '/welcome';
      if (authed && onGuest) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/welcome', builder: (c, s) => const LandingScreen()),
      GoRoute(path: '/login', builder: (c, s) => const LoginScreen()),
      GoRoute(path: '/register', builder: (c, s) => const RegisterScreen()),

      // Bottom-tab shell
      StatefulShellRoute.indexedStack(
        builder: (c, s, shell) => HomeShell(shell: shell),
        branches: [
          StatefulShellBranch(routes: [GoRoute(path: '/', builder: (c, s) => const HomeScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/search', builder: (c, s) => const SearchScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/messages', builder: (c, s) => const ConversationsScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/orders', builder: (c, s) => const OrdersScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/profile', builder: (c, s) => const ProfileScreen())]),
        ],
      ),

      // Detail / flow routes (pushed over the shell)
      GoRoute(parentNavigatorKey: _rootKey, path: '/listing/:id', builder: (c, s) => ListingDetailScreen(id: int.parse(s.pathParameters['id']!))),
      GoRoute(parentNavigatorKey: _rootKey, path: '/vendor/:slug', builder: (c, s) => VendorScreen(slug: s.pathParameters['slug']!)),
      GoRoute(parentNavigatorKey: _rootKey, path: '/cart', builder: (c, s) => const CartScreen()),
      GoRoute(parentNavigatorKey: _rootKey, path: '/checkout', builder: (c, s) => const CheckoutScreen()),
      GoRoute(parentNavigatorKey: _rootKey, path: '/order/:id', builder: (c, s) => OrderDetailScreen(id: int.parse(s.pathParameters['id']!))),
      GoRoute(parentNavigatorKey: _rootKey, path: '/chat/:id', builder: (c, s) => ChatScreen(conversationId: int.parse(s.pathParameters['id']!), title: s.extra as String?)),
      GoRoute(parentNavigatorKey: _rootKey, path: '/wishlist', builder: (c, s) => const WishlistScreen()),
      GoRoute(parentNavigatorKey: _rootKey, path: '/settings', builder: (c, s) => const SettingsScreen()),
    ],
  );
});
