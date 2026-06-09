import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api.dart';
import '../../core/sound.dart';
import '../auth/session.dart';
import '../data.dart';

/// Polls conversations app-wide; plays the notification sound when the total
/// unread count rises (a new incoming message arrived in any thread).
final unreadProvider = NotifierProvider<UnreadController, int>(UnreadController.new);

class UnreadController extends Notifier<int> {
  Timer? _timer;
  int _prev = -1;

  @override
  int build() {
    ref.onDispose(() => _timer?.cancel());
    return 0;
  }

  void start() {
    if (_timer != null) return;
    _poll();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _poll());
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _prev = -1;
    state = 0;
  }

  /// Call after opening a thread so its read messages are reflected immediately.
  Future<void> refresh() => _poll();

  Future<void> _poll() async {
    if (!ref.read(sessionProvider).isAuthed) return;
    try {
      final res = await ref.read(apiProvider).dio.get('/conversations');
      final raw = (res.data is Map && res.data['data'] != null) ? res.data['data'] : res.data;
      int total = 0;
      if (raw is List) {
        for (final c in raw) {
          total += ((c['unread_count'] ?? 0) as num).toInt();
        }
      }
      if (_prev >= 0 && total > _prev) {
        ref.read(messageSoundProvider).play();
      }
      _prev = total;
      if (total != state) state = total;
      ref.invalidate(conversationsProvider);
    } catch (_) {/* offline / transient */}
  }
}
