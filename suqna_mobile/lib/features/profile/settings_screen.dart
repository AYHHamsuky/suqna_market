import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config.dart';
import '../../core/sound.dart';
import '../../core/theme.dart';
import '../auth/session.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});
  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  late final TextEditingController _url;
  bool _mute = false;

  @override
  void initState() {
    super.initState();
    _url = TextEditingController(text: ref.read(sessionProvider).baseUrl);
    _mute = ref.read(prefsProvider).getBool('muteSound') ?? false;
    ref.read(messageSoundProvider).muted = _mute;
  }

  @override
  void dispose() {
    _url.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    await ref.read(sessionProvider.notifier).setBaseUrl(_url.text.trim());
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('API address saved')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        const Text('Message sound', style: TextStyle(fontWeight: FontWeight.w700)),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Play a sound for new messages'),
          value: !_mute,
          activeThumbColor: Brand.ember,
          onChanged: (on) {
            setState(() => _mute = !on);
            ref.read(messageSoundProvider).muted = _mute;
            ref.read(prefsProvider).setBool('muteSound', _mute);
            if (on) ref.read(messageSoundProvider).play();
          },
        ),
        const Divider(height: 32),
        const Text('API address', style: TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 4),
        const Text('Point the app at your Suqna backend.', style: TextStyle(color: Brand.muted, fontSize: 13)),
        const SizedBox(height: 10),
        TextField(controller: _url, decoration: const InputDecoration(hintText: 'http://host:8000/api/v1')),
        const SizedBox(height: 10),
        Wrap(spacing: 8, runSpacing: 8, children: [
          for (final entry in AppConfig.presets.entries)
            ActionChip(
              label: Text(entry.key, style: const TextStyle(fontSize: 12)),
              onPressed: () => setState(() => _url.text = entry.value),
            ),
        ]),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _save, child: const Text('Save')),
      ]),
    );
  }
}
