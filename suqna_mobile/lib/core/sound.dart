import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Plays the in-app message notification sound.
///
/// Used by the chat screen and the global unread poller whenever a new incoming
/// message is detected.
class MessageSound {
  final AudioPlayer _player = AudioPlayer(playerId: 'suqna-msg');
  bool muted = false;

  Future<void> play() async {
    if (muted) return;
    try {
      await _player.stop();
      await _player.play(AssetSource('sounds/message.wav'), volume: 0.9);
    } catch (_) {
      // Audio may be unavailable on some platforms/CI — never crash the UI.
    }
  }

  void dispose() => _player.dispose();
}

final messageSoundProvider = Provider<MessageSound>((ref) {
  final s = MessageSound();
  ref.onDispose(s.dispose);
  return s;
});
