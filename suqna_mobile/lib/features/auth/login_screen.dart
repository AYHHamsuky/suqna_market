import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api.dart';
import '../../core/config.dart';
import '../../core/theme.dart';
import 'session.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _login = TextEditingController(text: 'customer@suqna.ng');
  final _password = TextEditingController(text: 'password');
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _login.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(sessionProvider.notifier).login(_login.text.trim(), _password.text);
      if (mounted) context.go('/');
    } catch (e) {
      setState(() => _error = apiError(e, 'Could not sign in'));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _serverDialog() async {
    final ctrl = TextEditingController(text: ref.read(sessionProvider).baseUrl);
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Server settings'),
        content: StatefulBuilder(
          builder: (context, setLocal) => Column(mainAxisSize: MainAxisSize.min, children: [
            const Text('Point the app at your Suqna backend.', style: TextStyle(color: Brand.muted, fontSize: 13)),
            const SizedBox(height: 12),
            TextField(controller: ctrl, decoration: const InputDecoration(hintText: 'http://host:8000/api/v1')),
            const SizedBox(height: 10),
            Wrap(spacing: 8, runSpacing: 8, children: [
              for (final e in AppConfig.presets.entries)
                ActionChip(label: Text(e.key, style: const TextStyle(fontSize: 11)), onPressed: () => setLocal(() => ctrl.text = e.value)),
            ]),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Save')),
        ],
      ),
    );
    if (saved == true) {
      await ref.read(sessionProvider.notifier).setBaseUrl(ctrl.text.trim());
      if (mounted) {
        setState(() => _error = null);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Server address saved')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.go('/welcome')),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                const SuqnaWordmark(size: 44),
                const SizedBox(height: 8),
                Text('Welcome back', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
                const Text('Sign in to your Suqna account', style: TextStyle(color: Brand.muted)),
                const SizedBox(height: 24),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                      if (_error != null)
                        Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: const Color(0xFFFDEDED), borderRadius: BorderRadius.circular(8)),
                          child: Text(_error!, style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 13)),
                        ),
                      const Text('Email or phone', style: TextStyle(fontWeight: FontWeight.w500, color: Brand.muted)),
                      const SizedBox(height: 6),
                      TextField(controller: _login, keyboardType: TextInputType.emailAddress),
                      const SizedBox(height: 14),
                      const Text('Password', style: TextStyle(fontWeight: FontWeight.w500, color: Brand.muted)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _password,
                        obscureText: _obscure,
                        onSubmitted: (_) => _submit(),
                        decoration: InputDecoration(
                          suffixIcon: IconButton(
                            icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      ElevatedButton(
                        onPressed: _loading ? null : _submit,
                        child: _loading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Sign in'),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => context.go('/register'),
                        child: const Text('New here? Create a customer account'),
                      ),
                    ]),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Brand.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: Brand.line)),
                  child: const Column(children: [
                    Text('Demo login (password: password)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                    Text('customer@suqna.ng', style: TextStyle(color: Brand.muted, fontSize: 12)),
                  ]),
                ),
                TextButton.icon(
                  onPressed: _serverDialog,
                  icon: const Icon(Icons.dns_outlined, size: 16),
                  label: const Text('Server settings'),
                  style: TextButton.styleFrom(foregroundColor: Brand.muted),
                ),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}
